from django.urls import path
from .apis import LeaseListCreateView, LeaseDetailView, LeaseTerminateView, RentRevisionListCreateView

app_name = 'leases'

urlpatterns = [
    path('', LeaseListCreateView.as_view(), name='lease-list-create'),
    path('<int:pk>/', LeaseDetailView.as_view(), name='lease-detail'),
    path('<int:pk>/resilier/', LeaseTerminateView.as_view(), name='lease-terminate'),
    path('<int:lease_pk>/revisions/', RentRevisionListCreateView.as_view(), name='rent-revision-list-create'),
]
