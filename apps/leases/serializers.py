from rest_framework import serializers
from .models import Lease, RentRevision


class LeaseSerializer(serializers.ModelSerializer):
    bien = serializers.SerializerMethodField()
    locataire = serializers.SerializerMethodField()

    class Meta:
        model = Lease
        fields = '__all__'

    def get_bien(self, obj):
        return {
            'id': obj.bien.id,
            'reference': obj.bien.reference,
            'adresse': obj.bien.address  # Assume field exists
        }

    def get_locataire(self, obj):
        return {
            'id': obj.locataire.id,
            'nom': obj.locataire.last_name,
            'prenom': obj.locataire.first_name
        }


class LeaseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lease
        fields = ['date_debut', 'date_fin', 'loyer_initial', 'loyer_actuel', 'charges', 'depot_garantie_verse', 'jour_paiement', 'etat_lieux_entree_url', 'document_url']

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
