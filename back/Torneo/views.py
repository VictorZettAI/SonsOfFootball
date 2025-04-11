from django.shortcuts import render
from rest_framework import generics
from .serializers import *
from FootballWeb.views import IsJefe
from rest_framework.permissions import IsAuthenticated

# Create your views here.
class Torneo_BracketView(generics.RetrieveAPIView):
    queryset = Torneo.objects.all()
    serializer_class = Torneo_BracketSerializers

class Torneo_ChampionsView(generics.RetrieveAPIView):
    queryset = Torneo.objects.all()
    serializer_class = Torneo_ChampionsSerializers

class Bracket_CreateView(generics.CreateAPIView):
    queryset = Bracket.objects.all()
    serializer_class = Bracket_CreateSerializer
    permission_classes = [IsAuthenticated, IsJefe]

class Torneo_CreateView(generics.CreateAPIView):
    queryset = Torneo.objects.all()
    serializer_class = TorneoSerializer
    permission_classes = [IsAuthenticated, IsJefe]

class Torneo_DetailView(generics.RetrieveAPIView):
    queryset = Torneo.objects.all()
    serializer_class = Torneo_ModSerializer

class Torneo_UpdateView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Torneo.objects.all()
    serializer_class = Torneo_ModSerializer
    permission_classes = [IsAuthenticated, IsJefe]

class Ligav2_DetailView(generics.RetrieveAPIView):
    queryset = Liga_V2.objects.all()
    serializer_class = Liga_V2_ModSerializers

class Ligav2_UpdateView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Liga_V2.objects.all()
    serializer_class = Liga_V2_ModSerializers
    permission_classes = [IsAuthenticated, IsJefe]

class Bracket_DetailView(generics.RetrieveAPIView):
    queryset = Bracket.objects.all()
    serializer_class = Bracket_ModSerializer

class Bracket_UpdateView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Bracket.objects.all()
    serializer_class = Bracket_ModSerializer
    permission_classes = [IsAuthenticated, IsJefe]

class Champions_DetailView(generics.RetrieveAPIView):
    queryset = Champions.objects.all()
    serializer_class = Champions_ModSerializer

class Champions_UpdateView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Champions.objects.all()
    serializer_class = Champions_ModSerializer
    permission_classes = [IsAuthenticated, IsJefe]

