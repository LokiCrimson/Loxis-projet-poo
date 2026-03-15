from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import date
from common.permissions import IsAdminRole, IsOwnerRole, IsTenantRole
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
        if hasattr(user, 'role') and user.role == 'locataire':
            return RentPayment.objects.filter(bail__locataire__user=user)
        qs = RentPayment.objects.all()
        # Add filters
        return qs

    def perform_create(self, serializer):
        record_rent_payment(
            lease_id=self.request.data['bail_id'],
            data=serializer.validated_data,
            recorded_by=self.request.user
        )


class RentPaymentDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RentPaymentSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'role') and user.role == 'locataire':
            return RentPayment.objects.filter(bail__locataire__user=user)
        return RentPayment.objects.all()


class ReceiptDownloadView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        payment = RentPayment.objects.get(id=pk)
        if hasattr(request.user, 'role') and request.user.role == 'locataire' and payment.bail.locataire.user != request.user:
            return Response(status=403)
        receipt = payment.receipt
        # Return PDF file
        return Response({'pdf_url': receipt.pdf_url})


class ResendReceiptView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole | IsOwnerRole]

    def post(self, request, pk):
        payment = RentPayment.objects.get(id=pk)
        payment.receipt.envoyer_email()
        return Response({'message': 'Quittance renvoyée'})


class UnpaidPaymentsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole | IsOwnerRole]
    serializer_class = RentPaymentSerializer

    def get_queryset(self):
        return get_all_unpaid_payments()


class ExpenseListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole | IsOwnerRole]
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        return Expense.objects.all()

    def perform_create(self, serializer):
        record_expense(
            property_id=self.request.data['bien_id'],
            data=serializer.validated_data,
            created_by=self.request.user
        )


class FinancialReportView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole | IsOwnerRole]
    serializer_class = FinancialSummarySerializer

    def get_object(self):
        property_id = self.kwargs['property_id']
        year = self.request.query_params.get('year', date.today().year)
        return get_financial_summary_for_property(property_id, year)


class ExportView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole | IsOwnerRole]

    def get(self, request):
        # Generate CSV
        # Implementation needed
        return Response({'message': 'Export not implemented'})
