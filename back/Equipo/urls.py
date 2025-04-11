from django.urls import path
from .views import *
from . import views

urlpatterns = [
    path('equipo/<int:pk>/', EquipoDetailView.as_view(), name='equipo_ind'),
    path('equipo/lista/', EquipoListaView.as_view(), name='equipo_lista'),
    path('equipo/nuevo/', EquipoCrearView.as_view(), name='equipo_nuevo'),
    path('jugador/nuevo/', JugadorCrearView.as_view(), name='jugador_nuevo'),
    path('equipo/mod/<int:pk>/', EquipoModView.as_view(), name='equipo_mod'),
    path('jugador/mod/<int:pk>/', JugadorModView.as_view(), name='jugador_mod'),
    path('jugador/<int:pk>/', JugadorDetailView.as_view(), name='jugador_ind'),
    path('jugador/default/', DefaultRetrieveView.as_view(), name='default')
]
