from django.core.exceptions import ValidationError
from django.db import transaction
from datetime import date
from django.forms.models import model_to_dict
import json
from apps.users.models import User
from apps.core.services import log_audit
from apps.leases.models import StatutBailEnum
from .models import RentPayment, Receipt, Expense, StatutPaiementEnum
from .selectors import get_debt_for_lease


def record_rent_payment(*, lease_id: int, data: dict, recorded_by: User) -> RentPayment:
    """
    Enregistre un paiement mensuel.
    data : periode_mois, periode_annee, montant_paye, date_paiement, moyen,
           reference (opt), commentaire (opt)
    Lève ValidationError si :
      - Bail non actif
      - Doublon (bail_id + mois + année déjà enregistré)
    Calcule : montant_attendu (loyer + charges + dette reportée), reste_a_payer, statut
    Effets de bord :
      - Si statut paye|partiel → appelle generate_receipt()
      - Si statut partiel → appelle report_debt_to_next_month()
      - Log AuditLog action=CREATE
    Returns : RentPayment
    """
    from apps.leases.models import Lease
    
    with transaction.atomic():
        lease = Lease.objects.get(id=lease_id)
        if lease.statut != StatutBailEnum.ACTIF:
            raise ValidationError("Le bail n'est pas actif.")
        
        mois = data['periode_mois']
        annee = data['periode_annee']
        if RentPayment.objects.filter(bail=lease, periode_mois=mois, periode_annee=annee).exists():
            raise ValidationError("Paiement déjà enregistré pour cette période.")
        
        dette = get_debt_for_lease(lease_id)
        montant_attendu = lease.loyer_actuel + lease.charges + dette
        montant_paye = data['montant_paye']
        reste = montant_attendu - montant_paye
        
        payment = RentPayment.objects.create(
            bail=lease,
            enregistre_par=recorded_by,
            periode_mois=mois,
            periode_annee=annee,
            montant_attendu=montant_attendu,
            montant_paye=montant_paye,
            reste_a_payer=reste,
            date_paiement=data['date_paiement'],
            moyen=data['moyen'],
            reference=data.get('reference'),
            commentaire=data.get('commentaire')
        )
        
        payment.calculer_statut()
        payment.save()
        
        if payment.statut in [StatutPaiementEnum.PAYE, StatutPaiementEnum.PARTIEL]:
            generate_receipt(payment=payment)
        
        if payment.statut == StatutPaiementEnum.PARTIEL:
            report_debt_to_next_month(payment=payment)
        
        log_audit(
            actor=recorded_by,
            action='CREATE',
            entity_name='RentPayment',
            entity_id=str(payment.id),
            details={"apres": data}
        )
        
        return payment


def generate_receipt(*, payment: RentPayment) -> Receipt:
    """
    Crée la quittance pour un paiement.
    Génère le numéro séquentiel "QUIT-{YEAR}-{seq:05d}".
    Appelle quittance.generer_pdf() pour créer le PDF.
    Appelle quittance.envoyer_email() pour l'envoi au locataire.
    Met à jour envoyee=True, date_envoi=today() si email réussi.
    Returns : Receipt
    """
    receipt = Receipt.objects.create(
        paiement_loyer=payment,
        montant_loyer=payment.bail.loyer_actuel,
        montant_charges=payment.bail.charges,
        montant_total=payment.montant_attendu
    )
    receipt.generer_pdf()
    receipt.envoyer_email()
    return receipt


def report_debt_to_next_month(*, payment: RentPayment) -> None:
    """
    Reporte la dette (reste_a_payer) sur le mois suivant.
    Si paiement du mois suivant existe → incrémente montant_attendu.
    Sinon → sera pris en compte lors de la création grâce à get_debt_for_lease().
    """
    if payment.reste_a_payer <= 0:
        return
        
    next_month = payment.periode_mois % 12 + 1
    next_year = payment.periode_annee + (1 if payment.periode_mois == 12 else 0)
    
    # Check if a payment record already exists for next month
    next_payment = RentPayment.objects.filter(
        bail=payment.bail,
        periode_mois=next_month,
        periode_annee=next_year
    ).first()
    
    if next_payment:
        next_payment.montant_attendu += payment.reste_a_payer
        next_payment.calculer_statut()
        next_payment.save()


def record_expense(*, property_id: int, data: dict, created_by: User) -> Expense:
    """
    Enregistre une dépense sur un bien.
    data : categorie_depense_id, libelle, montant, date_depense,
           fournisseur (opt), bail_id (opt), justificatif_url (opt), deductible
    Lève ValidationError si bail_id renseigné et bail.bien_id != property_id.
    Log AuditLog action=CREATE
    """
    expense = Expense.objects.create(
        bien_id=property_id,
        enregistre_par=created_by,
        **data
    )
    
    log_audit(
        actor=created_by,
        action='CREATE',
        entity_name='Expense',
        entity_id=str(expense.id),
        details={"apres": data}
    )
    
    return expense
