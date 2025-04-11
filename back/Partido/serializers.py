from rest_framework import serializers
from .models import *
from django.utils import timezone
import os
from Equipo.serializers import Jugador_EquipoSerializer
server = os.environ.get('HOSTING_BACK_URL', 'http://127.0.0.1:8000')

def get_default_equipo_id():
    equipo, created = Equipo.objects.get_or_create(nombre="Equipo ?", vacio=True)
    return equipo.id

def get_default_jugador_id():
    jugador, created = Jugador.objects.get_or_create(nombre="Jugador ?", vacio=True)
    return jugador.id

def get_equipo_data(equipo):
        return {
            'id': equipo.id,
            'nombre': equipo.nombre,
            'escudo': server + equipo.escudo.url if equipo.escudo else None
        }


class Alineacion_CreateSerializer(serializers.ModelSerializer):
    jugadores = Jugador_EquipoSerializer(many=True, required = False)
    class Meta:
        model = Alineacion
        fields = '__all__'
        
class Partido_CreateSerializer(serializers.ModelSerializer):
    alineacion = Alineacion_CreateSerializer(many=True, required = False)
    class Meta:
        model = Partido
        fields = ('nombre','equipos','equipo_1','equipo_2','fecha_inicio','fecha_final','partes','minutos_jugados','liga','liga_v2','bracket','jornada','torneo','grupo','empezado','localizacion','descripcion','numero_alineacion','alineacion')

    def create(self, validated_data):
        alineacion_data = validated_data.pop('alineacion',[]) 
        equipos = validated_data.pop('equipos',[])
        parti = Partido.objects.create(**validated_data)
        if equipos:
            parti.equipos.set(equipos)
        for alineacion in alineacion_data:
            jugadores = alineacion.pop('jugadores',[])
            alinea = Alineacion.objects.create(partido=parti, **alineacion)
            if jugadores:
                alinea.jugadores.set(jugadores)
        return parti    

class Jornada_CreateSerializer(serializers.ModelSerializer):
    partido = Partido_CreateSerializer(many=True, required = False)
    class Meta:
        model = Jornada
        fields = '__all__'
        
    def create(self, validated_data):
        partido_data = validated_data.pop('partido',[])
        jornada = Jornada.objects.create(**validated_data)
        for partido in partido_data:
            alineacion_data = partido.pop('alineacion',[])
            equipos_data = partido.pop('equipos',[])
            parti = Partido.objects.create(jornada = jornada, **partido)
            if equipos_data:
                parti.equipos.set(equipos_data)
            for alineacion in alineacion_data:
                jugadores = alineacion.pop('jugadores',[])
                alinea = Alineacion.objects.create(partido=parti, **alineacion)
                if jugadores:
                    alinea.jugadores.set(jugadores)
        return jornada


class Jornada_ModSerializer(serializers.ModelSerializer):
    class Meta:
        model = Jornada
        fields = ('id','nombre')

class Alineacion_ModSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alineacion
        fields = ('id','posiciones','jugadores','orden')

class Partido_ModSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partido
        fields = ('id','nombre','equipos','equipo_1','equipo_2','marcador_1','marcador_2','ganador','fecha_inicio','fecha_final','partes','minutos_jugados','partes_extra','minutos_jugados_extra','empezado','finalizado','penaltis','localizacion','descripcion','numero_alineacion')

class Evento_CreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = '__all__'

    def validate_tipo(self, value):
        # Mapeamos los tipos de la consola al modelo
        tipo_mapping = {
            'goal': 'gol',
            'goal_penalti': 'gol_penalti',
            'fail_penalti': 'fallo_penalti',
            'yellow-card': 'tarjeta_amarilla',
            'red-card': 'tarjeta_roja',
            'second-yellow-card': 'segunda_tarjeta_amarilla',
            'substitution': 'sustitucion',
            'penalty': 'penalti',
            'phase-change': 'cambio_fase'
        }
        # Transformamos el tipo si existe en el mapping
        return tipo_mapping.get(value, value)

    def create(self, validated_data):
        evento = Evento.objects.create(**validated_data)
        # Mantenemos la lógica existente de los goles
        if evento.tipo == 'gol':
            partido = evento.partido
            equipo = evento.equipo
            if partido.equipo_1 == equipo:
                if partido.marcador_1 == None:
                    partido.marcador_1 = 0
                partido.marcador_1 += 1
            else:
                if partido.marcador_2 == None:
                    partido.marcador_2 = 0
                partido.marcador_2 += 1
            partido.save()
        elif evento.tipo == 'gol_penalti':
            partido = evento.partido
            equipo = evento.equipo
            if partido.equipo_1 == equipo:
                if partido.marcador_1 == None:
                    partido.marcador_1 = 0
                partido.marcador_1 += 1
            else:
                if partido.marcador_2 == None:
                    partido.marcador_2 = 0
                partido.marcador_2 += 1
            partido.save()
            print('sale')
        elif evento.tipo == 'sustitucion':
            alineacion = Alineacion.objects.get(partido=validated_data['partido'], equipo=validated_data['equipo'])
            for posicion, jugador in enumerate(alineacion.posiciones):
                if jugador == validated_data['jugador'].id:
                    alineacion.posiciones[posicion] = validated_data['jugador_2'].id
                    break
            alineacion.save()
        elif evento.tipo == 'lesion':
            alineacion = Alineacion.objects.get(partido=validated_data['partido'], equipo=validated_data['equipo'])
            for posicion, jugador in enumerate(alineacion.posiciones):
                if jugador == validated_data['jugador'].id:
                    alineacion.posiciones[posicion] = validated_data['jugador_2'].id
                    break
            alineacion.save()
        return evento
class Evento_ModSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = '__all__'

class EventoSerializer(serializers.ModelSerializer):
    tipo_mapping_inverso = {
        'gol': 'goal',
        'gol_penalti': 'goal_penalti',
        'fallo_penalti': 'fail_penalti',
        'tarjeta_amarilla': 'yellow-card',
        'segunda_tarjeta_amarilla': 'second-yellow-card',
        'tarjeta_roja': 'red-card',
        'sustitucion': 'substitution',
        'penalti': 'penalty',
        'cambio_fase': 'phase-change'
    }
    equipo_nombre = serializers.CharField(source='equipo.nombre', read_only=True)
    logo = serializers.SerializerMethodField()
    jugador = serializers.SerializerMethodField()
    jugador_2 = serializers.SerializerMethodField()
    class Meta:
        model = Evento
        fields = [
            'id',
            'tipo',
            'equipo',
            'jugador',
            'jugador_2',
            'equipo_nombre',
            'hora',
            'logo'
        ]
    def get_logo(self,evento):
        if evento.equipo:
            return server + evento.equipo.escudo.url if evento.equipo.escudo else None
        return None
    def get_jugador(self,evento):
        jugador = evento.jugador
        if jugador:
            return {
                'id': jugador.id,
                "nombre": jugador.nombre
            }
        return None
    def get_jugador_2(self,evento):
        jugador = evento.jugador_2
        if jugador:
            return {
                'id': jugador.id,
                "nombre": jugador.nombre
            }
        return None
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['tipo'] = self.tipo_mapping_inverso.get(instance.tipo, instance.tipo)
        
        return data

class alineacion_orden(serializers.ModelSerializer):
    class Meta:
        model = Alineacion
        fields = '__all__'

class PartidoDetalleSerializer(serializers.ModelSerializer):
    estado = serializers.SerializerMethodField()
    nombre_equipo_local = serializers.SerializerMethodField()
    nombre_equipo_visitante = serializers.SerializerMethodField()
    escudo1 = serializers.SerializerMethodField()
    escudo2 = serializers.SerializerMethodField()
    tipo_competicion = serializers.SerializerMethodField()
    goles_equipo_local = serializers.IntegerField(source='marcador_1')
    goles_equipo_visitante = serializers.IntegerField(source='marcador_2')
    minuto_actual = serializers.SerializerMethodField()
    fecha = serializers.SerializerMethodField()
    hora = serializers.SerializerMethodField()
    lugar = serializers.SerializerMethodField()
    alineacion = alineacion_orden(many= True)
    default_equipo = serializers.SerializerMethodField()
    default_jugador = serializers.SerializerMethodField()
    
    # Mapea 'evento' a 'eventos' en el serializer
    eventos = EventoSerializer(source='evento', many=True, read_only=True)
    equipo1 = serializers.IntegerField(source='equipo_1.id')
    equipo2 = serializers.IntegerField(source='equipo_2.id')
    MESES_ES = {
        'January': 'Enero',
        'February': 'Febrero',
        'March': 'Marzo',
        'April': 'Abril',
        'May': 'Mayo',
        'June': 'Junio',
        'July': 'Julio',
        'August': 'Agosto',
        'September': 'Septiembre',
        'October': 'Octubre',
        'November': 'Noviembre',
        'December': 'Diciembre'
    }

    class Meta:
        model = Partido
        fields = [
            'id',
            'estado',
            'nombre_equipo_local',
            'nombre_equipo_visitante',
            'tipo_competicion',
            'goles_equipo_local',
            'goles_equipo_visitante',
            'minuto_actual',
            'fecha',
            'hora',
            'lugar',
            'eventos',
            'equipo1',  # Añadir nuevo campo
            'equipo2',
            'escudo1',
            'escudo2',
            'alineacion',
            'default_equipo',
            'default_jugador',
            'empezado',
            'finalizado'
        ]

    def get_default_equipo(self,obj):
        return get_default_equipo_id()
    
    def get_default_jugador(self,obj):
        return get_default_jugador_id()

    def get_estado(self, obj):
        if not obj:
            return "No disponible"
        if obj.finalizado:
            return "Finalizado"
        elif obj.empezado:
            return "En Vivo"
        return "Por Empezar"

    def get_nombre_equipo_local(self, obj):
        if not obj.equipo_1 or obj.equipo_1.vacio:
            return "Por determinar"
        return obj.equipo_1.nombre

    def get_nombre_equipo_visitante(self, obj):
        if not obj.equipo_2 or obj.equipo_2.vacio:
            return "Por determinar"
        return obj.equipo_2.nombre

    def get_escudo1(self,obj):
        equipo = obj.equipo_1
        return server + equipo.escudo.url if equipo.escudo else None
    
    def get_escudo2(self,obj):
        equipo = obj.equipo_2
        return server + equipo.escudo.url if equipo.escudo else None

    def get_tipo_competicion(self, obj):
        try:
            if obj.liga:
                return f"{obj.liga.nombre} {obj.jornada.nombre if obj.jornada else ''}"
            elif obj.liga_v2:
                if obj.liga_v2.champions:
                    grupo = obj.liga_v2.grupo.filter(equipos=obj.equipo_1).first()
                    return f"Champions League - Grupo {grupo.nombre if grupo else ''}"
            elif obj.bracket:
                if obj.bracket.champions:
                    return "Champions League - Fase Final"
                elif obj.bracket.torneo:
                    return obj.bracket.torneo.nombre
            return "Competición no especificada"
        except Exception:
            return "Competición no disponible"

    def get_minuto_actual(self, obj):
        if not obj.empezado or obj.finalizado or not obj.fecha_inicio:
            return None

        try:
            minutos_por_parte = obj.minutos_jugados or {}
            tiempo_actual = timezone.now()
            tiempo_transcurrido = (tiempo_actual - obj.fecha_inicio).total_seconds() / 60
            partes_completadas = sum(int(minutos) for minutos in minutos_por_parte.values())

            if obj.penaltis:
                return "Penaltis"

            if obj.tiempo_extra:
                if tiempo_transcurrido > (90 + obj.tiempo_extra):
                    return f"90+{obj.tiempo_extra}'"
                elif tiempo_transcurrido > 90:
                    return f"90+{int(tiempo_transcurrido - 90)}'"

            minuto = min(int(tiempo_transcurrido), 90)
            return f"{minuto}'"

        except Exception:
            return None

    def get_fecha(self, obj):
        if not obj.fecha_inicio:
            return "Fecha por determinar"

        try:
            fecha_en_ingles = obj.fecha_inicio.strftime('%d de %B, %Y')
            for mes_en, mes_es in self.MESES_ES.items():
                fecha_en_ingles = fecha_en_ingles.replace(mes_en, mes_es)
            return fecha_en_ingles
        except Exception:
            return "Fecha no disponible"

    def get_hora(self, obj):
        if not obj.fecha_inicio:
            return "Hora por determinar"

        try:
            return obj.fecha_inicio.strftime('%H:%M CET')
        except Exception:
            return "Hora no disponible"

    def get_lugar(self, obj):
        if not obj.localizacion:
            return "Lugar por determinar"
        return f"{obj.localizacion}"
