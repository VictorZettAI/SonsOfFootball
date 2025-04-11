from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from .models import *
from django.forms.models import model_to_dict
from rest_framework import generics
from .serializers import *
from rest_framework.views import APIView
from FootballWeb.views import IsJefe
from rest_framework.permissions import IsAuthenticated

def get_default_equipo_id():
    equipo, created = Equipo.objects.get_or_create(nombre="Equipo ?", vacio=True)
    return equipo.id

class EquipoDetailView(generics.RetrieveAPIView):
    queryset = Equipo.objects.all()
    serializer_class = EquipoSerializer

class EquipoListaView(generics.ListAPIView):
    queryset = Equipo.objects.all().exclude(id=get_default_equipo_id())
    serializer_class = Equipo_CreateSerializer

class EquipoCrearView(generics.CreateAPIView):
    queryset = Equipo.objects.all()
    serializer_class = Equipo_CrearSerializer
    permission_classes = [IsAuthenticated, IsJefe]

class JugadorCrearView(generics.CreateAPIView):
    queryset = Jugador.objects.all()
    serializer_class = Jugador_CrearSerializer
    permission_classes = [IsAuthenticated, IsJefe]

class JugadorDetailView(generics.RetrieveAPIView):
    queryset = Jugador.objects.all()
    serializer_class = Jugador_CrearSerializer

class EquipoModView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Equipo.objects.all()
    serializer_class = Equipo_CrearSerializer
    permission_classes = [IsAuthenticated, IsJefe]

class JugadorModView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Jugador.objects.all()
    serializer_class = Jugador_CrearSerializer
    permission_classes = [IsAuthenticated, IsJefe]

class DefaultRetrieveView(APIView):
    def get(self, request, *args, **kwargs):
        default_id = get_default_equipo_id()

        return JsonResponse({'id': default_id})
