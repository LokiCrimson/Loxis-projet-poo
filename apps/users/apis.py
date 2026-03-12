from rest_framework.views import APIView
from rest_framework.response import Response

class UserListCreateApi(APIView):
    def get(self, request):
        return Response([])

class UserDetailApi(APIView):
    def get(self, request, user_id):
        return Response({})

class TenantListCreateApi(APIView):
    def get(self, request):
        return Response([])

class GuarantorCreateApi(APIView):
    def post(self, request, tenant_id):
        return Response({})
