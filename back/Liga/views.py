from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Liga
from Partido.models import Jornada, Partido
from .serializers import *
from rest_framework import generics
# from FootballWeb.views import IsJefe
from rest_framework.permissions import IsAuthenticated
from FootballWeb.views import IsJefe
from rest_framework.permissions import IsAuthenticated

class LigaDetailView(APIView):
    def get(self, request, liga_id):
        liga = get_object_or_404(Liga, id=liga_id)        
        serializer = LigaSerializer(liga)
        return Response(serializer.data)

class JornadaDetailView(APIView):
    def get(self, request, jornada_id):
        jornada = get_object_or_404(Jornada, id=jornada_id)
        serializer = Jornada_JornadaSerializer(jornada)
        return Response(serializer.data)

class PartidoDetailView(APIView):
    def get(self, request, partido_id):
        partido = get_object_or_404(Partido, id=partido_id)
        serializer = PartidoSerializer(partido)
        return Response(serializer.data)

class ClasificacionLigaView(APIView):
    def get(self, request, liga_id):
        liga = get_object_or_404(Liga, id=liga_id)
        return Response(LigaSerializer(liga).data.get('clasificacion'))
    
class Liga_CreacionView(generics.CreateAPIView):
    queryset = Liga.objects.all()
    serializer_class = Liga_CreateSerializer
    permission_classes = [IsAuthenticated, IsJefe]

class Jornada_CreacionView(generics.CreateAPIView):
    queryset = Jornada.objects.all()
    serializer_class = Jornada_CreateSerializer
    permission_classes = [IsAuthenticated, IsJefe]

class Liga_DetailView(generics.RetrieveAPIView):
    queryset = Liga.objects.all()
    serializer_class = Liga_ModSerializer

class Jornada_DetailView(generics.RetrieveAPIView):
    queryset = Jornada.objects.all()
    serializer_class = Jornada_ModSerializer

class Liga_ModView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Liga.objects.all()
    serializer_class = Liga_ModSerializer
    permission_classes = [IsAuthenticated, IsJefe]

class Jornada_ModView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Jornada.objects.all()
    serializer_class = Jornada_ModSerializer
    permission_classes = [IsAuthenticated, IsJefe]

class LigaEquiposView(APIView):
    def get(self, request, liga_id):
        liga = get_object_or_404(Liga, id=liga_id)
        equipos = liga.equipos.all()
        data = [{'id': equipo.id, 'nombre': equipo.nombre} for equipo in equipos]
        return Response(data)