from django.urls import path
from .apis import (
    LeaseListCreateView, LeaseDetailView, LeaseTerminateView, 
    RentRevisionListCreateView, LeaseToggleSuiviView,
    ReservationListCreateView, ReservationDetailView
)

app_name = 'leases'

urlpatterns = [
    path('', LeaseListCreateView.as_view(), name='lease-list-create-root'),
    path('<int:pk>/', LeaseDetailView.as_view(), name='lease-detail-root'),
    path('<int:pk>/resilier/', LeaseTerminateView.as_view(), name='lease-terminate-root'),
    path('<int:pk>/toggle_suivi/', LeaseToggleSuiviView.as_view(), name='lease-toggle-suivi-root'),
    path('<int:lease_pk>/revisions/', RentRevisionListCreateView.as_view(), name='rent-revision-list-create-root'),

    # Réservations
    path('reservations/', ReservationListCreateView.as_view(), name='reservation-list-create'),
    path('reservations/<int:pk>/', ReservationDetailView.as_view(), name='reservation-detail'),
]
