from rest_framework import serializers
from .models import RentPayment, Receipt, ExpenseCategory, Expense


class RentPaymentSerializer(serializers.ModelSerializer):
    locataire = serializers.CharField(source='bail.locataire.last_name', read_only=True)
    bien_reference = serializers.CharField(source='bail.bien.reference', read_only=True)
    moyen_display = serializers.CharField(source='get_moyen_display', read_only=True)

    class Meta:
        model = RentPayment
        fields = '__all__'


class RentPaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RentPayment
        fields = ['periode_mois', 'periode_annee', 'montant_paye', 'date_paiement', 'moyen', 'reference', 'commentaire', 'bail', 'montant_attendu']
        extra_kwargs = {
            'bail': {'required': False},
            'reference': {'required': False, 'allow_blank': True},
            'montant_attendu': {'required': False}
        }

    def validate_periode_mois(self, value):
        if not (1 <= value <= 12):
            raise serializers.ValidationError("Le mois doit être entre 1 et 12.")
        return value

    def validate_montant_paye(self, value):
        if value < 0:
            raise serializers.ValidationError("Le montant payé ne peut pas être négatif.")
        return value


class ReceiptSerializer(serializers.ModelSerializer):
    locataire_nom = serializers.SerializerMethodField()
    bien_reference = serializers.CharField(source='paiement_loyer.bail.bien.reference', read_only=True)
    bien_adresse = serializers.CharField(source='paiement_loyer.bail.bien.address', read_only=True)
    periode = serializers.SerializerMethodField()
    montant_total = serializers.DecimalField(max_digits=12, decimal_places=0)
    
    class Meta:
        model = Receipt
        fields = '__all__'

    def get_locataire_nom(self, obj):
        locataire = obj.paiement_loyer.bail.locataire
        if locataire:
            return f"{locataire.first_name} {locataire.last_name}"
        return ""

    def get_periode(self, obj):
        return f"{obj.paiement_loyer.periode_mois}/{obj.paiement_loyer.periode_annee}"


class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = '__all__'


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'


class FinancialSummarySerializer(serializers.Serializer):
    total_loyers_attendus = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_loyers_percus = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_impayes = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_depenses = serializers.DecimalField(max_digits=10, decimal_places=2)
    solde = serializers.DecimalField(max_digits=10, decimal_places=2)
    detail_mensuel = serializers.ListField()
