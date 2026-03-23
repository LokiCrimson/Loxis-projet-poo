from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from common.permissions import IsAdminRole, IsOwnerRole
from apps.users.models import User
from apps.properties.models import Property
from .models import Lease, RentRevision, Reservation, StatutBailEnum
from .serializers import LeaseSerializer, LeaseCreateSerializer, LeaseTerminateSerializer, RentRevisionSerializer, ReservationSerializer
from .services import create_lease, terminate_lease, apply_rent_revision


class ReservationListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ReservationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.ADMIN:
            return Reservation.objects.all()
        elif user.role == User.Role.OWNER:
            return Reservation.objects.filter(property__owner=user)
        else:
            return Reservation.objects.filter(tenant=user)

    def perform_create(self, serializer):
        from apps.properties.models import StatutBienEnum
        prop_id = self.request.data.get('property')
        prop = Property.objects.get(id=prop_id)
        
        # Logique métier : Un bien ne peut être réservé que s'il est VACANT
        if prop.status != StatutBienEnum.VACANT:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Ce bien n'est pas disponible à la réservation.")
            
        serializer.save(tenant=self.request.user, status=Reservation.Status.PENDING)


class ReservationDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ReservationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.ADMIN:
            return Reservation.objects.all()
        elif user.role == User.Role.OWNER:
            return Reservation.objects.filter(property__owner=user)
        else:
            return Reservation.objects.filter(tenant=user)

    def perform_update(self, serializer):
        instance = serializer.save()
        # Si le propriétaire accepte la réservation, on peut changer le statut du bien
        if self.request.user.role in [User.Role.OWNER, User.Role.ADMIN]:
            if instance.status == Reservation.Status.ACCEPTED:
                from apps.properties.models import StatutBienEnum
                prop = instance.property
                prop.status = StatutBienEnum.RESERVE
                prop.save()


class LeaseListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return LeaseCreateSerializer
        return LeaseSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Lease.objects.select_related('bien', 'locataire').all()

        if getattr(user, 'role', None) == User.Role.TENANT:
            qs = qs.filter(locataire__user=user)
        elif getattr(user, 'role', None) == User.Role.OWNER:
            qs = qs.filter(bien__owner=user)

        if self.request.query_params.get('bien_id'):
            qs = qs.filter(bien_id=self.request.query_params['bien_id'])
        if self.request.query_params.get('locataire_id'):
            qs = qs.filter(locataire_id=self.request.query_params['locataire_id'])
        if self.request.query_params.get('statut'):
            qs = qs.filter(statut=self.request.query_params['statut'])
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            lease = create_lease(
                bien_id=data['bien_id'],
                locataire_id=data['locataire_id'],
                data=data,
                created_by=self.request.user
            )
            return Response(LeaseSerializer(lease).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            from rest_framework.exceptions import ValidationError as DRFValidationError
            from django.core.exceptions import ValidationError as DjangoValidationError
            if isinstance(e, DRFValidationError):
                raise e
            if isinstance(e, DjangoValidationError):
                return Response({"detail": e.messages[0] if hasattr(e, 'messages') else str(e)}, status=status.HTTP_400_BAD_REQUEST)
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class LeaseDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LeaseSerializer

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', None) == User.Role.TENANT:
            return Lease.objects.filter(locataire__user=user)
        if getattr(user, 'role', None) == User.Role.OWNER:
            return Lease.objects.filter(bien__owner=user)
        return Lease.objects.all()

class LeaseToggleSuiviView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole | IsOwnerRole]

    def post(self, request, pk):
        from django.shortcuts import get_object_or_404
        lease = get_object_or_404(Lease, id=pk)
        lease.is_followed = not lease.is_followed
        lease.save(update_fields=['is_followed'])
        return Response({"is_followed": lease.is_followed})


class LeaseTerminateView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole | IsOwnerRole]
    serializer_class = LeaseTerminateSerializer

    def post(self, request, pk):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = terminate_lease(
            lease_id=pk,
            data=serializer.validated_data,
            terminated_by=request.user
        )
        return Response(
            {
                'bail': LeaseSerializer(result['bail']).data,
                'avertissement_impayes': result['avertissement_impayes'],
            },
            status=status.HTTP_200_OK,
        )


class RentRevisionListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole | IsOwnerRole]
    serializer_class = RentRevisionSerializer

    def get_queryset(self):
        queryset = RentRevision.objects.filter(bail_id=self.kwargs['lease_pk'])
        if getattr(self.request.user, 'role', None) == User.Role.OWNER:
            queryset = queryset.filter(bail__bien__owner=self.request.user)
        if getattr(self.request.user, 'role', None) == User.Role.TENANT:
            queryset = queryset.filter(bail__locataire__user=self.request.user)
        return queryset

    def perform_create(self, serializer):
        revision = apply_rent_revision(
            lease_id=self.kwargs['lease_pk'],
            data=serializer.validated_data,
            revised_by=self.request.user
        )
        serializer.instance = revision
