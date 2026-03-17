from django.core.exceptions import ValidationError
from django.db import transaction
from datetime import date
from decimal import Decimal

from apps.core.models import Alert, AuditLog
from apps.core.services import create_alert, log_audit
from apps.users.models import User
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
      - Log AuditLog action=CREATION
    Returns : RentPayment
    """
    from apps.leases.models import Lease, StatutBailEnum

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
        payment.save(update_fields=['statut', 'reste_a_payer'])

        if payment.statut in [StatutPaiementEnum.PAYE, StatutPaiementEnum.PARTIEL]:
            generate_receipt(payment=payment)

        if payment.statut == StatutPaiementEnum.PARTIEL:
            report_debt_to_next_month(payment=payment)

        if payment.statut in [StatutPaiementEnum.PARTIEL, StatutPaiementEnum.IMPAYE] and lease.bien.owner_id:
            create_alert(
                recipient_id=lease.bien.owner_id,
                alert_type=Alert.AlertType.UNPAID_RENT,
                title='Suivi impayé loyer',
                message=f"Paiement {mois}/{annee} pour le bail {lease.reference} en statut {payment.statut}.",
                priority=Alert.Priority.HIGH if payment.statut == StatutPaiementEnum.PARTIEL else Alert.Priority.CRITICAL,
                action_url=f"/api/finances/paiements/{payment.id}/",
                entity_type='RentPayment',
                entity_id=str(payment.id),
            )

        log_audit(
            actor=recorded_by,
            action=AuditLog.ActionType.PAYMENT,
            severity=AuditLog.Severity.WARNING if payment.statut != StatutPaiementEnum.PAYE else AuditLog.Severity.INFO,
            entity_name='RentPayment',
            entity_id=str(payment.id),
            details={
                'lease_id': lease_id,
                'periode_mois': mois,
                'periode_annee': annee,
                'montant_attendu': str(montant_attendu),
                'montant_paye': str(montant_paye),
                'statut': payment.statut,
            },
            source_app='finances',
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
    Sinon → stocke la dette pour application lors de la prochaine création.
    """
    payment.reporter_dette()


def record_expense(*, property_id: int, data: dict, created_by: User) -> Expense:
    """
    Enregistre une dépense sur un bien.
    data : categorie_depense_id, libelle, montant, date_depense,
           fournisseur (opt), bail_id (opt), justificatif_url (opt), deductible
    Lève ValidationError si bail_id renseigné et bail.bien_id != property_id.
    Log AuditLog action=CREATION
    """
    bail = data.get('bail')
    if bail and bail.bien_id != property_id:
        raise ValidationError("Le bail sélectionné ne correspond pas au bien.")

    payload = data.copy()
    expense = Expense.objects.create(
        bien_id=property_id,
        enregistre_par=created_by,
        **payload
    )

    log_audit(
        actor=created_by,
        action=AuditLog.ActionType.CREATE,
        severity=AuditLog.Severity.INFO,
        entity_name='Expense',
        entity_id=str(expense.id),
        details={
            'property_id': property_id,
            'montant': str(payload.get('montant', Decimal('0'))),
            'categorie_id': payload.get('categorie').id if payload.get('categorie') else None,
        },
        source_app='finances',
    )

    return expense
