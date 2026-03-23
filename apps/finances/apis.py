from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from datetime import date
from common.permissions import IsAdminRole, IsOwnerRole
from apps.users.models import User
from .models import RentPayment, Expense, ExpenseCategory
from .serializers import (
    RentPaymentSerializer, RentPaymentCreateSerializer, ReceiptSerializer, 
    ExpenseSerializer, FinancialSummarySerializer, ExpenseCategorySerializer
)
from .services import record_rent_payment, record_expense
from .selectors import get_all_unpaid_payments, get_financial_summary_for_property, get_receipts_for_tenant
from rest_framework.exceptions import ValidationError


class RentPaymentListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return RentPaymentCreateSerializer
        return RentPaymentSerializer

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', None) == User.Role.TENANT:
            return RentPayment.objects.filter(bail__locataire__user=user)
        qs = RentPayment.objects.select_related('bail__bien', 'bail__locataire').all()
        if getattr(user, 'role', None) == User.Role.OWNER:
            qs = qs.filter(bail__bien__owner=user)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Extract bail_id safely
        bail_id = request.data.get('bail')
        if not bail_id:
            return Response({"error": "L'ID du bail est requis."}, status=status.HTTP_400_BAD_REQUEST)
            
        payment = record_rent_payment(
            lease_id=bail_id,
            data=serializer.validated_data,
            recorded_by=self.request.user
        )
        return Response(RentPaymentSerializer(payment).data, status=status.HTTP_201_CREATED)


class RentPaymentDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return RentPaymentCreateSerializer
        return RentPaymentSerializer

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', None) == User.Role.TENANT:
            return RentPayment.objects.filter(bail__locataire__user=user)
        if getattr(user, 'role', None) == User.Role.OWNER:
            return RentPayment.objects.filter(bail__bien__owner=user)
        return RentPayment.objects.all()

    def post(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        response = self.update(request, *args, **kwargs)
        if response.status_code == 200:
            payment = self.get_object()
            payment.calculer_statut()
            payment.save(update_fields=['statut', 'reste_a_payer'])
        return response

    def patch(self, request, *args, **kwargs):
        response = self.partial_update(request, *args, **kwargs)
        if response.status_code == 200:
            payment = self.get_object()
            payment.calculer_statut()
            payment.save(update_fields=['statut', 'reste_a_payer'])
        return response


class ReceiptDownloadView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        return self.handle_receipt(request, pk)

    def post(self, request, pk):
        return self.handle_receipt(request, pk)

    def handle_receipt(self, request, pk):
        payment = get_object_or_404(RentPayment.objects.select_related('bail__locataire__user'), id=pk)
        if getattr(request.user, 'role', None) == User.Role.TENANT and payment.bail.locataire.user != request.user:
            return Response(status=403)
        if getattr(request.user, 'role', None) == User.Role.OWNER and payment.bail.bien.owner_id != request.user.id:
            return Response(status=403)

        from .models import Receipt
        receipt, created = Receipt.objects.get_or_create(
            paiement_loyer=payment,
            defaults={
                'montant_loyer': payment.bail.loyer_actuel,
                'montant_charges': payment.bail.charges,
                'montant_total': payment.montant_paye
            }
        )
        
        if not receipt.pdf_url:
            receipt.generer_pdf()

        return Response({'pdf_url': receipt.pdf_url})

class ResendReceiptView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole | IsOwnerRole]

    def post(self, request, pk):
        payment = get_object_or_404(RentPayment, id=pk)
        if getattr(request.user, 'role', None) == User.Role.OWNER and payment.bail.bien.owner_id != request.user.id:
            return Response(status=403)
        
        from .models import Receipt
        receipt, created = Receipt.objects.get_or_create(
            paiement_loyer=payment,
            defaults={
                'montant_loyer': payment.bail.loyer_actuel,
                'montant_charges': payment.bail.charges,
                'montant_total': payment.montant_paye
            }
        )
        
        if not receipt.pdf_url:
            receipt.generer_pdf()
            
        receipt.envoyer_email()
        return Response({'message': 'Quittance générée et renvoyée'})


class UnpaidPaymentsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole | IsOwnerRole]
    serializer_class = RentPaymentSerializer

    def get_queryset(self):
        owner_id = self.request.user.id if getattr(self.request.user, 'role', None) == User.Role.OWNER else None
        return get_all_unpaid_payments(owner_id=owner_id)


class ExpenseListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole | IsOwnerRole]
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        queryset = Expense.objects.select_related('bien', 'categorie').all()
        if getattr(self.request.user, 'role', None) == User.Role.OWNER:
            queryset = queryset.filter(bien__owner=self.request.user)
            
        property_id = self.request.query_params.get('property_id')
        if property_id:
            queryset = queryset.filter(bien_id=property_id)
            
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # On récupère les IDs bruts depuis request.data car le serializer 
        # peut avoir des comportements différents selon sa configuration
        property_id = request.data.get('bien_id')
        category_id = request.data.get('categorie_id')

        if not property_id or not category_id:
            return Response(
                {"error": "bien_id et categorie_id sont requis."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Préparation des données pour record_expense
        # On passe l'ID de la catégorie dans la clé attendue par record_expense
        safe_data = {
            'categorie_id': category_id,
            'libelle': serializer.validated_data.get('libelle'),
            'montant': serializer.validated_data.get('montant'),
            'date_depense': serializer.validated_data.get('date_depense'),
            'fournisseur': serializer.validated_data.get('fournisseur'),
            'deductible': serializer.validated_data.get('deductible', False),
            'justificatif_url': serializer.validated_data.get('justificatif_url'),
        }

        expense = record_expense(
            property_id=property_id,
            data=safe_data,
            created_by=self.request.user
        )
        return Response(ExpenseSerializer(expense).data, status=status.HTTP_201_CREATED)


class FinancialReportView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole | IsOwnerRole]
    serializer_class = FinancialSummarySerializer

    def get_object(self):
        from apps.properties.models import Property

        property_id = self.kwargs['property_id']
        year_param = self.request.query_params.get('year')
        if year_param is None:
            year = date.today().year
        else:
            try:
                year = int(year_param)
            except (TypeError, ValueError):
                raise ValidationError({'year': 'Le paramètre "year" doit être un entier valide.'})
        if getattr(self.request.user, 'role', None) == User.Role.OWNER:
            get_object_or_404(Property, id=property_id, owner=self.request.user)
        return get_financial_summary_for_property(property_id, year)


class ExportView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole | IsOwnerRole]

    def get(self, request):
        # Generate CSV
        # Implementation needed
        return Response({'message': 'Export not implemented'})

class ComptaResumeApi(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        from django.db.models import Sum, Count, Q
        from decimal import Decimal
        from apps.properties.models import Property
        from apps.leases.models import Lease
        from .models import RentPayment

        owner = request.user
        
        # Filtrer uniquement les paiements liés à l'utilisateur
        payments = RentPayment.objects.filter(bail__bien__owner=owner)
        properties = Property.objects.filter(owner=owner)
        active_leases = Lease.objects.filter(bien__owner=owner, statut='actif')

        # Calculer les chiffres financiers (Focus Revenus et Impayés)
        total_revenus = payments.aggregate(total=Sum('montant_paye'))['total'] or Decimal('0')
        # Les impayés sont la somme de ce qui reste à payer sur les mois passés et actuels
        total_impayes = payments.filter(statut__in=['impaye', 'partiel']).aggregate(total=Sum('reste_a_payer'))['total'] or Decimal('0')
        
        # Statistiques d'occupation
        total_props = properties.count()
        rented_props = properties.filter(status='RENTED').count()
        taux_occupation = (rented_props / total_props * 100) if total_props > 0 else 0

        # Nombre de locataires en retard
        locataires_en_retard = payments.filter(statut__in=['impaye', 'partiel']).values('bail__locataire').distinct().count()

        return Response({
          "total_revenus": float(total_revenus),
          "total_depenses": 0.0,
          "total_impayes": float(total_impayes),
          "benefice_net": float(total_revenus),
          "taux_occupation": round(float(taux_occupation), 1),
          "nombre_biens": total_props,
          "nombre_baux_actifs": active_leases.count(),
          "locataires_en_retard": locataires_en_retard,
          "impayes": float(total_impayes)
        })

class ComptaMensuelApi(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        from django.db.models import Sum
        from decimal import Decimal
        from datetime import date
        from .models import RentPayment

        owner = request.user
        year = request.query_params.get('year', date.today().year)
        
        try:
            year = int(year)
        except ValueError:
            year = date.today().year

        mois_noms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
        resultats = []

        for i, nom_mois in enumerate(mois_noms, 1):
            # Revenus (Perçus)
            rev = RentPayment.objects.filter(
                bail__bien__owner=owner,
                periode_mois=i,
                periode_annee=year
            ).aggregate(total=Sum('montant_paye'))['total'] or Decimal('0')

            # Impayés du mois (Ce qui reste à payer)
            imp = RentPayment.objects.filter(
                bail__bien__owner=owner,
                periode_mois=i,
                periode_annee=year,
                statut__in=['impaye', 'partiel']
            ).aggregate(total=Sum('reste_a_payer'))['total'] or Decimal('0')

            resultats.append({
                "mois": nom_mois,
                "revenus": float(rev),
                "depenses": float(imp), # On utilise la colonne dépenses pour afficher les impayés graphiquement
                "impayes": float(imp)
            })

        return Response(resultats)

class ComptaParBienApi(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        from django.db.models import Sum
        from decimal import Decimal
        from apps.properties.models import Property
        from .models import RentPayment, Expense

        owner = request.user
        properties = Property.objects.filter(owner=owner)
        
        resultats = []
        for prop in properties:
            rev = RentPayment.objects.filter(bail__bien=prop).aggregate(total=Sum('montant_paye'))['total'] or Decimal('0')
            dep = Expense.objects.filter(bien=prop).aggregate(total=Sum('montant'))['total'] or Decimal('0')
            
            resultats.append({
                "id": prop.id,
                "bien_reference": prop.reference,
                "adresse": prop.address,
                "revenus": float(rev),
                "depenses": float(dep),
                "benefice": float(rev - dep),
                "status": prop.status
            })

        return Response(resultats)

        import datetime

        owner = request.user
        year = datetime.date.today().year
        
        data = []
        mois_noms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
        
        for i in range(1, 13):
            rev = RentPayment.objects.filter(
                bail__bien__owner=owner, 
                periode_annee=year, 
                periode_mois=i
            ).aggregate(total=Sum('montant_paye'))['total'] or Decimal('0')
            
            exp = Expense.objects.filter(
                bien__owner=owner, 
                date_depense__year=year, 
                date_depense__month=i
            ).aggregate(total=Sum('montant'))['total'] or Decimal('0')
            
            data.append({
                "mois": mois_noms[i-1],
                "revenus": rev,
                "depenses": exp
            })
            
        return Response(data)

class ComptaParBienApi(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        from django.db.models import Sum
        from decimal import Decimal
        from apps.properties.models import Property
        from .models import RentPayment, Expense

        owner = request.user
        properties = Property.objects.filter(owner=owner)
        
        data = []
        for p in properties:
            rev = RentPayment.objects.filter(bail__bien=p).aggregate(total=Sum('montant_paye'))['total'] or Decimal('0')
            exp = Expense.objects.filter(bien=p).aggregate(total=Sum('montant'))['total'] or Decimal('0')
            
            data.append({
                "bien_reference": p.reference,
                "adresse": p.address,
                "revenus": rev,
                "depenses": exp,
                "benefice": rev - exp
            })
            
        return Response(data)

class QuittanceListApi(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ReceiptSerializer
    
    def get_queryset(self):
        user = self.request.user
        # On s'assure que les quittances existent pour les paiements déjà faits
        # Note: Dans une version de prod, on générerait les quittances via un signal ou une tâche
        from .models import Receipt, RentPayment
        
        # Récupérer les paiements du proprio (ou de l'admin)
        payments = RentPayment.objects.all()
        if getattr(user, 'role', None) == User.Role.OWNER:
            payments = payments.filter(bail__bien__owner=user)
        elif getattr(user, 'role', None) == User.Role.TENANT:
            payments = payments.filter(bail__locataire__user=user)
            
        # Créer les quittances manquantes pour les paiements complétés (PAYE) ou partiels
        for p in payments.filter(statut__in=['paye', 'partiel']):
            Receipt.objects.get_or_create(
                paiement_loyer=p,
                defaults={
                    'montant_loyer': p.bail.loyer_actuel,
                    'montant_charges': p.bail.charges,
                    'montant_total': p.montant_paye
                }
            )

        qs = Receipt.objects.select_related('paiement_loyer__bail__bien', 'paiement_loyer__bail__locataire__user').all()
        if getattr(user, 'role', None) == User.Role.OWNER:
            qs = qs.filter(paiement_loyer__bail__bien__owner=user)
        elif getattr(user, 'role', None) == User.Role.TENANT:
            qs = qs.filter(paiement_loyer__bail__locataire__user=user)
        return qs

class QuittanceEmailApi(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        from .models import Receipt
        receipt = get_object_or_404(Receipt, id=pk)
        
        # Vérification des droits (proprio du bien ou admin)
        if getattr(request.user, 'role', None) == User.Role.OWNER:
            if receipt.paiement_loyer.bail.bien.owner_id != request.user.id:
                return Response(status=403)
        elif getattr(request.user, 'role', None) == User.Role.TENANT:
            return Response(status=403)
            
        receipt.envoyer_email()
        return Response({"status": "Email envoyé avec succès"})

class ExpenseCategoryListApi(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ExpenseCategorySerializer
    queryset = ExpenseCategory.objects.all()
