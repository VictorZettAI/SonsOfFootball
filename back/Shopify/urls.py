from django.urls import path
from .views import *
from . import views

urlpatterns = [
    path('patrocinador/', PatrocinadorListView.as_view(), name='patrocinador'),
    path('patrocinador/<int:pk>/', PatrocinadorDetailView.as_view(), name='patrocinador_ind'),
    path('patrocinador/nuevo/', PatrocinadorCrearView.as_view(), name='patrocinador_nuevo'),
    path('patrocinador/mod/<int:pk>/', PatrocinadorModView.as_view(), name='patrocinador_mod'),
    path('publicidad/', PublicidadListaView.as_view(), name='publicidad' ),
    path('publicidad/nuevo/', PublicidadNuevoView.as_view(), name='publicidad_nuevo' ),
    path('publicidad/mod/<int:pk>/', PublicidadModView.as_view(), name='publicidad_mod' ),
    path('publicidad/<int:pk>/', PublicidadDetailView.as_view(), name='publicidad_ind' ),
]