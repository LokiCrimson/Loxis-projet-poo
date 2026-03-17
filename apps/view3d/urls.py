from django.urls import path

from .apis import (
    Scene3DDetailApi,
    Scene3DListCreateApi,
    Scene3DPublishApi,
    Scene3DUnpublishApi,
    Scene3DViewLogApi,
    View3DHealthApi,
)

app_name = 'view3d'

urlpatterns = [
    path('', Scene3DListCreateApi.as_view(), name='scene-list-create'),
    path('health/', View3DHealthApi.as_view(), name='health'),
    path('<int:pk>/', Scene3DDetailApi.as_view(), name='scene-detail'),
    path('<int:pk>/publier/', Scene3DPublishApi.as_view(), name='scene-publish'),
    path('<int:pk>/depublier/', Scene3DUnpublishApi.as_view(), name='scene-unpublish'),
    path('<int:pk>/journaliser-visionnage/', Scene3DViewLogApi.as_view(), name='scene-view-log'),
]
