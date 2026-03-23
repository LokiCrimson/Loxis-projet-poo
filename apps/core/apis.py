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
        user = self.request.user
        queryset = AuditLog.objects.select_related('user').all()

        role = getattr(user, 'role', None)
        if role == 'TENANT':
            queryset = queryset.filter(user=user)

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
        # Lancer un scan rapide avant de lister (optionnel, mais utile pour l'utilisateur)
        # run_operational_alert_scan() 
        
        queryset = Alert.objects.filter(recipient=self.request.user)

        unread = self.request.query_params.get('unread')
        lu = self.request.query_params.get('lu')
        alert_type = self.request.query_params.get('alert_type')
        type_param = self.request.query_params.get('type')
        priority = self.request.query_params.get('priority')

        if unread in {'1', 'true', 'True'} or lu == 'false':
            queryset = queryset.filter(is_read=False)
        elif lu == 'true':
            queryset = queryset.filter(is_read=True)
            
        final_type = alert_type or type_param
        if final_type:
            queryset = queryset.filter(alert_type=final_type)
            
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

class DashboardResumeApi(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        from apps.properties.models import Property
        from apps.leases.models import Lease
        from apps.finances.models import RentPayment
        from django.db.models import Sum, Q, Count
        from decimal import Decimal
        import datetime

        user = request.user
        today = datetime.date.today()
        
        # Filtre de base selon le rôle
        prop_filter = Q()
        lease_filter = Q(statut='actif')
        pay_filter = Q()
        
        if user.role == 'OWNER':
            prop_filter &= Q(owner=user)
            lease_filter &= Q(bien__owner=user)
            pay_filter &= Q(bail__bien__owner=user)
        
        total_biens = Property.objects.filter(prop_filter).count()
        baux_actifs = Lease.objects.filter(lease_filter).count()
        
        # Revenus collectés ce mois-ci
        revenus_mois = RentPayment.objects.filter(
            pay_filter,
            periode_annee=today.year, 
            periode_mois=today.month
        ).aggregate(total=Sum('montant_paye'))['total'] or Decimal('0')
        
        # Total des impayés (toutes périodes confondues)
        total_impayes = RentPayment.objects.filter(
            pay_filter,
            statut__in=['impaye', 'partiel']
        ).aggregate(total=Sum('reste_a_payer'))['total'] or Decimal('0')

        return Response({
          "total_biens": total_biens,
          "baux_actifs": baux_actifs,
          "revenus_mois": float(revenus_mois),
          "total_impayes": float(total_impayes),
          "taux_occupation": round((baux_actifs / total_biens * 100), 1) if total_biens > 0 else 0
        })

class DashboardRevenueChartApi(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        from apps.finances.models import RentPayment
        from django.db.models import Sum, Q
        from decimal import Decimal
        import datetime

        user = request.user
        year = datetime.date.today().year
        data = []
        mois_noms = ['Jan', 'Féb', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc']
        
        pay_filter = Q(periode_annee=year)
        if user.role == 'OWNER':
            pay_filter &= Q(bail__bien__owner=user)
        
        for i in range(1, 13):
            m_filter = pay_filter & Q(periode_mois=i)
            res = RentPayment.objects.filter(m_filter).aggregate(
                rev=Sum('montant_paye'),
                imp=Sum('reste_a_payer')
            )
            data.append({
                "mois": mois_noms[i-1], 
                "revenus": float(res['rev'] or 0),
                "impayes": float(res['imp'] or 0)
            })
            
        return Response(data)

class DashboardBienStatutsApi(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        from apps.properties.models import Property
        from django.db.models import Count, Q
        
        user = request.user
        qs = Property.objects.all()
        if user.role == 'OWNER':
            qs = qs.filter(owner=user)
            
        stats = qs.aggregate(
            loues=Count('id', filter=Q(status='RENTED')),
            vacants=Count('id', filter=Q(status='AVAILABLE')),
            travaux=Count('id', filter=Q(status='MAINTENANCE'))
        )
        
        return Response([
            {"name": "Loués", "value": stats['loues']},
            {"name": "Vacants", "value": stats['vacants']},
            {"name": "En travaux", "value": stats['travaux']},
        ])
        owner = request.user
        qs = Property.objects.filter(owner=owner)
        return Response({
            "loues": qs.filter(status='RENTED').count(),
            "vacants": qs.filter(status='VACANT').count(),
            "en_travaux": qs.filter(status='UNDER_WORK').count()
        })
