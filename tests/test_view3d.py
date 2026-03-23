import shutil
import tempfile
from datetime import date
from decimal import Decimal

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from apps.core.models import AuditLog
from apps.leases.models import Lease, StatutBailEnum
from apps.properties.models import Property, PropertyCategory, PropertyType, StatutBienEnum
from apps.users.models import TenantProfile, User
from apps.view3d.models import Scene3D, SceneViewLog


TEMP_MEDIA_ROOT = tempfile.mkdtemp()


@override_settings(MEDIA_ROOT=TEMP_MEDIA_ROOT)
class View3DApiTests(TestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(TEMP_MEDIA_ROOT, ignore_errors=True)

    def setUp(self):
        self.client = APIClient()

        self.admin = User.objects.create_user(
            email='admin3d@example.com',
            username='admin3d',
            password='pass1234',
            first_name='Admin',
            last_name='ThreeD',
            role=User.Role.ADMIN,
        )
        self.owner = User.objects.create_user(
            email='owner3d@example.com',
            username='owner3d',
            password='pass1234',
            first_name='Owner',
            last_name='ThreeD',
            role=User.Role.OWNER,
        )
        self.owner_2 = User.objects.create_user(
            email='owner3d-2@example.com',
            username='owner3d2',
            password='pass1234',
            first_name='Owner',
            last_name='Second',
            role=User.Role.OWNER,
        )
        self.tenant_user = User.objects.create_user(
            email='tenant3d@example.com',
            username='tenant3d',
            password='pass1234',
            first_name='Tenant',
            last_name='ThreeD',
            role=User.Role.TENANT,
        )
        self.tenant_without_lease = User.objects.create_user(
            email='tenant-no-lease@example.com',
            username='tenantnolease',
            password='pass1234',
            first_name='Tenant',
            last_name='NoLease',
            role=User.Role.TENANT,
        )

        self.tenant_profile = TenantProfile.objects.create(
            user=self.tenant_user,
            first_name='Tenant',
            last_name='ThreeD',
            email='tenant3d.profile@example.com',
            phone='0102030405',
            id_type='CNI',
            id_number='T3D-001',
        )

        category = PropertyCategory.objects.create(name='Appartement 3D')
        property_type = PropertyType.objects.create(category=category, name='T3')

        self.property = Property.objects.create(
            owner=self.owner,
            category=category,
            property_type=property_type,
            reference='PROP-3D-001',
            status=StatutBienEnum.LOUE,
            address='10 rue des Visites',
            city='Paris',
            zip_code='75010',
            surface_area=Decimal('75.00'),
            rooms_count=3,
            description='Appartement avec scene 3D',
            base_rent_hc=Decimal('1200.00'),
            base_charges=Decimal('100.00'),
            guarantee_deposit=Decimal('1200.00'),
        )
        self.property_other_owner = Property.objects.create(
            owner=self.owner_2,
            category=category,
            property_type=property_type,
            reference='PROP-3D-002',
            status=StatutBienEnum.VACANT,
            address='20 rue des Visites',
            city='Lyon',
            zip_code='69002',
            surface_area=Decimal('55.00'),
            rooms_count=2,
            description='Appartement autre proprietaire',
            base_rent_hc=Decimal('900.00'),
            base_charges=Decimal('70.00'),
            guarantee_deposit=Decimal('900.00'),
        )

        self.lease = Lease.objects.create(
            bien=self.property,
            locataire=self.tenant_profile,
            date_debut=date(2026, 1, 1),
            date_fin=date(2026, 12, 31),
            loyer_initial=Decimal('1200.00'),
            loyer_actuel=Decimal('1200.00'),
            charges=Decimal('100.00'),
            depot_garantie_verse=Decimal('1200.00'),
            jour_paiement=5,
            statut=StatutBailEnum.ACTIF,
        )

    def _scene_file(self, name='scene.glb'):
        return SimpleUploadedFile(name, b'fake glb content', content_type='model/gltf-binary')

    def test_owner_can_create_scene_for_owned_property(self):
        self.client.force_authenticate(user=self.owner)

        response = self.client.post(
            '/api/visites-3d/',
            {
                'property_id': self.property.id,
                'title': 'Visite principale',
                'description': 'Scene de demonstration',
                'source_file': self._scene_file(),
            },
            format='multipart',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Scene3D.objects.count(), 1)
        scene = Scene3D.objects.get()
        self.assertEqual(scene.property_id, self.property.id)
        self.assertEqual(scene.created_by_id, self.owner.id)
        self.assertFalse(scene.is_published)
        self.assertTrue(
            AuditLog.objects.filter(entity_name='Scene3D', entity_id=str(scene.id), action=AuditLog.ActionType.CREATE).exists()
        )

    def test_owner_cannot_create_scene_for_other_owner_property(self):
        self.client.force_authenticate(user=self.owner)

        response = self.client.post(
            '/api/visites-3d/',
            {
                'property_id': self.property_other_owner.id,
                'title': 'Intrusion',
                'source_file': self._scene_file(),
            },
            format='multipart',
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(Scene3D.objects.count(), 0)

    def test_tenant_with_active_lease_can_view_published_scene(self):
        scene = Scene3D.objects.create(
            property=self.property,
            created_by=self.owner,
            title='Scene publiee',
            source_file=self._scene_file(),
            file_format=Scene3D.FileFormat.GLB,
            status=Scene3D.Status.READY,
            is_published=True,
        )

        self.client.force_authenticate(user=self.tenant_user)
        response = self.client.get(f'/api/visites-3d/{scene.id}/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['id'], scene.id)
        self.assertEqual(response.data['property']['reference'], self.property.reference)

    def test_tenant_cannot_view_unpublished_scene(self):
        scene = Scene3D.objects.create(
            property=self.property,
            created_by=self.owner,
            title='Scene brouillon',
            source_file=self._scene_file('draft.glb'),
            file_format=Scene3D.FileFormat.GLB,
            status=Scene3D.Status.READY,
            is_published=False,
        )

        self.client.force_authenticate(user=self.tenant_user)
        response = self.client.get(f'/api/visites-3d/{scene.id}/')

        self.assertEqual(response.status_code, 404)

    def test_tenant_without_active_lease_cannot_view_scene(self):
        scene = Scene3D.objects.create(
            property=self.property,
            created_by=self.owner,
            title='Scene reservee',
            source_file=self._scene_file('reserved.glb'),
            file_format=Scene3D.FileFormat.GLB,
            status=Scene3D.Status.READY,
            is_published=True,
        )

        self.client.force_authenticate(user=self.tenant_without_lease)
        response = self.client.get(f'/api/visites-3d/{scene.id}/')

        self.assertEqual(response.status_code, 404)

    def test_publish_scene_creates_audit_log(self):
        scene = Scene3D.objects.create(
            property=self.property,
            created_by=self.owner,
            title='Scene a publier',
            source_file=self._scene_file('publish.glb'),
            file_format=Scene3D.FileFormat.GLB,
            status=Scene3D.Status.READY,
            is_published=False,
        )
        self.client.force_authenticate(user=self.owner)

        response = self.client.post(f'/api/visites-3d/{scene.id}/publier/')

        self.assertEqual(response.status_code, 200)
        scene.refresh_from_db()
        self.assertTrue(scene.is_published)
        self.assertTrue(
            AuditLog.objects.filter(entity_name='Scene3D', entity_id=str(scene.id), action=AuditLog.ActionType.UPDATE).exists()
        )

    def test_view_log_endpoint_creates_view_log(self):
        scene = Scene3D.objects.create(
            property=self.property,
            created_by=self.owner,
            title='Scene log',
            source_file=self._scene_file('log.glb'),
            file_format=Scene3D.FileFormat.GLB,
            status=Scene3D.Status.READY,
            is_published=True,
        )
        self.client.force_authenticate(user=self.tenant_user)

        response = self.client.post(
            f'/api/visites-3d/{scene.id}/journaliser-visionnage/',
            {'duration_seconds': 87},
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(SceneViewLog.objects.count(), 1)
        self.assertEqual(SceneViewLog.objects.get().duration_seconds, 87)