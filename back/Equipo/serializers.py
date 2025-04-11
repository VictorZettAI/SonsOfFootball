import os
from rest_framework import serializers
from .models import Equipo, Jugador
from Partido.models import Partido
from Liga.models import Liga
from Torneo.models import Torneo
from django.db.models import F

server = os.environ.get('HOSTING_BACK_URL', 'http://127.0.0.1:8000')

class Jugador_EquipoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Jugador
        fields = '__all__'

class Partido_EquipoSerializer(serializers.ModelSerializer):
    gran_evento = serializers.SerializerMethodField()
    fecha = serializers.SerializerMethodField()
    hora = serializers.SerializerMethodField()
    equipo_1 = serializers.SerializerMethodField()
    equipo_2 = serializers.SerializerMethodField()

    class Meta:
        model = Partido
        fields = ('id','nombre','equipo_1','equipo_2','localizacion','gran_evento','fecha','hora')
    
    def get_gran_evento(self,obj):
        if obj.liga:
            return f"Liga: {obj.liga.nombre}"
        elif obj.torneo:
            return f"Torneo: {obj.torneo.nombre}"
        return None
    
    def get_fecha(self,obj):
        if obj.fecha_inicio:
            return obj.fecha_inicio.date()
        return None
    def get_hora(self,obj):
        if obj.fecha_inicio:
            return obj.fecha_inicio.time()
        return None        
    def get_equipo_1(self,obj):
        diccy = {}
        equipo = Equipo.objects.get(id=obj.equipo_1.id)
        diccy['id'] = equipo.id
        diccy['nombre'] = equipo.nombre
        diccy['escudo'] = server + equipo.escudo.url if equipo.escudo else None
        diccy['marcador'] = obj.marcador_1
        return diccy
    def get_equipo_2(self,obj):
        diccy = {}
        equipo = Equipo.objects.get(id=obj.equipo_2.id)
        diccy['id'] = equipo.id
        diccy['nombre'] = equipo.nombre
        diccy['escudo'] = server + equipo.escudo.url if equipo.escudo else None
        diccy['marcador'] = obj.marcador_2
        return diccy

class LigaSerializer(serializers.ModelSerializer):
    partidos = serializers.SerializerMethodField()
    ganador = serializers.SerializerMethodField()
    puntuacion = serializers.SerializerMethodField()
    equipos = serializers.SerializerMethodField()
    tipo_event = serializers.SerializerMethodField()
    class Meta:
        model = Liga
        fields = ('id','nombre','empezado','finalizado','tipo','equipos','imagen','fecha_inicio', 'partidos', 'ganador', 'puntuacion','tipo_event')

    def get_partidos(self, liga):
        equipo_id = self.context['equipo_id']
        return Partido.objects.filter(liga=liga, equipos=equipo_id).count()

    def get_ganador(self, liga):
        equipo_id = self.context['equipo_id']
        return Partido.objects.filter(liga=liga, equipos=equipo_id, ganador=equipo_id).count()

    def get_puntuacion(self, liga):
        equipo_id = self.context['equipo_id']
        ganadores = Partido.objects.filter(liga=liga, equipos=equipo_id, ganador=equipo_id).count()
        puntos_ganador = ganadores * 3
        empates = Partido.objects.filter(liga=liga, equipos=equipo_id, marcador_1=F('marcador_2')).exclude(ganador__isnull=False).count()
        return puntos_ganador + empates

    def get_equipos(self, liga):
        evento = []
        equipos = liga.equipos.all()
        for i in equipos:
            diccy = {}
            equipo = Equipo.objects.get(id=i.id)
            diccy['id'] = equipo.id
            diccy['nombre'] = equipo.nombre
            diccy['escudo'] = server + equipo.escudo.url if equipo.escudo else None
            evento.append(diccy)
        return evento

    def get_tipo_event(self,liga):
        return "Liga"

class TorneoSerializer(serializers.ModelSerializer):
    partidos = serializers.SerializerMethodField()
    ganador = serializers.SerializerMethodField()
    puntuacion = serializers.SerializerMethodField()
    tipo_event = serializers.SerializerMethodField()

    class Meta:
        model = Torneo
        fields = ('id', 'nombre', 'fecha_inicio', 'partidos', 'ganador', 'puntuacion','tipo_event')

    def get_partidos(self, torneo):
        equipo_id = self.context['equipo_id']
        return Partido.objects.filter(torneo=torneo, equipos=equipo_id).count()

    def get_ganador(self, torneo):
        equipo_id = self.context['equipo_id']
        return Partido.objects.filter(torneo=torneo, equipos=equipo_id, ganador=equipo_id).count()

    def get_puntuacion(self, torneo):
        equipo_id = self.context['equipo_id']
        ganadores = Partido.objects.filter(torneo=torneo, equipos=equipo_id, ganador=equipo_id).count()
        puntos_ganador = ganadores * 3
        empates = Partido.objects.filter(torneo=torneo, equipos=equipo_id, marcador_1=F('marcador_2')).exclude(ganador__isnull=False).count()
        return puntos_ganador + empates
    def get_tipo_event(self,torneo):
        return "Champions" if getattr(torneo, 'champions', False) else "Torneo"
    
class EquipoSerializer(serializers.ModelSerializer):
    jugador = Jugador_EquipoSerializer(many=True)
    partido = Partido_EquipoSerializer(many=True)
    liga = serializers.SerializerMethodField()
    torneo = serializers.SerializerMethodField()
    class Meta:
        model = Equipo
        # fields = '__all__'
        fields = ('id','nombre','escudo','poblacion','jugador','partido','liga','torneo')

    def get_liga(self, equipo):
        ligas = Liga.objects.filter(equipos=equipo.id)
        return LigaSerializer(ligas, many=True, context={'equipo_id': equipo.id}).data

    def get_torneo(self, equipo):
        torneos = Torneo.objects.filter(equipos=equipo.id)
        return TorneoSerializer(torneos, many=True, context={'equipo_id': equipo.id}).data

    def to_representation(self, instance):
        instancia = super().to_representation(instance)
        
        eventos = []
        for luz in instancia['liga']:
            eventos.append(luz)
        for luz in instancia['torneo']:
            eventos.append(luz)
        eventos_ordenados = sorted(eventos, key=lambda x: (x['fecha_inicio'] is None, x['fecha_inicio']))
        instancia['evento']= eventos_ordenados
        instancia.pop('torneo')
        instancia.pop('liga')


        portero = []
        defensa = []
        medio = []
        delantero = []

        for jugador in instancia.get('jugador',[]):
            if jugador['posicion'] in ['portero']:
                portero.append(jugador)
            elif jugador['posicion'] in ['defensa_lateral_izquierdo', 'defensa_central', 'defensa_lateral_derecho']:
                defensa.append(jugador)
            elif jugador['posicion'] in ['medio_centro', 'medio_centro_defensivo', 'medio_centro_ofensivo']:
                medio.append(jugador)
            elif jugador['posicion'] in ['extremo_izquierdo', 'delantero_centro', 'extremo_derecho']:
                delantero.append(jugador)
        
        # Previo a la ordenacion
        instancia.pop('jugador')

        # Despues de ordenarlo
        instancia['jugador'] = {
            'portero': portero,
            'defensa': defensa,
            'medio': medio,
            'delantero': delantero
        }

        return instancia

# Para crear otros, teniendo la lista de equipos
class Equipo_CreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipo
        fields = '__all__'

class Jugador_CrearSerializer(serializers.ModelSerializer):
    class Meta:
        model = Jugador
        fields = ('id','nombre','edad','nacionalidad','posicion','equipo','numero')

# Crear un equipo
class Equipo_CrearSerializer(serializers.ModelSerializer):
    jugador = Jugador_CrearSerializer(many=True, required = False)
    class Meta:
        model = Equipo
        fields = ('id','nombre','escudo','poblacion','jugador')
    def create(self, validated_data):
        jugador_data = validated_data.pop('jugador',[])
        equi = Equipo.objects.create(**validated_data)
        for jugador in jugador_data:
            jugar = Jugador.objects.create(equipo = equi,**jugador)
        return equi
