from django.shortcuts import render
from rest_framework import generics
from .models import *
from .serializers import *
from rest_framework.response import Response
from Partido.serializers import PartidoDetalleSerializer
from Partido.models import Partido
from django.http import StreamingHttpResponse
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
import time
import json
from FootballWeb.views import IsJefe
from rest_framework.permissions import IsAuthenticated

class Partido_CreateView(generics.CreateAPIView):
    queryset = Partido.objects.all()
    serializer_class = Partido_CreateSerializer
    permission_classes = [IsAuthenticated, IsJefe]

class Partido_DetailView(generics.RetrieveAPIView):
    queryset = Partido.objects.all()
    serializer_class = Partido_ModSerializer

class Partido_ModView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Partido.objects.all()
    serializer_class = Partido_ModSerializer
    permission_classes = [IsAuthenticated, IsJefe]

class Jornada_CreateView(generics.CreateAPIView):
    queryset = Jornada.objects.all()
    serializer_class = Jornada_CreateSerializer
    permission_classes = [IsAuthenticated, IsJefe]

class Jornada_DetailView(generics.RetrieveAPIView):
    queryset = Jornada.objects.all()
    serializer_class = Jornada_ModSerializer

class Jornada_ModView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Jornada.objects.all()
    serializer_class = Jornada_ModSerializer
    permission_classes = [IsAuthenticated, IsJefe]

class Alineacion_ListView(generics.ListAPIView):
    queryset = Alineacion.objects.all()
    serializer_class = Alineacion_CreateSerializer

class Alineacion_CreateView(generics.CreateAPIView):
    queryset = Alineacion.objects.all()
    serializer_class = Alineacion_CreateSerializer
    permission_classes = [IsAuthenticated, IsJefe]

class Alineacion_DetailView(generics.RetrieveAPIView):
    queryset = Alineacion.objects.all()
    serializer_class = Alineacion_ModSerializer

class Alineacion_ModView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Alineacion.objects.all()
    serializer_class = Alineacion_ModSerializer
    permission_classes = [IsAuthenticated, IsJefe]

class Evento_CreateView(generics.CreateAPIView):
    queryset = Evento.objects.all()
    serializer_class = Evento_CreateSerializer
    permission_classes = [IsAuthenticated, IsJefe]

class Evento_DetailView(generics.RetrieveAPIView):
    queryset = Evento.objects.all()
    serializer_class = Evento_ModSerializer

class Evento_ModView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Evento.objects.all()
    serializer_class = Evento_ModSerializer
    permission_classes = [IsAuthenticated, IsJefe]
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.tipo == 'gol':
            partido = Partido.objects.get(id=instance.partido.id) 
            print(partido.equipo_1)
            print(instance.equipo)
            if partido.equipo_1 == instance.equipo:
                partido.marcador_1 -= 1
            else:
                partido.marcador_2 -= 1
            partido.save()
        elif instance.tipo == 'sustitucion':
            alineacion = Alineacion.objects.get(partido=instance.partido.id, equipo = instance.equipo.id)
            for posicion, jugador in enumerate(alineacion.posiciones):
                if jugador == instance.jugador_2.id:
                    alineacion.posiciones[posicion] = instance.jugador.id
                    break
            alineacion.save()
        elif instance.tipo == 'lesion':
            alineacion = Alineacion.objects.get(partido=instance.partido.id, equipo = instance.equipo.id)
            for posicion, jugador in enumerate(alineacion.posiciones):
                if jugador == instance.jugador_2.id:
                    alineacion.posiciones[posicion] = instance.jugador.id
                    break
            alineacion.save()
        self.perform_destroy(instance)
        return Response({"detail": "Evento eliminado correctamente"}, status=204)
    
class partido1(generics.RetrieveAPIView):
    queryset = Partido.objects.prefetch_related('evento').all()
    serializer_class = PartidoDetalleSerializer

# Variable para almacenar el número de eventos actuales
cambios_eventos = False

@receiver(post_save, sender=Evento)
@receiver(post_delete, sender=Evento)
def evento_cambiado(sender, instance, **kwargs):
    global cambios_eventos
    cambios_eventos = True

def obtener_datos_partidos():
    # Seleccionar solo los partidos que han comenzado y no han finalizado
    partidos = Partido.objects.filter(empezado=True, finalizado=False)
    datos_partidos = []
    for partido in partidos:
        eventos = EventoSerializer(partido.evento.all(), many=True).data
        alineaciones = Alineacion_CreateSerializer(partido.alineacion.all(), many=True).data
        # Si se quiere obtener de diferente modo, modificar aquí
        datos_partidos.append({
            "partido": partido.id,
            "fecha_inicio": partido.fecha_inicio.isoformat() if partido.fecha_inicio else None,
            "fecha_final": partido.fecha_final.isoformat() if partido.fecha_final else None,
            "equipo_1": {
                "id": partido.equipo_1.id,
                "nombre": partido.equipo_1.nombre,
                "escudo": partido.equipo_1.escudo.url if partido.equipo_1.escudo else None,
            },
            "equipo_2": {
                "id": partido.equipo_2.id,
                "nombre": partido.equipo_2.nombre,
                "escudo": partido.equipo_2.escudo.url if partido.equipo_2.escudo else None,
            },
            "marcador_1": partido.marcador_1,
            "marcador_2": partido.marcador_2,
            "ganador": partido.ganador.nombre if partido.ganador else None,
            "empezado": partido.empezado,
            "finalizado": partido.finalizado,
            "eventos": eventos,
            "alineacion": alineaciones
        })
    return datos_partidos

def event_stream():
    global cambios_eventos  # Asegurar acceso a la variable global
    # Enviar los datos iniciales
    datos_partidos = obtener_datos_partidos()
    if not datos_partidos:
        return  # Salir si no hay datos iniciales
    yield f"data: {json.dumps(datos_partidos)}\n\n"

    while True:
        # Verificar si hay cambios
        if cambios_eventos:
            datos_partidos = obtener_datos_partidos()
            if not datos_partidos:
                yield f"data: {json.dumps(datos_partidos)}\n\n"
                return  # Salir si no hay datos después de los cambios
            yield f"data: {json.dumps(datos_partidos)}\n\n"
            cambios_eventos = False

        # Esperar antes de la siguiente iteración
        time.sleep(5)

def sse_view(request):
    response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    return response