from rest_framework import serializers
from Liga.models import Liga
from Torneo.models import Torneo, Bracket
from Partido.models import Partido
from Equipo.models import Equipo
from django.utils.timezone import now
from datetime import datetime
from Shopify.models import *
import os
server = os.environ.get('HOSTING_BACK_URL', 'http://127.0.0.1:8000')

class Patrocinadores_PGSerializers(serializers.ModelSerializer):
    logo = serializers.SerializerMethodField()
    class Meta:
        model = Patrocinador
        fields = '__all__'
    def get_logo(self,patro):
        return server + patro.logo.url if patro.logo else None

class Partidos_PGSerializers(serializers.ModelSerializer):
    competicion = serializers.SerializerMethodField()
    equipo_1 = serializers.SerializerMethodField()
    equipo_2 = serializers.SerializerMethodField()
    jornada = serializers.SerializerMethodField()

    class Meta:
        model = Partido
        fields = ('id','equipo_1','equipo_2','fecha_inicio',
                  'fecha_final','localizacion','competicion','minutos_jugados',
                  'jornada','empezado','finalizado','ganador')
    def get_equipo_1(self,partido):
        embase = {}
        equipo = partido.equipo_1.id
        equip = Equipo.objects.get(id=equipo)
        embase['id']=equip.id
        embase['nombre'] = equip.nombre
        embase['escudo'] = server + equip.escudo.url if equip.escudo else None
        embase['marcador'] = partido.marcador_1 if partido.marcador_1 else None
        return embase
    def get_equipo_2(self,partido):
        embase = {}
        equipo = partido.equipo_2.id
        equip = Equipo.objects.get(id=equipo)
        embase['id']=equip.id
        embase['nombre']=equip.nombre
        embase['escudo'] = server + equip.escudo.url if equip.escudo else None
        embase['marcador'] = partido.marcador_2 if partido.marcador_2 else None
        return embase
    def get_competicion(self, partido):
        if getattr(partido, 'liga', False):  # Verifica si partido tiene liga
            return "Liga"
        champions = getattr(getattr(partido, 'torneo', None), 'champions', None)
        if champions:
            return 'Champions'
        return 'Torneo'
    def get_jornada(self,partido):
        luz = None
        if partido.jornada:
            luz = partido.jornada.nombre
        return luz
    def get_ganador(self,partido):
        ganador = partido.ganador
        embase = {}
        if ganador:
            ids = ganador.id
            gan = Equipo.objects.get(id=ids)
            embase['id'] = gan.id
            embase['nombre'] = gan.nombre
            embase['escudo'] = server + gan.escudo.url if gan.escudo else None
        return embase

class Liga_PGSerializers(serializers.ModelSerializer):
    partido = Partidos_PGSerializers(many=True)
    equipos = serializers.SerializerMethodField()
    ganador = serializers.SerializerMethodField()
    tipo_event = serializers.SerializerMethodField()
    class Meta:
        model = Liga
        fields = ('id','nombre','empezado','finalizado','fecha_inicio','fecha_final','tipo','equipos','imagen','ganador','partido','tipo_event')
    def get_equipos(self,liga):
        equipos = liga.equipos.all().count()
        return equipos
    def get_ganador(self,liga):
        ganador = liga.ganador
        embase = {}
        if ganador:
            ids = ganador.id
            gan = Equipo.objects.get(id=ids)
            embase['id'] = gan.id
            embase['nombre'] = gan.nombre
            embase['escudo'] = server + gan.escudo.url if gan.escudo else None
        return embase
    def get_tipo_event(self,liga):
        return "Liga"
    def to_representation(self, instance):
        instancia = super().to_representation(instance)

        partidos = instancia.pop('partido')
        actual = []
        otros = []
        for partido in partidos:
            if partido['empezado'] == True and partido['finalizado'] == False:
                actual.append(partido)
            else:
                otros.append(partido)
        if actual:
            actual_ordenados = sorted(actual, key=lambda x: x['fecha_inicio'])
            instancia['partidos'] = actual_ordenados[0]
        elif otros:
            fecha_actual = datetime.now()
            for partido in otros:
                dif = None
                if partido['fecha_inicio']:
                    fecha = datetime.strptime(partido['fecha_inicio'], '%Y-%m-%dT%H:%M:%SZ')
                    fecha = fecha.replace(tzinfo=None)
                    dif = abs(fecha_actual-fecha)
                partido['dif'] = dif
            otros_ordenados = sorted(
            otros,
            key=lambda x: (x['dif'] is None, x['dif']),
            reverse=False
            )
            primero = otros_ordenados[0]
            instancia['partidos'] = primero
        else:
            instancia['partidos'] = []
        return instancia

class Torneo_PGSerializers(serializers.ModelSerializer):
    partido = Partidos_PGSerializers(many=True)
    equipos = serializers.SerializerMethodField()
    ganador = serializers.SerializerMethodField()
    tipo = serializers.SerializerMethodField()
    tipo_event = serializers.SerializerMethodField()
    class Meta:
        model = Torneo
        fields = ('id','nombre','fecha_inicio','fecha_final','equipos','ganador','empezado','finalizado','imagen','partido','tipo','tipo_event')
    def get_equipos(self,torneo):
        equipos = torneo.equipos.all().count()
        return equipos
    def get_ganador(self,torneo):
        ganador = torneo.ganador
        embase = {}
        if ganador:
            ids = ganador.id
            gan = Equipo.objects.get(id=ids)
            embase['id']=gan.id
            embase['nombre']=gan.nombre
            embase['escudo']= server + gan.escudo.url if gan.escudo else None
        return embase
    def get_tipo(self, torneo):
        champions = getattr(torneo, 'champions', None)
        if champions:
            return 'Champions'
        return 'Eliminatoria'  
    def get_tipo_event(self,torneo):
        return "Champions" if getattr(torneo, 'champions', False) else "Torneo"
    
    def to_representation(self, instance):
        instancia = super().to_representation(instance)

        partidos = instancia.pop('partido')
        actual = []
        otros = []
        for partido in partidos:
            if partido['empezado'] == True and partido['finalizado'] == False:
                actual.append(partido)
            else:
                otros.append(partido)
        if actual:
            actual_ordenados = sorted(actual, key=lambda x: (x['fecha_inicio'] is None, x['fecha_inicio']))
            instancia['partidos'] = actual_ordenados[0]
        elif otros:
            fecha_actual = datetime.now()
            for partido in otros:
                dif = None
                if partido['fecha_inicio']:
                    fecha = datetime.strptime(partido['fecha_inicio'], '%Y-%m-%dT%H:%M:%SZ')
                    fecha = fecha.replace(tzinfo=None)
                    dif = abs(fecha_actual-fecha)
                partido['dif'] = dif
            otros_ordenados = sorted(
            otros,
            key=lambda x: (x['dif'] is None, x['dif']),
            reverse=False
            )
            primero = otros_ordenados[0]
            instancia['partidos'] = primero
        else:
            instancia['partidos'] = []
        return instancia