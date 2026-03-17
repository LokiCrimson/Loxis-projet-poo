from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Scene3D
from .selectors import get_visible_scenes_for_user
from .serializers import Scene3DCreateSerializer, Scene3DSerializer, SceneViewLogCreateSerializer, SceneViewLogSerializer
from .services import create_scene3d, publish_scene3d, record_scene_view, unpublish_scene3d


class View3DHealthApi(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'app': 'view3d', 'status': 'ready'})


class Scene3DListCreateApi(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return Scene3DCreateSerializer
        return Scene3DSerializer

    def get_queryset(self):
        return get_visible_scenes_for_user(self.request.user)

    def get_serializer_context(self):
        return {'request': self.request}

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        scene = create_scene3d(
            property_id=serializer.validated_data['property_id'],
            data=serializer.validated_data,
            created_by=request.user,
        )
        return Response(Scene3DSerializer(scene, context=self.get_serializer_context()).data, status=status.HTTP_201_CREATED)


class Scene3DDetailApi(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = Scene3DSerializer

    def get_queryset(self):
        return get_visible_scenes_for_user(self.request.user)

    def get_serializer_context(self):
        return {'request': self.request}


class Scene3DPublishApi(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        scene = get_object_or_404(Scene3D.objects.select_related('property__owner', 'created_by'), id=pk)
        scene = publish_scene3d(scene=scene, actor=request.user)
        return Response(Scene3DSerializer(scene, context={'request': request}).data)


class Scene3DUnpublishApi(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        scene = get_object_or_404(Scene3D.objects.select_related('property__owner', 'created_by'), id=pk)
        scene = unpublish_scene3d(scene=scene, actor=request.user)
        return Response(Scene3DSerializer(scene, context={'request': request}).data)


class Scene3DViewLogApi(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SceneViewLogCreateSerializer

    def post(self, request, pk):
        scene = get_object_or_404(get_visible_scenes_for_user(request.user), id=pk)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        view_log = record_scene_view(
            scene=scene,
            user=request.user,
            duration_seconds=serializer.validated_data.get('duration_seconds', 0),
            client_ip=request.META.get('REMOTE_ADDR', ''),
        )
        return Response(SceneViewLogSerializer(view_log).data, status=status.HTTP_201_CREATED)
