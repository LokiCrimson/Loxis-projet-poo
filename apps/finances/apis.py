from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from datetime import date
from common.permissions import IsAdminRole, IsOwnerRole
from apps.users.models import User
from .models import RentPayment, Expense
from .serializers import RentPaymentSerializer, RentPaymentCreateSerializer, ReceiptSerializer, ExpenseSerializer, FinancialSummarySerializer
from .services import record_rent_payment, record_expense
from .selectors import get_all_unpaid_payments, get_financial_summary_for_property, get_receipts_for_tenant


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
        payment = record_rent_payment(
            lease_id=self.request.data['bail_id'],
            data=serializer.validated_data,
            recorded_by=self.request.user
        )
        return Response(RentPaymentSerializer(payment).data, status=status.HTTP_201_CREATED)


class RentPaymentDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RentPaymentSerializer

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', None) == User.Role.TENANT:
            return RentPayment.objects.filter(bail__locataire__user=user)
        if getattr(user, 'role', None) == User.Role.OWNER:
            return RentPayment.objects.filter(bail__bien__owner=user)
        return RentPayment.objects.all()


class ReceiptDownloadView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        payment = get_object_or_404(RentPayment.objects.select_related('bail__locataire__user', 'receipt'), id=pk)
        if getattr(request.user, 'role', None) == User.Role.TENANT and payment.bail.locataire.user != request.user:
            return Response(status=403)
        if getattr(request.user, 'role', None) == User.Role.OWNER and payment.bail.bien.owner_id != request.user.id:
            return Response(status=403)

        if not hasattr(payment, 'receipt'):
            return Response({'detail': 'Aucune quittance disponible pour ce paiement.'}, status=status.HTTP_404_NOT_FOUND)

        receipt = payment.receipt
        return Response({'pdf_url': receipt.pdf_url})


class ResendReceiptView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole | IsOwnerRole]

    def post(self, request, pk):
        payment = get_object_or_404(RentPayment, id=pk)
        if getattr(request.user, 'role', None) == User.Role.OWNER and payment.bail.bien.owner_id != request.user.id:
            return Response(status=403)
        payment.receipt.envoyer_email()
        return Response({'message': 'Quittance renvoyée'})


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
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Ne jamais laisser le client définir des champs contrôlés par le serveur
        safe_data = dict(serializer.validated_data)
        for field in ("bien", "bien_id", "enregistre_par", "date_creation"):
            safe_data.pop(field, None)

        expense = record_expense(
            property_id=self.request.data['bien_id'],
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
        year = self.request.query_params.get('year', date.today().year)
        if getattr(self.request.user, 'role', None) == User.Role.OWNER:
            get_object_or_404(Property, id=property_id, owner=self.request.user)
        return get_financial_summary_for_property(property_id, year)


class ExportView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole | IsOwnerRole]

    def get(self, request):
        # Generate CSV
        # Implementation needed
        return Response({'message': 'Export not implemented'})
