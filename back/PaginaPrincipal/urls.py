from django.urls import path
from .views import *

urlpatterns = [
    path('pagina_principal/', PaginaPrincipalView.as_view(), name='pagina_principal'),
]