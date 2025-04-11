from django.urls import path
from .views import *

urlpatterns = [
    path('torneo/<int:pk>/', Torneo_ChampionsView.as_view(), name='torneo'),
    path('bracket/<int:pk>/', Torneo_BracketView.as_view(), name='torneo_brakcet'),
    path('bracket/nuevo/', Bracket_CreateView.as_view(), name='bracket_nuevo'),
    path('torneo/nuevo/', Torneo_CreateView.as_view(), name='torneo_nuevo'),
    path('torneo/ind/<int:pk>/', Torneo_DetailView.as_view(), name='torneo_ind'),
    path('torneo/mod/<int:pk>/', Torneo_UpdateView.as_view(), name='torneo_mod'),
    path('torneo/ind/liga/<int:pk>/', Ligav2_DetailView.as_view(), name='torneo_liga_ind'),
    path('torneo/liga/<int:pk>/', Ligav2_UpdateView.as_view(), name='torneo_liga_mod'),
    path('torneo/ind/bracket/<int:pk>/', Bracket_DetailView.as_view(), name='torneo_bracket_ind'),
    path('torneo/bracket/<int:pk>/', Bracket_UpdateView.as_view(), name='torneo_bracket_mod'),
    path('torneo/ind/champions/<int:pk>/', Champions_DetailView.as_view(), name='torneo_champions_ind'),
    path('torneo/champions/<int:pk>/', Champions_UpdateView.as_view(), name='torneo_champions_mod'),
]