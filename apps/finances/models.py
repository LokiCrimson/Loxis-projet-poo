from django.db import models
from django.core.exceptions import ValidationError
from datetime import date
from apps.users.models import User


class MoyenPaiementEnum(models.TextChoices):
    VIREMENT = "virement", "Virement"
    CHEQUE = "cheque", "Chèque"
    ESPECES = "especes", "Espèces"
    MOBILE_MONEY = "mobile_money", "Mobile Money"


class StatutPaiementEnum(models.TextChoices):
    EN_ATTENTE = "en_attente", "En attente"
    PAYE = "paye", "Payé"
    PARTIEL = "partiel", "Partiel"
    IMPAYE = "impaye", "Impayé"


class RentPayment(models.Model):
    bail = models.ForeignKey('leases.Lease', on_delete=models.CASCADE, related_name='rent_payments')
    enregistre_par = models.ForeignKey(User, on_delete=models.CASCADE)
    periode_mois = models.PositiveIntegerField()
    periode_annee = models.PositiveIntegerField()
    montant_attendu = models.DecimalField(max_digits=10, decimal_places=2)
    montant_paye = models.DecimalField(max_digits=10, decimal_places=2)
    reste_a_payer = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    date_paiement = models.DateField()
    reference = models.CharField(max_length=100, null=True, blank=True)
    moyen = models.CharField(max_length=20, choices=MoyenPaiementEnum.choices)
    statut = models.CharField(max_length=20, choices=StatutPaiementEnum.choices, default=StatutPaiementEnum.EN_ATTENTE)
    commentaire = models.TextField(null=True, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    def calculer_statut(self):
        if self.montant_paye >= self.montant_attendu:
            self.statut = StatutPaiementEnum.PAYE
        elif self.montant_paye > 0:
            self.statut = StatutPaiementEnum.PARTIEL
        else:
            self.statut = StatutPaiementEnum.EN_ATTENTE
        self.reste_a_payer = self.montant_attendu - self.montant_paye

    def save(self, *args, **kwargs):
        self.calculer_statut()
        super().save(*args, **kwargs)

    def reporter_dette(self):
        # Logic to report debt to next month
        if self.reste_a_payer > 0:
            next_month = self.periode_mois % 12 + 1
            next_year = self.periode_annee + (1 if self.periode_mois == 12 else 0)
            # Create new RentPayment for next month with remaining amount
            RentPayment.objects.create(
                bail=self.bail,
                enregistre_par=self.enregistre_par,
                periode_mois=next_month,
                periode_annee=next_year,
                montant_attendu=self.reste_a_payer,
                montant_paye=0,
                reste_a_payer=self.reste_a_payer,
                statut=StatutPaiementEnum.EN_ATTENTE,
                date_paiement=self.date_paiement,
                moyen=self.moyen,
                commentaire=f"Report de dette depuis {self.periode_mois}/{self.periode_annee}"
            )

    class Meta:
        unique_together = ('bail', 'periode_mois', 'periode_annee')
        verbose_name = "Paiement de loyer"
        verbose_name_plural = "Paiements de loyer"


class Receipt(models.Model):
    paiement_loyer = models.OneToOneField(RentPayment, on_delete=models.CASCADE, related_name='receipt')
    numero = models.CharField(max_length=20, unique=True)
    montant_loyer = models.DecimalField(max_digits=10, decimal_places=2)
    montant_charges = models.DecimalField(max_digits=10, decimal_places=2)
    montant_total = models.DecimalField(max_digits=10, decimal_places=2)
    date_emission = models.DateField(auto_now_add=True)
    pdf_url = models.URLField(null=True, blank=True)
    envoyee = models.BooleanField(default=False)
    date_envoi = models.DateField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.numero:
            year = date.today().year
            last = Receipt.objects.filter(numero__startswith=f'QUIT-{year}-').order_by('-numero').first()
            seq = 1
            if last:
                seq = int(last.numero.split('-')[-1]) + 1
            self.numero = f'QUIT-{year}-{seq:05d}'
        super().save(*args, **kwargs)

    def generer_pdf(self):
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter
        from io import BytesIO
        from django.core.files.base import ContentFile
        import os

        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter

        # Title
        p.setFont("Helvetica-Bold", 16)
        p.drawString(100, height - 50, "Quittance de Loyer")

        # Details
        p.setFont("Helvetica", 12)
        p.drawString(100, height - 80, f"Numéro: {self.numero}")
        p.drawString(100, height - 100, f"Locataire: {self.paiement_loyer.bail.locataire.user.get_full_name()}")
        p.drawString(100, height - 120, f"Bien: {self.paiement_loyer.bail.bien.nom}")
        p.drawString(100, height - 140, f"Période: {self.paiement_loyer.periode_mois}/{self.paiement_loyer.periode_annee}")
        p.drawString(100, height - 160, f"Montant Loyer: {self.montant_loyer} €")
        p.drawString(100, height - 180, f"Montant Charges: {self.montant_charges} €")
        p.drawString(100, height - 200, f"Montant Total: {self.montant_total} €")
        p.drawString(100, height - 220, f"Date d'émission: {self.date_emission}")

        p.showPage()
        p.save()

        buffer.seek(0)
        file_name = f"quittance_{self.numero}.pdf"
        self.pdf_url = f"/media/receipts/{file_name}"  # Assuming media setup
        # For simplicity, we set the url, but in real, save to file
        # self.pdf_file.save(file_name, ContentFile(buffer.read()), save=False)
        self.save()

    def envoyer_email(self):
        # Logic to send email
        self.envoyee = True
        self.date_envoi = date.today()
        self.save()

    class Meta:
        verbose_name = "Quittance"
        verbose_name_plural = "Quittances"


class ExpenseCategory(models.Model):
    nom = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name = "Catégorie de dépense"
        verbose_name_plural = "Catégories de dépense"


class Expense(models.Model):
    bien = models.ForeignKey('properties.Property', on_delete=models.CASCADE, related_name='expenses')
    bail = models.ForeignKey('leases.Lease', on_delete=models.CASCADE, null=True, blank=True, related_name='expenses')
    categorie = models.ForeignKey(ExpenseCategory, on_delete=models.CASCADE)
    enregistre_par = models.ForeignKey(User, on_delete=models.CASCADE)
    libelle = models.CharField(max_length=200)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    date_depense = models.DateField()
    fournisseur = models.CharField(max_length=100, null=True, blank=True)
    justificatif_url = models.URLField(null=True, blank=True)
    deductible = models.BooleanField(default=False)
    date_creation = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.bail and self.bail.bien != self.bien:
            raise ValidationError("Le bail doit appartenir au bien.")

    class Meta:
        verbose_name = "Dépense"
        verbose_name_plural = "Dépenses"
