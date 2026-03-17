from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from common.permissions import IsAdminRole, IsOwnerRole, IsTenantRole
from .models import Lease, RentRevision, StatutBailEnum
from .serializers import LeaseSerializer, LeaseCreateSerializer, LeaseTerminateSerializer, RentRevisionSerializer
from .services import create_lease, terminate_lease, apply_rent_revision


class LeaseListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return LeaseCreateSerializer
        return LeaseSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'role') and user.role == 'TENANT':
            return Lease.objects.filter(locataire__user=user, statut=StatutBailEnum.ACTIF)
        # For admin/owner, filter by query params
        qs = Lease.objects.all()
        if self.request.query_params.get('bien_id'):
            qs = qs.filter(bien_id=self.request.query_params['bien_id'])
        if self.request.query_params.get('locataire_id'):
            qs = qs.filter(locataire_id=self.request.query_params['locataire_id'])
        if self.request.query_params.get('statut'):
            qs = qs.filter(statut=self.request.query_params['statut'])
        return qs

    def perform_create(self, serializer):
        from django.core.exceptions import ValidationError as DjangoValidationError
        from rest_framework.exceptions import ValidationError as DRFValidationError
        try:
            data = serializer.validated_data
            create_lease(
                bien_id=self.request.data.get('bien_id'),
                locataire_id=self.request.data.get('locataire_id'),
                data=data,
                created_by=self.request.user
            )
        except DjangoValidationError as e:
            raise DRFValidationError(e.message)


class LeaseDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LeaseSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'role') and user.role == 'locataire':
            return Lease.objects.filter(locataire__user=user)
        return Lease.objects.all()


class LeaseTerminateView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole | IsOwnerRole]
    serializer_class = LeaseTerminateSerializer

    def post(self, request, pk):
        from django.core.exceptions import ValidationError as DjangoValidationError
        from rest_framework.exceptions import ValidationError as DRFValidationError
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            result = terminate_lease(
                lease_id=pk,
                data=serializer.validated_data,
                terminated_by=request.user
            )
            # Serialize the bail and warning for response if needed
            return Response({"message": "Bail résilié avec succès.", "avertissement_impayes": result['avertissement_impayes']}, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            raise DRFValidationError(e.message)


class RentRevisionListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole | IsOwnerRole]
    serializer_class = RentRevisionSerializer

    def get_queryset(self):
        return RentRevision.objects.filter(bail_id=self.kwargs['lease_pk'])

    def perform_create(self, serializer):
        from django.core.exceptions import ValidationError as DjangoValidationError
        from rest_framework.exceptions import ValidationError as DRFValidationError
        try:
            apply_rent_revision(
                lease_id=self.kwargs['lease_pk'],
                data=serializer.validated_data,
                revised_by=self.request.user
            )
        except DjangoValidationError as e:
            raise DRFValidationError(e.message)
