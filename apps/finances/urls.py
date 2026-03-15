from django.urls import path
from .apis import (
    RentPaymentListCreateView, RentPaymentDetailView, ReceiptDownloadView,
    ResendReceiptView, UnpaidPaymentsView, ExpenseListCreateView,
    FinancialReportView, ExportView
)

urlpatterns = [
    path('finances/paiements/', RentPaymentListCreateView.as_view(), name='rent-payment-list-create'),
    path('finances/paiements/<int:pk>/', RentPaymentDetailView.as_view(), name='rent-payment-detail'),
    path('finances/paiements/<int:pk>/quittance/', ReceiptDownloadView.as_view(), name='receipt-download'),
    path('finances/paiements/<int:pk>/renvoyer/', ResendReceiptView.as_view(), name='resend-receipt'),
    path('finances/impayes/', UnpaidPaymentsView.as_view(), name='unpaid-payments'),
    path('finances/depenses/', ExpenseListCreateView.as_view(), name='expense-list-create'),
    path('finances/rapport/<int:property_id>/', FinancialReportView.as_view(), name='financial-report'),
    path('finances/export/', ExportView.as_view(), name='export'),
]
