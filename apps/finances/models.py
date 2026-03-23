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
            self.reste_a_payer = 0
        elif self.montant_paye > 0:
            self.statut = StatutPaiementEnum.PARTIEL
            self.reste_a_payer = self.montant_attendu - self.montant_paye
        else:
            # Aucun paiement enregistré : si la date de paiement prévue est passée,
            # on considère le loyer comme impayé, sinon on le laisse "en attente".
            if self.date_paiement and self.date_paiement < date.today():
                self.statut = StatutPaiementEnum.IMPAYE
            else:
                self.statut = StatutPaiementEnum.EN_ATTENTE
            self.reste_a_payer = self.montant_attendu

    def save(self, *args, **kwargs):
        if not self.reference:
            year = date.today().year
            last = RentPayment.objects.filter(reference__startswith=f'PAY-{year}-').order_by('-id').first()
            seq = 1
            if last and last.reference:
                try:
                    seq = int(last.reference.split('-')[-1]) + 1
                except (ValueError, IndexError):
                    seq = RentPayment.objects.filter(reference__startswith=f'PAY-{year}-').count() + 1
            self.reference = f'PAY-{year}-{seq:05d}'
        self.calculer_statut()
        super().save(*args, **kwargs)

    def reporter_dette(self):
        # Logic to report debt to next month
        if self.reste_a_payer > 0:
            next_month = self.periode_mois % 12 + 1
            next_year = self.periode_annee + (1 if self.periode_mois == 12 else 0)
            # Update or create RentPayment for next month with remaining amount
            next_payment, created = RentPayment.objects.get_or_create(
                bail=self.bail,
                periode_mois=next_month,
                periode_annee=next_year,
                defaults={
                    "enregistre_par": self.enregistre_par,
                    "montant_attendu": self.reste_a_payer,
                    "montant_paye": 0,
                    "date_paiement": self.date_paiement,
                    "moyen": self.moyen,
                    "commentaire": f"Report de dette depuis {self.periode_mois}/{self.periode_annee}",
                },
            )
            if not created:
                # Increment the expected amount with the remaining debt
                next_payment.montant_attendu += self.reste_a_payer
                # Preserve or update the comment to trace the carry-over
                additional_comment = f" | Report de dette depuis {self.periode_mois}/{self.periode_annee}"
                if next_payment.commentaire:
                    if additional_comment not in next_payment.commentaire:
                        next_payment.commentaire += additional_comment
                else:
                    next_payment.commentaire = additional_comment
            # Recalculate status and remaining amount consistently
            next_payment.save()

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
        from reportlab.lib import colors
        from reportlab.platypus import Table, TableStyle
        from io import BytesIO
        from django.core.files.base import ContentFile
        from django.core.files.storage import default_storage
        from django.conf import settings
        import os

        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter

        # Header / Logo Placeholder
        p.setFont("Helvetica-Bold", 20)
        p.drawCentredString(width/2, height - 50, "QUITTANCE DE LOYER")
        
        p.setFont("Helvetica", 10)
        p.drawString(50, height - 80, f"Quittance N° : {self.numero}")
        p.drawString(50, height - 95, f"Date d'émission : {self.date_emission.strftime('%d/%m/%Y')}")

        # Infos Bail / Locataire
        locataire = self.paiement_loyer.bail.locataire
        locataire_nom = f"{locataire.first_name} {locataire.last_name}" if locataire else "N/A"
        bien = self.paiement_loyer.bail.bien

        p.setFont("Helvetica-Bold", 12)
        p.drawString(50, height - 130, "PROPRIÉTAIRE")
        p.setFont("Helvetica", 11)
        p.drawString(50, height - 145, f"{bien.owner.first_name} {bien.owner.last_name}")
        p.drawString(50, height - 160, f"{bien.address}")

        p.setFont("Helvetica-Bold", 12)
        p.drawString(350, height - 130, "LOCATAIRE")
        p.setFont("Helvetica", 11)
        p.drawString(350, height - 145, f"{locataire_nom}")

        # Tableau Récapitulatif
        data = [
            ['Désignation', 'Période', 'Montant'],
            ['Loyer nu', f"{self.paiement_loyer.periode_mois}/{self.paiement_loyer.periode_annee}", f"{int(self.montant_loyer):,} FCFA".replace(',', ' ')],
            ['Charges provisionnelles', "", f"{int(self.montant_charges):,} FCFA".replace(',', ' ')],
            ['TOTAL PAYÉ', "", f"{int(self.montant_total):,} FCFA".replace(',', ' ')]
        ]

        table = Table(data, colWidths=[250, 100, 150])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -2), colors.whitesmoke),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ]))

        tw, th, = table.wrapOn(p, 50, height - 300)
        table.drawOn(p, 50, height - 250 - th)

        # Signature
        p.setFont("Helvetica-Oblique", 10)
        p.drawString(50, height - 400, "Quittance valant reçu, sous réserve d'encaissement définitif de votre paiement.")
        
        p.setFont("Helvetica-Bold", 12)
        p.drawString(400, height - 450, "Le Propriétaire")

        p.showPage()
        p.save()
        
        pdf_content = buffer.getvalue()
        
        # Sauvegarder
        file_name = f"receipts/Quittance_{self.numero}.pdf"
        if default_storage.exists(file_name):
            default_storage.delete(file_name)
        path = default_storage.save(file_name, ContentFile(pdf_content))
        self.pdf_url = f"{settings.MEDIA_URL}{path}"
        self.save()
        
        buffer.close()
        return pdf_content

    def envoyer_email(self):
        from django.core.mail import EmailMessage
        from django.conf import settings
        
        # Récupération des acteurs
        bail = self.paiement_loyer.bail
        locataire_profile = bail.locataire
        proprietaire = bail.bien.owner
        
        destinataires = []
        if locataire_profile and locataire_profile.email:
            destinataires.append(locataire_profile.email)
        
        if proprietaire and proprietaire.email and proprietaire.email not in destinataires:
            destinataires.append(proprietaire.email)
        
        if not destinataires:
            print("Erreur : Aucun email trouvé pour le locataire ou le propriétaire.")
            return False

        prenom_locataire = locataire_profile.first_name if locataire_profile else "Cher locataire"
        
        subject = f"Quittance de loyer - {self.numero} - {bail.bien.reference}"
        body = f"""Bonjour,

Veuillez trouver ci-joint la quittance de loyer numéro {self.numero} pour la période {self.paiement_loyer.periode_mois}/{self.paiement_loyer.periode_annee}.

Détails du bien : {bail.bien.address}
Locataire : {prenom_locataire}

Ceci est un message automatique de votre plateforme Loxis.

Bien cordialement,
L'équipe Loxis"""

        email = EmailMessage(
            subject,
            body,
            settings.EMAIL_HOST_USER,
            destinataires,
        )
        
        # Générer le PDF et l'attacher
        pdf_content = self.generer_pdf()
        email.attach(f"Quittance_{self.numero}.pdf", pdf_content, "application/pdf")
        
        try:
            email.send(fail_silently=False)
            self.envoyee = True
            self.date_envoi = date.today()
            self.save()
            return True
        except Exception as e:
            print(f"Erreur lors de l'envoi de l'email : {e}")
            return False

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
