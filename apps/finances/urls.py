from django.urls import path
from .apis import (
    RentPaymentListCreateView, RentPaymentDetailView, ReceiptDownloadView,
    ResendReceiptView, UnpaidPaymentsView, ExpenseListCreateView,
    FinancialReportView, ExportView
)

app_name = 'finances'

urlpatterns = [
    path('paiements/', RentPaymentListCreateView.as_view(), name='rent-payment-list-create'),
    path('paiements/<int:pk>/', RentPaymentDetailView.as_view(), name='rent-payment-detail'),
    path('paiements/<int:pk>/quittance/', ReceiptDownloadView.as_view(), name='receipt-download'),
    path('paiements/<int:pk>/renvoyer/', ResendReceiptView.as_view(), name='resend-receipt'),
    path('impayes/', UnpaidPaymentsView.as_view(), name='unpaid-payments'),
    path('depenses/', ExpenseListCreateView.as_view(), name='expense-list-create'),
    path('rapport/<int:property_id>/', FinancialReportView.as_view(), name='financial-report'),
    path('export/', ExportView.as_view(), name='export'),
]
