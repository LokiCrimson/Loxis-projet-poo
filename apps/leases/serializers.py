from rest_framework import serializers
from .models import Lease, RentRevision, Reservation
from apps.properties.serializers import PropertySerializer


class ReservationSerializer(serializers.ModelSerializer):
    property_details = PropertySerializer(source='property', read_only=True)
    tenant_email = serializers.EmailField(source='tenant.email', read_only=True)
    tenant_name = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = ['id', 'property', 'property_details', 'tenant', 'tenant_email', 'tenant_name', 'status', 'message', 'created_at', 'updated_at']
        read_only_fields = ['tenant', 'status', 'created_at', 'updated_at']

    def get_tenant_name(self, obj):
        return f"{obj.tenant.first_name} {obj.tenant.last_name}"


class LeaseSerializer(serializers.ModelSerializer):
    bien_id = serializers.IntegerField(source='bien.id', read_only=True)
    bien_reference = serializers.CharField(source='bien.reference', read_only=True)
    bien_adresse = serializers.CharField(source='bien.address', read_only=True)
    locataire_nom = serializers.SerializerMethodField()
    retard_info = serializers.JSONField(source='check_retard_statut', read_only=True)
    is_followed = serializers.BooleanField(read_only=True)

    class Meta:
        model = Lease
        fields = '__all__'

    def get_locataire_nom(self, obj):
        return f"{obj.locataire.first_name} {obj.locataire.last_name}"

class LeaseCreateSerializer(serializers.ModelSerializer):
    bien_id = serializers.IntegerField()
    locataire_id = serializers.IntegerField()
    moyen_initial = serializers.CharField(max_length=20, required=False, default='especes', source='moyen_avance')

    class Meta:
        model = Lease
        fields = ['bien_id', 'locataire_id', 'date_debut', 'date_fin', 'loyer_initial', 'loyer_actuel', 'charges', 'depot_garantie_verse', 'jour_paiement', 'etat_lieux_entree_url', 'document_url', 'moyen_initial']

    def validate_jour_paiement(self, value):
        if not (1 <= value <= 28):
            raise serializers.ValidationError("Le jour de paiement doit être entre 1 et 28.")
        return value

    def validate(self, data):
        if data.get('date_fin') and data['date_debut'] >= data['date_fin']:
            raise serializers.ValidationError("La date de fin doit être après la date de début.")
        return data


class LeaseTerminateSerializer(serializers.Serializer):
    motif_fin = serializers.CharField()
    date_sortie_effective = serializers.DateField()
    depot_restitue = serializers.DecimalField(max_digits=10, decimal_places=2)
    depot_retenue_motif = serializers.CharField(required=False)


class RentRevisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RentRevision
        fields = ['id', 'date_revision', 'ancien_loyer', 'nouveau_loyer', 'motif', 'appliquee', 'bail', 'cree_par']
        read_only_fields = ['id', 'ancien_loyer', 'bail', 'cree_par']
