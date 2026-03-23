from django.urls import path
from . import apis

app_name = 'core'

urlpatterns = [
    # CU-05 : Consulter le journal d'audit
    path('journal-audit/', apis.AuditLogListApi.as_view(), name='liste-journal-audit'),

    # CU-11 : Consulter et traiter les alertes
    path('alertes/', apis.AlertListApi.as_view(), name='liste-alertes'),
    path('alertes/<int:alert_id>/marquer-lu/', apis.AlertMarkReadApi.as_view(), name='marquer-alerte-lue'),
    path('alertes/marquer-tout-lu/', apis.AlertMarkAllReadApi.as_view(), name='marquer-toutes-alertes-lues'),
    path('alertes/scan-operationnel/', apis.AlertOperationalScanApi.as_view(), name='scanner-alertes-operationnelles'),
    path('dashboard/stats/', apis.DashboardResumeApi.as_view(), name='dashboard-stats'),
    path('dashboard/revenue-chart/', apis.DashboardRevenueChartApi.as_view(), name='dashboard-revenue-chart'),
    path('dashboard/bien-statuts/', apis.DashboardBienStatutsApi.as_view(), name='dashboard-bien-statuts'),
]