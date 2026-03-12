from rest_framework.views import APIView
from rest_framework.response import Response

class AuditLogListApi(APIView):
    def get(self, request):
        return Response([])

class AlertListApi(APIView):
    def get(self, request):
        return Response([])

class AlertMarkReadApi(APIView):
    def post(self, request, alert_id):
        return Response({"status": "ok"})
