"""
URL configuration for FootballWeb project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import VerifyTokenView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("",include('Equipo.urls')),
    path("",include('Liga.urls')),
    path("",include('PaginaPrincipal.urls')),
    path("",include('Partido.urls')),
    path("",include('Shopify.urls')),
    path("",include('Torneo.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # Para obtener el token
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/verify-token/', VerifyTokenView.as_view(), name='token_refresh'),
]
# if settings.DEBUG:
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)