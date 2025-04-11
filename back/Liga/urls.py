from django.urls import path
from .views import *
# urls.py en la app Liga
urlpatterns = [
    path('liga/create/', Liga_CreacionView.as_view(), name='liga'),
    path('jornada/create/', Jornada_CreacionView.as_view(), name='jornada'),
    path('liga/<int:pk>/', Liga_DetailView.as_view(), name='liga_ind'),
    path('jornada/<int:pk>/', Jornada_DetailView.as_view(), name='jornada_ind'),
    path('liga/mod/<int:pk>/', Liga_ModView.as_view(), name='liga_mod'),
    path('jornada/mod/<int:pk>/', Jornada_ModView.as_view(), name='jornada_mod'),
    path('api/liga/<int:liga_id>/', LigaDetailView.as_view(), name='liga-detail'),
    path('api/liga/<int:liga_id>/equipos/', LigaEquiposView.as_view(), name='liga-equipos'),
]