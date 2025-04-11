from django.urls import path
from .views import *
from . import views

urlpatterns = [
    path('partido/create/', Partido_CreateView.as_view(), name='partido_create'),
    path('partidos/<int:pk>/', Partido_DetailView.as_view(), name='partido_ind'),
    path('partidos/mod/<int:pk>/', Partido_ModView.as_view(), name='partido_mod'),
    path('jornada/create/', Jornada_CreateView.as_view(), name='jornada_create'),
    path('jornada/<int:pk>/', Jornada_DetailView.as_view(), name='jornada_ind'),
    path('jornada/mod/<int:pk>/', Jornada_ModView.as_view(), name='jornada_mod'),
    path('alineacion/', Alineacion_ListView.as_view(), name='alineacion'),
    path('alineacion/create/', Alineacion_CreateView.as_view(), name='alineacion_create'),
    path('alineacion/<int:pk>/', Alineacion_DetailView.as_view(), name='alineacion_ind'),
    path('alineacion/mod/<int:pk>/', Alineacion_ModView.as_view(), name='alineacion_mod'),
    path('evento/create/', Evento_CreateView.as_view(), name='evento'),
    path('evento/<int:pk>/', Evento_DetailView.as_view(), name='evento_ind'),
    path('evento/mod/<int:pk>/', Evento_ModView.as_view(), name='evento_mod'),
    path('partido/<int:pk>/', partido1.as_view(), name='pagina_principal'),
    path('partido/sse/', views.sse_view, name='sse'),
]
