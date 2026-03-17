from django.urls import path
from .apis import (
    RentPaymentListCreateView, RentPaymentDetailView, ReceiptDownloadView,
    ResendReceiptView, UnpaidPaymentsView, ExpenseListCreateView,
    FinancialReportView, ExportView
)

app_name = 'finances'

urlpatterns = [
    path('paiements/', RentPaymentListCreateView.as_view(), name='rent-payment-list-create-root'),
    path('paiements/<int:pk>/', RentPaymentDetailView.as_view(), name='rent-payment-detail-root'),
    path('paiements/<int:pk>/quittance/', ReceiptDownloadView.as_view(), name='receipt-download-root'),
    path('paiements/<int:pk>/renvoyer/', ResendReceiptView.as_view(), name='resend-receipt-root'),
    path('impayes/', UnpaidPaymentsView.as_view(), name='unpaid-payments-root'),
    path('depenses/', ExpenseListCreateView.as_view(), name='expense-list-create-root'),
    path('rapport/<int:property_id>/', FinancialReportView.as_view(), name='financial-report-root'),
    path('export/', ExportView.as_view(), name='export-root'),
]
