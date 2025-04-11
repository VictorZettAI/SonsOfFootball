from rest_framework.views import APIView
from rest_framework.response import Response
from Liga.models import Liga
from Torneo.models import Torneo
from Partido.models import Partido
from Shopify.models import Patrocinador, Publicidad
from .serializers import Partidos_PGSerializers, Liga_PGSerializers, Torneo_PGSerializers, Patrocinadores_PGSerializers
from datetime import datetime
from Shopify.serializers import Publicidad_GeneralSerializer
from Equipo.models import *
from django.db.models import Q

def get_default_equipo():
    equipo, created = Equipo.objects.get_or_create(nombre="Equipo ?", vacio=True)
    return equipo

class PaginaPrincipalView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            embase = {}
            
            # Obteniendo objetos de la base de datos
            partidos = Partido.objects.filter(Q(fecha_inicio__isnull = False) | ~Q(equipo_1 = get_default_equipo()) | ~Q(equipo_2 = get_default_equipo()))
            ligas = Liga.objects.all()
            torneos = Torneo.objects.all()
            patrocinador = Patrocinador.objects.all()
            publi = Publicidad.objects.filter(region = 'pagina_principal')
            # Serializando los datos
            try:
                partido_serializer = Partidos_PGSerializers(partidos, many=True).data
                liga_serializer = Liga_PGSerializers(ligas, many=True).data
                torneo_serializer = Torneo_PGSerializers(torneos, many=True).data
                publi_serializer = Publicidad_GeneralSerializer(publi, many=True).data

            except Exception as e:
                print("Error en la serialización:", e)
                return Response({"error": "Error en la serialización de datos"}, status=500)
            try:
                patrocinador_serializer = Patrocinadores_PGSerializers(patrocinador, many=True).data
            except Exception as e:
                print("Error en la seria:", e)
                return Response({"error": "Error en la serialización de datos"}, status=500)

            # Organizando partidos en categorías (actual, futuro, otros)
            actual, futuro, otros = [], [], []
            for partido in partido_serializer:
                if partido['empezado'] and not partido['finalizado']:
                    actual.append(partido)
                elif not partido['empezado']:
                    futuro.append(partido)
                else:
                    otros.append(partido)
            
            # Ordenando partidos por fecha de inicio
            if actual:
                actual = sorted(actual, key=lambda x: (x['fecha_inicio'] is None, x['fecha_inicio']))
            if futuro:
                futuro = sorted(futuro, key=lambda x: (x['fecha_inicio'] is None, x['fecha_inicio']))
            if otros:
                otros = sorted(otros, key=lambda x: (x['fecha_inicio'] is None, x['fecha_inicio']))

            # Agregando partidos a 'embase'
            embasex = actual + futuro + otros
            embase['banner'] = embasex[:5]

            # Organizando eventos (ligas y torneos) en categorías
            actual_Eventos, futuro_Eventos, otros_Eventos = [], [], []
            for luz in liga_serializer + torneo_serializer:
                if luz['empezado'] and not luz['finalizado']:
                    actual_Eventos.append(luz)
                elif not luz['empezado']:
                    futuro_Eventos.append(luz)
                else:
                    otros_Eventos.append(luz)

           # Ordenando eventos de más nuevo a más viejo por fecha de inicio
            if actual_Eventos:
                actual_Eventos = sorted(actual_Eventos, key=lambda x: (x['fecha_inicio'] is None, x['fecha_inicio']), reverse=True)
            if futuro_Eventos:
                futuro_Eventos = sorted(futuro_Eventos, key=lambda x: (x['fecha_inicio'] is None, x['fecha_inicio']), reverse=True)
            if otros_Eventos:
                otros_Eventos = sorted(otros_Eventos, key=lambda x: (x['fecha_inicio'] is None, x['fecha_inicio']), reverse=True)


            # Organizando en el diccionario 'embase'
            embase['pasado'] = {'evento': otros_Eventos[:6], 'partido': otros[:10]}
            embase['presente'] = {'evento': actual_Eventos[:6], 'partido': actual[:10]}
            embase['futuro'] = {'evento': futuro_Eventos[:6], 'partido': futuro[:10]}
            embase['patrocinador'] = patrocinador_serializer
            embase['publicidad'] = publi_serializer


            return Response(embase)

        except Exception as e:
            print(f"Error en PaginaPrincipalView.get: {e}")
            return Response({"error": "Ha ocurrido un error en la vista"}, status=500)
