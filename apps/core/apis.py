from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from common.permissions import IsAdminRole, IsOwnerRole

from .models import Alert, AuditLog
from .serializers import (
    AlertRefreshSerializer,
    AlertSerializer,
    AuditLogSerializer,
)
from .services import mark_alert_as_read, mark_all_alerts_as_read, run_operational_alert_scan


class AuditLogListApi(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AuditLogSerializer

    def get_queryset(self):
        queryset = AuditLog.objects.select_related('user').all()

        if self.request.user.role == 'TENANT':
            queryset = queryset.filter(user=self.request.user)

        action = self.request.query_params.get('action')
        entity = self.request.query_params.get('entity_name')
        severity = self.request.query_params.get('severity')

        if action:
            queryset = queryset.filter(action=action)
        if entity:
            queryset = queryset.filter(entity_name__iexact=entity)
        if severity:
            queryset = queryset.filter(severity=severity)

        return queryset


class AlertListApi(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AlertSerializer

    def get_queryset(self):
        queryset = Alert.objects.filter(recipient=self.request.user)

        unread = self.request.query_params.get('unread')
        alert_type = self.request.query_params.get('alert_type')
        priority = self.request.query_params.get('priority')

        if unread in {'1', 'true', 'True'}:
            queryset = queryset.filter(is_read=False)
        if alert_type:
            queryset = queryset.filter(alert_type=alert_type)
        if priority:
            queryset = queryset.filter(priority=priority)

        return queryset


class AlertMarkReadApi(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, alert_id):
        alert = mark_alert_as_read(alert_id=alert_id, user_id=request.user.id)
        return Response(AlertSerializer(alert).data, status=status.HTTP_200_OK)


class AlertMarkAllReadApi(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        updated = mark_all_alerts_as_read(user_id=request.user.id)
        return Response({'updated_count': updated}, status=status.HTTP_200_OK)


class AlertOperationalScanApi(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole | IsOwnerRole]

    def post(self, request):
        serializer = AlertRefreshSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = run_operational_alert_scan(**serializer.validated_data)
        return Response(result, status=status.HTTP_200_OK)
