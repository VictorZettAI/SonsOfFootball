from rest_framework import serializers
from django.shortcuts import get_object_or_404
from sympy import Sum
from django.db.models import F, Sum 
from Equipo.models import Equipo
from Liga.models import Liga
from Partido.models import *
from Partido.serializers import Partido_CreateSerializer
import os
server = os.environ.get('HOSTING_BACK_URL', 'http://127.0.0.1:8000')

class PartidoSerializer(serializers.ModelSerializer):
    equipo_1 = serializers.SerializerMethodField()
    equipo_2 = serializers.SerializerMethodField()

    class Meta:
        model = Partido
        fields = ('id', 'nombre', 'equipo_1', 'equipo_2', 'empezado', 'finalizado', 'fecha_inicio', 'fecha_final')

    def get_equipo_1(self, obj):
        return self.get_equipo_data(obj.equipo_1, obj.marcador_1)

    def get_equipo_2(self, obj):
        return self.get_equipo_data(obj.equipo_2, obj.marcador_2)

    def get_equipo_data(self, equipo, marcador):
        if equipo is None:
            return None
        return {
            'id': equipo.id,
            'nombre': equipo.nombre,
            'escudo': server + equipo.escudo.url if equipo.escudo else None,
            'marcador': marcador
        }


class Jornada_JornadaSerializer(serializers.ModelSerializer):
    partidos = PartidoSerializer(many=True, source='partido', read_only=True)  # Cambiar partido_set por partido

    class Meta:
        model = Jornada
        fields = ('id','partidos', 'nombre')


class ClasificacionSerializer(serializers.Serializer):
    equipo = serializers.CharField()
    puntos = serializers.IntegerField()
    partidos_ganados = serializers.IntegerField()
    partidos_empatados = serializers.IntegerField()
    partidos_perdidos = serializers.IntegerField()
    goles_anotados = serializers.IntegerField()
    goles_recibidos = serializers.IntegerField()
    diferencia_goles = serializers.IntegerField()

class Patrocinador_LigaSerializer(serializers.ModelSerializer):
    logo = serializers.SerializerMethodField()
    class Meta:
        model = Patrocinador
        fields = '__all__'
    def get_logo(self,patro):
        return server + patro.logo.url if patro.logo else None

class LigaSerializer(serializers.ModelSerializer):
    jornada = Jornada_JornadaSerializer(many=True,  read_only=True)
    clasificacion = serializers.SerializerMethodField()
    patrocinadores = Patrocinador_LigaSerializer(many=True)

    class Meta:
        model = Liga
        fields = ('id', 'nombre', 'jornada', 'empezado', 'finalizado', 'fecha_inicio', 'fecha_final', 'patrocinadores', 'tipo', 'equipos', 'imagen', 'ganador', 'clasificacion')

    def get_jornada(self, obj):
        # Si quieres obtener las jornadas ordenadas:
        jornadas = obj.jornada.all().order_by('nombre')
        return Jornada_JornadaSerializer(jornadas, many=True).data

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if data['imagen']:
            if data['imagen'].startswith('/media/'):
                data['imagen'] = server + data['imagen']
            elif not data['imagen'].startswith('http'):
                data['imagen'] = server + '/' + data['imagen']
        return data

    def get_clasificacion(self, obj):
        equipos = obj.equipos.all()
        clasificacion = []

        for equipo in equipos:
            if equipo is None:
                continue

            # Calcular partidos ganados, empatados y perdidos
            partidos_ganados = Partido.objects.filter(liga=obj, equipo_1=equipo, marcador_1__gt=F('marcador_2')).count() + \
                              Partido.objects.filter(liga=obj, equipo_2=equipo, marcador_2__gt=F('marcador_1')).count()
            partidos_empatados = Partido.objects.filter(liga=obj, equipo_1=equipo, marcador_1=F('marcador_2')).count() + \
                                Partido.objects.filter(liga=obj, equipo_2=equipo, marcador_2=F('marcador_1')).count()
            partidos_perdidos = Partido.objects.filter(liga=obj, equipo_1=equipo, marcador_1__lt=F('marcador_2')).count() + \
                               Partido.objects.filter(liga=obj, equipo_2=equipo, marcador_2__lt=F('marcador_1')).count()

            # Calcular goles anotados y recibidos
            goles_anotados_1 = Partido.objects.filter(liga=obj, equipo_1=equipo).aggregate(total=Sum('marcador_1'))['total'] or 0
            goles_anotados_2 = Partido.objects.filter(liga=obj, equipo_2=equipo).aggregate(total=Sum('marcador_2'))['total'] or 0
            goles_anotados = goles_anotados_1 + goles_anotados_2

            goles_recibidos_1 = Partido.objects.filter(liga=obj, equipo_1=equipo).aggregate(total=Sum('marcador_2'))['total'] or 0
            goles_recibidos_2 = Partido.objects.filter(liga=obj, equipo_2=equipo).aggregate(total=Sum('marcador_1'))['total'] or 0
            goles_recibidos = goles_recibidos_1 + goles_recibidos_2

            # Calcular puntos y diferencia de goles
            puntos = partidos_ganados * 3 + partidos_empatados
            diferencia_goles = goles_anotados - goles_recibidos

            clasificacion.append({
                'id': equipo.id,
                'equipo': equipo.nombre,
                'puntos': puntos,
                'partidos_ganados': partidos_ganados,
                'partidos_empatados': partidos_empatados,
                'partidos_perdidos': partidos_perdidos,
                'goles_anotados': goles_anotados,
                'goles_recibidos': goles_recibidos,
                'diferencia_goles': diferencia_goles,
            })

        clasificacion.sort(key=lambda x: (-x['puntos'], -x['diferencia_goles']))

        if obj.ganador:
            clasificacion.insert(0, {
                'equipo': obj.ganador.nombre,
                'puntos': 'Ganador',
                'partidos_ganados': '-',
                'partidos_empatados': '-',
                'partidos_perdidos': '-',
                'goles_anotados': '-',
                'goles_recibidos': '-',
                'diferencia_goles': '-',
            })

        return clasificacion


class Jornada_CreateSerializer(serializers.ModelSerializer):
    partido = Partido_CreateSerializer(required = False, many=True)
    class Meta:
        model = Jornada
        fields = ('nombre','liga','partido')
        
    def create(self, validated_data):
        partidos_data = validated_data.pop('partido',[])
        jornada = Jornada.objects.create(**validated_data)
        for partido in partidos_data:
            alineacion_data = partido.pop('alineacion',[]) 
            equipos = partido.pop('equipos',[])
            parti = Partido.objects.create(jornada = jornada, **partido)
            for alineacion in alineacion_data:
                jugadores = alineacion.pop('jugadores',[])
                alinea = Alineacion.objects.create(partido=parti, **alineacion)
                alinea.jugadores.set(jugadores)
        return jornada    

class Liga_CreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Liga
        fields = ('id','nombre','empezado','finalizado','fecha_inicio','fecha_final','patrocinadores','tipo','equipos','descripcion','imagen','localizacion','organizador','numero_alineacion')


class Liga_ModSerializer(serializers.ModelSerializer):
    class Meta:
        model = Liga
        fields = ('id','nombre','empezado','finalizado','fecha_inicio','fecha_final','patrocinadores','tipo','descripcion','imagen','localizacion','organizador','ganador')

class Jornada_ModSerializer(serializers.ModelSerializer):
    class Meta:
        model = Jornada
        fields = ('id','nombre')