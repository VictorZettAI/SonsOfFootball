from django.shortcuts import render
from rest_framework import generics
from Shopify.models import Patrocinador
from .serializers import *
from FootballWeb.views import IsJefe
from rest_framework.permissions import IsAuthenticated

class PatrocinadorListView(generics.ListAPIView):
    queryset = Patrocinador.objects.all()
    serializer_class = PatrocinadorSerializer

class PatrocinadorDetailView(generics.RetrieveAPIView):
    queryset = Patrocinador.objects.all()
    serializer_class = PatrocinadorSerializer

class PatrocinadorCrearView(generics.CreateAPIView):
    queryset = Patrocinador.objects.all()
    serializer_class = Patrocinador_CrearSerializer
    permission_classes = [IsAuthenticated, IsJefe]

class PatrocinadorModView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Patrocinador.objects.all()
    serializer_class = Patrocinador_CrearSerializer
    permission_classes = [IsAuthenticated, IsJefe]


class PublicidadListaView(generics.ListAPIView):
    queryset = Publicidad.objects.all()
    serializer_class = Publicidad_GeneralSerializer

class PublicidadNuevoView(generics.CreateAPIView):
    queryset = Publicidad.objects.all()
    serializer_class = Publicidad_CrearSerializer
    permission_classes = [IsAuthenticated, IsJefe]

class PublicidadDetailView(generics.RetrieveAPIView):
    queryset = Publicidad.objects.all()
    serializer_class = Publicidad_CrearSerializer

class PublicidadModView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Publicidad.objects.all()
    serializer_class = Publicidad_CrearSerializer
    permission_classes = [IsAuthenticated, IsJefe]

