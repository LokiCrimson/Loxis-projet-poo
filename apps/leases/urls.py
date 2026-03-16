from django.urls import path
from .apis import LeaseListCreateView, LeaseDetailView, LeaseTerminateView, RentRevisionListCreateView

app_name = 'leases'

urlpatterns = [
    path('baux/', LeaseListCreateView.as_view(), name='lease-list-create'),
    path('baux/<int:pk>/', LeaseDetailView.as_view(), name='lease-detail'),
    path('baux/<int:pk>/resilier/', LeaseTerminateView.as_view(), name='lease-terminate'),
    path('baux/<int:lease_pk>/revisions/', RentRevisionListCreateView.as_view(), name='rent-revision-list-create'),
]
