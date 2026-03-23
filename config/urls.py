from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from rest_framework_simplejwt.views import TokenRefreshView
from apps.users.apis import LoxisTokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Endpoint pour changer la langue dynamiquement (Frontend)
    path('i18n/', include('django.conf.urls.i18n')),

    # Endpoints d'authentification JWT avec support du 2FA
    path('api/token/', LoxisTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Swagger / OpenAPI URLs (Documentation)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Inclusion des routes API traduites en termes métiers (Explicites)
    path('api/systeme/', include('apps.core.urls', namespace='core')),
    path('api/utilisateurs/', include('apps.users.urls', namespace='users')),
    path('api/immobilier/', include('apps.properties.urls', namespace='properties')),
    path('api/baux/', include('apps.leases.urls', namespace='leases')),
    path('api/finances/', include('apps.finances.urls', namespace='finances')),
    path('api/visites-3d/', include('apps.view3d.urls', namespace='view3d')),
]

# Permet à Django de servir les fichiers médias (images/photos) en mode développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)