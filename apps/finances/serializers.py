from rest_framework import serializers
from .models import RentPayment, Receipt, ExpenseCategory, Expense


class RentPaymentSerializer(serializers.ModelSerializer):
    bail = serializers.SerializerMethodField()

    class Meta:
        model = RentPayment
        fields = '__all__'

    def get_bail(self, obj):
        return {
            'id': obj.bail.id,
            'reference': obj.bail.reference,
            'bien_adresse': obj.bail.bien.address,  # Assume field
            'locataire_nom': obj.bail.locataire.last_name
        }


class RentPaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RentPayment
        fields = ['periode_mois', 'periode_annee', 'montant_paye', 'date_paiement', 'moyen', 'reference', 'commentaire']

    def validate_periode_mois(self, value):
        if not (1 <= value <= 12):
            raise serializers.ValidationError("Le mois doit être entre 1 et 12.")
        return value

    def validate_montant_paye(self, value):
        if value < 0:
            raise serializers.ValidationError("Le montant payé ne peut pas être négatif.")
        return value


class ReceiptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receipt
        fields = '__all__'


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
