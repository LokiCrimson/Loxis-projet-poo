from django.db.models import Sum
from .models import RentPayment, Expense, Receipt, StatutPaiementEnum


def get_unpaid_periods_for_lease(lease_id: int):
    """Paiements au statut impaye ou partiel pour ce bail."""
    return RentPayment.objects.filter(bail_id=lease_id, statut__in=['impaye', 'partiel'])


def get_payment_history_for_lease(lease_id: int):
    """Tous les paiements d'un bail, ordonnés par période."""
    return RentPayment.objects.filter(bail_id=lease_id).order_by('periode_annee', 'periode_mois')


def get_debt_for_lease(lease_id: int) -> float:
    """Somme totale des reste_a_payer sur ce bail."""
    result = RentPayment.objects.filter(bail_id=lease_id, statut='partiel').aggregate(total=Sum('reste_a_payer'))
    return result['total'] or 0


def get_financial_summary_for_property(property_id: int, year: int) -> dict:
    """
    Retourne :
    {
      "total_loyers_attendus": float,
      "total_loyers_percus": float,
      "total_impayes": float,
      "total_depenses": float,
      "solde": float,           # percus - depenses
      "detail_mensuel": [...]   # liste par mois
    }
    """
    # Implementation needed
    return {}


def get_expenses_by_category(property_id: int, year: int):
    """Dépenses groupées par catégorie pour un bien et une année."""
    return Expense.objects.filter(bien_id=property_id, date_depense__year=year).values('categorie__nom').annotate(total=Sum('montant'))


def get_all_unpaid_payments(owner_id: int = None):
    """
    Tous les paiements impayés ou partiels.
    Si owner_id → filtre sur les biens du propriétaire.
    """
    qs = RentPayment.objects.filter(statut__in=['impaye', 'partiel'])
    if owner_id:
        qs = qs.filter(bail__bien__owner_id=owner_id)
    return qs


def get_receipts_for_tenant(tenant_id: int):
    """Toutes les quittances d'un locataire (via ses baux)."""
    return Receipt.objects.filter(paiement_loyer__bail__locataire_id=tenant_id)
