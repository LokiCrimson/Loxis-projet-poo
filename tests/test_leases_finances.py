from decimal import Decimal
from datetime import date

from django.test import TestCase
from rest_framework.test import APIClient

from apps.core.models import Alert, AuditLog
from apps.finances.models import Expense, ExpenseCategory, RentPayment, StatutPaiementEnum
from apps.finances.selectors import get_debt_for_lease, get_financial_summary_for_property
from apps.finances.services import record_rent_payment
from apps.leases.models import Lease, StatutBailEnum
from apps.properties.models import Property, PropertyCategory, PropertyType, StatutBienEnum
from apps.users.models import TenantProfile, User


class BaseRentalDataMixin:
    def setUp(self):
        self.admin = User.objects.create_user(
            email='admin@example.com',
            username='admin',
            password='pass1234',
            first_name='Admin',
            last_name='User',
            role=User.Role.ADMIN,
        )
        self.owner = User.objects.create_user(
            email='owner@example.com',
            username='owner',
            password='pass1234',
            first_name='Owner',
            last_name='One',
            role=User.Role.OWNER,
        )
        self.owner_2 = User.objects.create_user(
            email='owner2@example.com',
            username='owner2',
            password='pass1234',
            first_name='Owner',
            last_name='Two',
            role=User.Role.OWNER,
        )
        self.tenant_user = User.objects.create_user(
            email='tenant@example.com',
            username='tenant',
            password='pass1234',
            first_name='Tenant',
            last_name='User',
            role=User.Role.TENANT,
        )

        self.tenant_profile = TenantProfile.objects.create(
            user=self.tenant_user,
            first_name='Tenant',
            last_name='User',
            email='tenant.profile@example.com',
            phone='0102030405',
            id_type='CNI',
            id_number='ID-001',
        )

        category = PropertyCategory.objects.create(name='Appartement')
        p_type = PropertyType.objects.create(category=category, name='T2')

        self.property = Property.objects.create(
            owner=self.owner,
            category=category,
            property_type=p_type,
            reference='PROP-001',
            status=StatutBienEnum.VACANT,
            address='1 rue de Paris',
            city='Paris',
            zip_code='75001',
            surface_area=Decimal('45.00'),
            rooms_count=2,
            description='Bien test',
            base_rent_hc=Decimal('700.00'),
            base_charges=Decimal('50.00'),
            guarantee_deposit=Decimal('700.00'),
        )

        self.property_2 = Property.objects.create(
            owner=self.owner_2,
            category=category,
            property_type=p_type,
            reference='PROP-002',
            status=StatutBienEnum.VACANT,
            address='2 rue de Lyon',
            city='Lyon',
            zip_code='69001',
            surface_area=Decimal('40.00'),
            rooms_count=2,
            description='Bien test 2',
            base_rent_hc=Decimal('650.00'),
            base_charges=Decimal('60.00'),
            guarantee_deposit=Decimal('650.00'),
        )

        self.lease = Lease.objects.create(
            bien=self.property,
            locataire=self.tenant_profile,
            date_debut=date(2026, 1, 1),
            date_fin=date(2026, 12, 31),
            loyer_initial=Decimal('700.00'),
            loyer_actuel=Decimal('700.00'),
            charges=Decimal('50.00'),
            depot_garantie_verse=Decimal('700.00'),
            jour_paiement=5,
            statut=StatutBailEnum.ACTIF,
        )
        self.property.status = StatutBienEnum.LOUE
        self.property.save(update_fields=['status'])


class FinanceSelectorTests(BaseRentalDataMixin, TestCase):
    def test_get_debt_for_lease_includes_impaye_and_partiel(self):
        impaye = RentPayment.objects.create(
            bail=self.lease,
            enregistre_par=self.admin,
            periode_mois=1,
            periode_annee=2026,
            montant_attendu=Decimal('750.00'),
            montant_paye=Decimal('0.00'),
            reste_a_payer=Decimal('750.00'),
            date_paiement=date(2026, 1, 10),
            moyen='virement',
            statut=StatutPaiementEnum.IMPAYE,
        )
        RentPayment.objects.filter(id=impaye.id).update(statut=StatutPaiementEnum.IMPAYE)
        RentPayment.objects.create(
            bail=self.lease,
            enregistre_par=self.admin,
            periode_mois=2,
            periode_annee=2026,
            montant_attendu=Decimal('750.00'),
            montant_paye=Decimal('500.00'),
            reste_a_payer=Decimal('250.00'),
            date_paiement=date(2026, 2, 10),
            moyen='virement',
            statut=StatutPaiementEnum.PARTIEL,
        )

        debt = get_debt_for_lease(self.lease.id)
        self.assertEqual(debt, Decimal('1000.00'))

    def test_financial_summary_returns_expected_totals(self):
        RentPayment.objects.create(
            bail=self.lease,
            enregistre_par=self.admin,
            periode_mois=1,
            periode_annee=2026,
            montant_attendu=Decimal('750.00'),
            montant_paye=Decimal('750.00'),
            reste_a_payer=Decimal('0.00'),
            date_paiement=date(2026, 1, 10),
            moyen='virement',
            statut=StatutPaiementEnum.PAYE,
        )
        RentPayment.objects.create(
            bail=self.lease,
            enregistre_par=self.admin,
            periode_mois=2,
            periode_annee=2026,
            montant_attendu=Decimal('750.00'),
            montant_paye=Decimal('600.00'),
            reste_a_payer=Decimal('150.00'),
            date_paiement=date(2026, 2, 10),
            moyen='virement',
            statut=StatutPaiementEnum.PARTIEL,
        )

        category = ExpenseCategory.objects.create(nom='Entretien')
        Expense.objects.create(
            bien=self.property,
            categorie=category,
            enregistre_par=self.admin,
            libelle='Plomberie',
            montant=Decimal('200.00'),
            date_depense=date(2026, 2, 15),
        )

        summary = get_financial_summary_for_property(self.property.id, 2026)
        self.assertEqual(summary['total_loyers_attendus'], Decimal('1500.00'))
        self.assertEqual(summary['total_loyers_percus'], Decimal('1350.00'))
        self.assertEqual(summary['total_impayes'], Decimal('150.00'))
        self.assertEqual(summary['total_depenses'], Decimal('200.00'))
        self.assertEqual(summary['solde'], Decimal('1150.00'))
        self.assertEqual(len(summary['detail_mensuel']), 12)


class FinanceServiceTests(BaseRentalDataMixin, TestCase):
    def test_record_rent_payment_creates_audit_and_alert_for_partial(self):
        payment = record_rent_payment(
            lease_id=self.lease.id,
            data={
                'periode_mois': 3,
                'periode_annee': 2026,
                'montant_paye': Decimal('300.00'),
                'date_paiement': date(2026, 3, 10),
                'moyen': 'virement',
                'reference': 'PAY-001',
                'commentaire': 'Paiement partiel',
            },
            recorded_by=self.admin,
        )

        self.assertEqual(payment.statut, StatutPaiementEnum.PARTIEL)
        self.assertTrue(
            AuditLog.objects.filter(entity_name='RentPayment', entity_id=str(payment.id), action=AuditLog.ActionType.PAYMENT).exists()
        )
        self.assertTrue(
            Alert.objects.filter(alert_type=Alert.AlertType.UNPAID_RENT, related_entity_type='RentPayment', related_entity_id=str(payment.id)).exists()
        )


class ApiPermissionTests(BaseRentalDataMixin, TestCase):
    def setUp(self):
        super().setUp()
        self.client = APIClient()

        self.lease_other_owner = Lease.objects.create(
            bien=self.property_2,
            locataire=self.tenant_profile,
            date_debut=date(2026, 2, 1),
            date_fin=date(2026, 12, 31),
            loyer_initial=Decimal('650.00'),
            loyer_actuel=Decimal('650.00'),
            charges=Decimal('60.00'),
            depot_garantie_verse=Decimal('650.00'),
            jour_paiement=7,
            statut=StatutBailEnum.ACTIF,
        )

        RentPayment.objects.create(
            bail=self.lease,
            enregistre_par=self.admin,
            periode_mois=1,
            periode_annee=2026,
            montant_attendu=Decimal('750.00'),
            montant_paye=Decimal('750.00'),
            reste_a_payer=Decimal('0.00'),
            date_paiement=date(2026, 1, 10),
            moyen='virement',
            statut=StatutPaiementEnum.PAYE,
        )
        RentPayment.objects.create(
            bail=self.lease_other_owner,
            enregistre_par=self.admin,
            periode_mois=1,
            periode_annee=2026,
            montant_attendu=Decimal('710.00'),
            montant_paye=Decimal('710.00'),
            reste_a_payer=Decimal('0.00'),
            date_paiement=date(2026, 1, 11),
            moyen='virement',
            statut=StatutPaiementEnum.PAYE,
        )

    def test_owner_only_sees_his_leases(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.get('/api/baux/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['bien']['reference'], 'PROP-001')

    def test_owner_only_sees_his_payments(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.get('/api/finances/paiements/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['bail']['reference'], self.lease.reference)

    def test_tenant_cannot_access_another_owner_report(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.get(f'/api/finances/rapport/{self.property_2.id}/')
        self.assertEqual(response.status_code, 404)
