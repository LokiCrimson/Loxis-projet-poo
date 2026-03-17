from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from common.permissions import IsAdminRole, IsOwnerRole
from apps.users.models import User
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
        lease = create_lease(
            bien_id=data['bien_id'],
            locataire_id=data['locataire_id'],
            data=data,
            created_by=self.request.user
        )
        return Response(LeaseSerializer(lease).data, status=status.HTTP_201_CREATED)


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
