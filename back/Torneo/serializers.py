from rest_framework import serializers
from .models import *
from Partido.models import *
from django.db.models import F
from django.db import transaction
import math
import os
server = os.environ.get('HOSTING_BACK_URL', 'http://127.0.0.1:8000')

def get_equipo_data(equipo):
        return {
            'id': equipo.id,
            'nombre': equipo.nombre,
            'escudo': server + equipo.escudo.url if equipo.escudo else None
        }

def get_default_equipo_id():
    equipo, created = Equipo.objects.get_or_create(nombre="Equipo ?", vacio=True)
    return equipo.id

#----------------------------------------------- Visualizador de Torneo-Bracket ---------------------------------------- 

class Bracket_BracketSerializers(serializers.ModelSerializer):
    bracket = serializers.SerializerMethodField()
    equipo = serializers.SerializerMethodField()
    class Meta:
        model = Bracket
        fields = ('id','bracket','equipo','finales','fecha_inicio','fecha_final','empezado','finalizado')
    def get_bracket(self,bracket):
        lista = bracket.bracket
        primero = lista[0]
        equipo = Equipo.objects.get(id=primero)
        luz = []
        equipo_1 = get_equipo_data(equipo)
        luz.append(equipo_1)
        for i in lista[1:]:
            partido = Partido.objects.get(id=i)
            embase = []
            equipo_1 = get_equipo_data(partido.equipo_1)
            equipo_2 = get_equipo_data(partido.equipo_2)
            embase.extend([equipo_1, equipo_2])
            partix = {
                'id': partido.id,
                'nombre': partido.nombre,
                'marcador_1': partido.marcador_1,
                'marcador_2': partido.marcador_2,
                'ganador': partido.ganador.id if partido.ganador else None,
                'empezado': partido.empezado,
                'finalizado': partido.finalizado,
                'localizacion': partido.localizacion,
                'fecha': partido.fecha_inicio.date() if partido.fecha_inicio else None,
                'hora': partido.fecha_inicio.time() if partido.fecha_inicio else None,
            }            
            embase.append(partix)
            luz.append(embase)
        return luz
    def get_equipo(self,bracket):
        embase = []
        equipo = bracket.equipo.all()
        for i in equipo:
            diccy = {}
            diccy['id'] = i.id
            diccy['nombre'] = i.nombre
            diccy['escudo'] = server + i.escudo.url if i.escudo else None
            embase.append(diccy)
        return embase

class Torneo_BracketSerializers(serializers.ModelSerializer):
    bracket = Bracket_BracketSerializers()
    equipos = serializers.SerializerMethodField()
    patrocinadores = serializers.SerializerMethodField()
    ganador = serializers.SerializerMethodField()
    class Meta:
        model = Torneo
        fields = '__all__'
    def get_equipos(self,torneo):
        embase = []
        equipo = torneo.equipos.all()
        for i in equipo:
            diccy = {}
            diccy['id'] = i.id
            diccy['nombre'] = i.nombre
            diccy['escudo'] = server + i.escudo.url if i.escudo else None
            embase.append(diccy)
        return embase
    def get_patrocinadores(self,torneo):
        embase = []
        patro = torneo.patrocinadores.all()
        for i in patro:
            diccy = {}
            diccy['id'] = i.id
            diccy['nombre'] = i.nombre
            diccy['descripcion'] = i.descripcion
            diccy['logo'] = server + i.logo.url if i.logo else None
            embase.append(diccy)
        return embase
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if data['imagen']:
            if data['imagen'].startswith('/media/'):
                data['imagen'] = server + data['imagen']
            elif not data['imagen'].startswith('http'):
                data['imagen'] = server + '/' + data['imagen']
        return data
    def get_ganador(self,torneo):
        if torneo.ganador:
            ids = torneo.ganador.id
            ganador = {}
            if ids:
                gan = Equipo.objects.get(id=ids)
                ganador['id'] = gan.id
                ganador['nombre'] = gan.nombre
                ganador['escudo'] = server + gan.escudo.url if gan.escudo else None
            return ganador
        return None

# ----------------------------------------------- Visualizador de Torneo-Champion ------------------------------------------

# Poner los partidos
class Paritdo_GruposSerializers(serializers.ModelSerializer):
    equipo_1 = serializers.SerializerMethodField()
    equipo_2 = serializers.SerializerMethodField()
    class Meta:
        model = Partido
        fields = ('id','nombre','equipo_1','equipo_2','marcador_1','marcador_2','ganador','fecha_inicio','fecha_final','empezado','finalizado')
    def get_equipo_1(self,partido):
        equipo = partido.equipo_1
        return get_equipo_data(equipo)
    
    def get_equipo_2(self,partido):
        equipo = partido.equipo_2
        return get_equipo_data(equipo)

class Grupo_ChampionsSerializers(serializers.ModelSerializer):
    clasi = serializers.SerializerMethodField()
    partido = Paritdo_GruposSerializers(many=True)
    class Meta:
        model = Grupo
        fields = ('id','nombre','equipos','clasi','partido')
    def get_clasi(self,grupo):
        equipos = grupo.equipos.all()
        embase = []
        for i in equipos:
            partidos_1 = Partido.objects.filter(liga_v2 = grupo.liga, equipo_1 = i)
            partidos_2 = Partido.objects.filter(liga_v2 = grupo.liga, equipo_2 = i)
            gf= 0
            gc = 0
            for j in partidos_1:
                gf += j.marcador_1
            for j in partidos_2:
                gf += j.marcador_2
            for j in partidos_1:
                gc += j.marcador_2
            for j in partidos_2:
                gc += j.marcador_1
            ganados = Partido.objects.filter(liga_v2 = grupo.liga, equipos = i, ganador = i).count()
            empate = Partido.objects.filter(liga_v2 = grupo.liga, equipos = i, marcador_1=F('marcador_2')).exclude(ganador__isnull=False).count()
            puntos = ganados * 3 + empate
            diccy = {}
            diccy['id'] = i.id
            diccy['nombre'] = i.nombre
            diccy['puntos'] = puntos
            diccy['goles_f'] = gf
            diccy['goles_c'] = gc
            diccy['goles_dif'] = gf-gc
            embase.append(diccy)
        equipos_ordenados = sorted(embase,key=lambda x: (x['puntos'], x['goles_f'], x['goles_dif']), reverse=True)
        return equipos_ordenados

# Hacer la clasificacion general aqui
class Liga_V2_ChampionsSerializers(serializers.ModelSerializer):
    grupo = Grupo_ChampionsSerializers(many=True)
    equipos = serializers.SerializerMethodField()
    clasi = serializers.SerializerMethodField()
    class Meta:
        model = Liga_V2
        fields = ('id','empezado','finalizado','fecha_inicio','fecha_final','equipos','grupo','clasi')
    def get_equipos(self,liga):
        embase = []
        equipo = liga.equipos.all()
        for i in equipo:
            diccy = {}
            diccy['id'] = i.id
            diccy['nombre'] = i.nombre
            diccy['escudo'] = server + i.escudo.url if i.escudo else None
            embase.append(diccy)
        return embase
    def get_clasi(self,liga):
        equipos = liga.equipos.all()
        embase = []
        for i in equipos:
            partidos_1 = Partido.objects.filter(liga_v2 = liga, equipo_1 = i)
            partidos_2 = Partido.objects.filter(liga_v2 = liga, equipo_2 = i)
            gf= 0
            gc = 0
            for j in partidos_1:
                gf += j.marcador_1
            for j in partidos_2:
                gf += j.marcador_2
            for j in partidos_1:
                gc += j.marcador_2
            for j in partidos_2:
                gc += j.marcador_1
            ganados = Partido.objects.filter(liga_v2 = liga, equipos = i, ganador = i).count()
            empate = Partido.objects.filter(liga_v2 = liga, equipos = i, marcador_1=F('marcador_2')).exclude(ganador__isnull=False).count()
            puntos = ganados * 3 + empate
            diccy = {}
            diccy['id'] = i.id
            diccy['nombre'] = i.nombre
            diccy['puntos'] = puntos
            diccy['goles_f'] = gf
            diccy['goles_c'] = gc
            diccy['goles_dif'] = gf-gc
            embase.append(diccy)
        equipos_ordenados = sorted(embase,key=lambda x: (x['puntos'], x['goles_f'], x['goles_dif']), reverse=True)
        return equipos_ordenados

# Separar los grupos, dentro los equipos y su partido, con algo de info basica
class Bracket_ChampionsSerializers(serializers.ModelSerializer):
    bracket = serializers.SerializerMethodField()
    equipo = serializers.SerializerMethodField()
    class Meta:
        model = Bracket
        fields = ('id','bracket','equipo','finales','fecha_inicio','fecha_final','empezado','finalizado')
    def get_bracket(self,bracket):
        lista = bracket.bracket
        primero = lista[0]
        equipo = Equipo.objects.get(id=primero)
        luz = []
        equipo_1 = get_equipo_data(equipo)
        luz.append(equipo_1)
        for i in lista[1:]:
            partido = Partido.objects.get(id=i)
            embase = []
            equipo_1 = get_equipo_data(partido.equipo_1)
            equipo_2 = get_equipo_data(partido.equipo_2)
            embase.extend([equipo_1, equipo_2])
            partix = {
                'id': partido.id,
                'nombre': partido.nombre,
                'marcador_1': partido.marcador_1,
                'marcador_2': partido.marcador_2,
                'ganador': partido.ganador.id if partido.ganador else None,
                'empezado': partido.empezado,
                'finalizado': partido.finalizado,
                'localizacion': partido.localizacion,
                'fecha': partido.fecha_inicio.date() if partido.fecha_inicio else None,
                'hora': partido.fecha_inicio.time() if partido.fecha_inicio else None,
            }            
            embase.append(partix)
            luz.append(embase)
        return luz
    def get_equipo(self,bracket):
        embase = []
        equipo = bracket.equipo.all()
        for i in equipo:
            diccy = {}
            diccy['id'] = i.id
            diccy['nombre'] = i.nombre
            diccy['escudo'] = server + i.escudo.url if i.escudo else None
            embase.append(diccy)
        return embase
class Champions_ChampionsSerializers(serializers.ModelSerializer):
    bracket = Bracket_ChampionsSerializers(many=True)
    liga_v2 = Liga_V2_ChampionsSerializers()
    fecha_i = serializers.SerializerMethodField()
    hora_i = serializers.SerializerMethodField()
    fecha_f = serializers.SerializerMethodField()
    hora_f = serializers.SerializerMethodField()
    class Meta:
        model = Champions
        fields = ('id','fecha_i','fecha_f','hora_i','hora_f','empezado','finalizado','bracket','liga_v2', 'plata')
    def get_fecha_i(self,obj):
        if obj.fecha_inicio:
            return obj.fecha_inicio.date()
        return None
    def get_hora_i(self,obj):
        if obj.fecha_inicio:
            return obj.fecha_inicio.time()
        return None        
    def get_fecha_f(self,obj):
        if obj.fecha_final:
            return obj.fecha_final.date()
        return None
    def get_hora_f(self,obj):
        if obj.fecha_final:
            return obj.fecha_final.time()
        return None        
    def to_representation(self, instance):
        instancia = super().to_representation(instance)
        brackets = instancia.pop('bracket')
        ordenado = sorted(brackets, key=lambda x: (x['finales']),reverse=True)
        instancia['bracket'] = ordenado
        return instancia

class Torneo_ChampionsSerializers(serializers.ModelSerializer):
    champions = Champions_ChampionsSerializers()
    equipos = serializers.SerializerMethodField()
    patrocinadores = serializers.SerializerMethodField()
    ganador = serializers.SerializerMethodField()
    class Meta:
        model = Torneo
        fields = '__all__'
    def get_equipos(self,torneo):
        embase = []
        equipo = torneo.equipos.all()
        for i in equipo:
            diccy = {}
            diccy['id'] = i.id
            diccy['nombre'] = i.nombre
            diccy['escudo'] = server + i.escudo.url if i.escudo else None
            embase.append(diccy)
        return embase
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if data['imagen']:
            if data['imagen'].startswith('/media/'):
                data['imagen'] = server + data['imagen']
            elif not data['imagen'].startswith('http'):
                data['imagen'] = server + '/' + data['imagen']
        return data
    def get_patrocinadores(self,torneo):
        embase = []
        patro = torneo.patrocinadores.all()
        for i in patro:
            diccy = {}
            diccy['id'] = i.id
            diccy['nombre'] = i.nombre
            diccy['descripcion'] = i.descripcion
            diccy['logo'] = server + i.logo.url if i.logo else None
            embase.append(diccy)
        return embase
    def get_ganador(self,torneo):
        if torneo.ganador:
            ids = torneo.ganador.id
            ganador = {}
            if ids:
                gan = Equipo.objects.get(id=ids)
                ganador['id'] = gan.id
                ganador['nombre'] = gan.nombre
                ganador['escudo'] = server + gan.escudo.url if gan.escudo else None
            return ganador
        return None

#  ----------------------------------------------- Crear -- Principio de Champion / Bracket----------------------------------------------
class GrupoSerializers(serializers.ModelSerializer):
    class Meta:
        model = Grupo
        fields = ('id','nombre','equipos')

class Liga_v2Serializer(serializers.ModelSerializer):
    grupo = GrupoSerializers(many=True)
    class Meta:
        model = Liga_V2
        fields = ('id','empezado','fecha_inicio','fecha_final','grupo')

class ChampionsSerializer(serializers.ModelSerializer):
    liga_v2 = Liga_v2Serializer()
    class Meta:
        model = Champions
        fields = ('id','fecha_inicio','fecha_final','empezado','liga_v2', 'plata')
    
class Bracket_CreateSerializer(serializers.ModelSerializer):
    class Meta:
        model =  Bracket
        fields = ('id','equipo','torneo','champions','fecha_inicio','fecha_final','empezado','finales')
    def create(self, validated_data):
        equipos = validated_data.pop('equipo')
        bracket = Bracket.objects.create(**validated_data)
        bracket.equipo.set(equipos)
        defi = get_default_equipo_id()
        lista = [defi]
        total = 2 ** math.ceil(math.log2(len(equipos)))
        print(validated_data)
        for _ in range(total):
            partido = Partido.objects.create(bracket = bracket, torneo = validated_data['torneo'].id, )
            lista.append(partido.id)
        bracket.bracket = lista
        bracket.save()
        return bracket
    
class BracketSerializer(serializers.ModelSerializer):
    class Meta:
        model =  Bracket
        fields = ('id','equipo','fecha_inicio','fecha_final','empezado','finales')
#Crear Torneo/Chammpions
class TorneoSerializer(serializers.ModelSerializer):
    champions = ChampionsSerializer(required = False)
    bracket = BracketSerializer(required = False)
    class Meta:
        model = Torneo
        fields = ('id','nombre','fecha_inicio','fecha_final','patrocinadores','empezado','descripcion',
                  'localizacion','imagen','numero_alineacion','organizador','champions','bracket')
    
    def create(self, validated_data):
        luz = validated_data.get('champions',None)
        if luz:
            champions_data = validated_data.pop('champions')
            patrocinadores_data = validated_data.pop('patrocinadores',[])
            torneo = Torneo.objects.create(**validated_data)
            torneo.patrocinadores.set(patrocinadores_data)
            liga_v2_data = champions_data.pop('liga_v2')
            champions = Champions.objects.create(torneo = torneo, **champions_data)
            grupos = liga_v2_data.pop('grupo')
            liga_v2 = Liga_V2.objects.create(champions = champions, **liga_v2_data)
            jugadores = []
            for i in grupos:
                equipos_data = i.pop('equipos',[])
                grupo = Grupo.objects.create(liga = liga_v2, **i)
                grupo.equipos.set(equipos_data)
                jugadores.extend(equipos_data)
            jugadores = list(set(jugadores))
            torneo.equipos.set(jugadores)
            liga_v2.equipos.set(jugadores)
            return torneo
        else:
            patrocinadores_data = validated_data.pop('patrocinadores',[])
            bracket_data = validated_data.pop('bracket')
            torneo = Torneo.objects.create(**validated_data)
            torneo.patrocinadores.set(patrocinadores_data)
            equipos_data = bracket_data.pop('equipo')
            bracket = Bracket.objects.create(torneo=torneo, **bracket_data)
            bracket.equipo.set(equipos_data)
            defi = get_default_equipo_id()
            lista = [defi]
            total = 2 ** math.ceil(math.log2(len(equipos_data)))
            for _ in range(total):
                partido = Partido.objects.create(bracket = bracket, torneo = torneo, numero_alineacion = torneo.numero_alineacion)
                lista.append(partido.id)
            bracket.bracket = lista
            bracket.save()
            torneo.equipos.set(equipos_data)
            return torneo


class Torneo_ModSerializer(serializers.ModelSerializer):
    class Meta:
        model = Torneo
        fields = ('id','nombre','fecha_inicio','fecha_final','ganador','patrocinadores','empezado','finalizado','descripcion','localizacion','imagen','organizador')
    def update(self, instance, validated_data):
        fin = validated_data.get('finalizado',None)
        if fin:
            champions = Champions.objects.filter(torneo=instance.id)
            champions.update(finalizado = True)

            brack = Bracket.objects.filter(torneo = instance.id)
            brack.update(finalizado = True)

            brackets = Bracket.objects.filter(champions__in = champions)
            brackets.update(finalizado =True)

            Partido.objects.filter(bracket__in = brackets).update(finalizado = True)

            ligas = Liga_V2.objects.filter(champions__in = champions)
            ligas.update(finalizado=True)

            Partido.objects.filter(liga_v2__in=ligas).update(finalizado=True) 
          
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
    

class Bracket_ModSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bracket
        fields = ('id','bracket','fecha_inicio','fecha_final','empezado','finalizado')
    def update(self, instance, validated_data):
        fin = validated_data.get('finalizado',None)
        if fin:
            with transaction.atomic():
                partidos = Partido.objects.filter(bracket = instance.id)
                partidos.update(finalizado = True)
                print('¡Hecho!')

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

# Terminar Champion
# Modificar Champion
class Champions_ModSerializer(serializers.ModelSerializer):
    class Meta:
        model = Champions
        fields = ('id','fecha_inicio','fecha_final','empezado','finalizado', 'plata')
    def update(self, instance, validated_data):
        fin = validated_data.get('finalizado',None)
        if fin:
            with transaction.atomic():
                brackets = Bracket.objects.filter(champions = instance.id)
                brackets.update(finalizado =True)
                Partido.objects.filter(bracket__in = brackets).update(finalizado = True)
                ligas = Liga_V2.objects.filter(champions = instance.id)
                ligas.update(finalizado=True)
                Partido.objects.filter(liga_v2__in=ligas).update(finalizado=True)        
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class Bracket_CreadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bracket
        fields = ('id','equipo','finales','fecha_inicio','fecha_final','empezado','finalizado')
#Fase de grupos Champions, luego pasa al bracket
class Liga_V2_ModSerializers(serializers.ModelSerializer):
    bracket_1 = serializers.DictField(write_only=True, required = False)
    bracket_2 = serializers.DictField(write_only=True, required = False)
    class Meta:
        model = Liga_V2
        fields = ('id','nota_corte','empezado','finalizado','fecha_inicio','fecha_final','bracket_1','bracket_2')
    def validate_bracket_1(self, value):
        print(value)
        bracket_serializer = Bracket_CreadorSerializer(data=value)
        bracket_serializer.is_valid(raise_exception=True)
        return bracket_serializer.validated_data
    
    def validate_bracket_2(self, value):
        print(value)
        bracket_serializer = Bracket_CreadorSerializer(data=value)
        bracket_serializer.is_valid(raise_exception=True)
        return bracket_serializer.validated_data
    
    def update(self, instance, validated_data):
        print(validated_data)
        b_1 = validated_data.pop('bracket_1',None)
        b_2 = validated_data.pop('bracket_2',None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        print(b_1,b_2)
        if b_1:
            champ = instance.champions
            equip = b_1.pop('equipo',[])
            brack_1 = Bracket.objects.create(champions = champ,**b_1)
            brack_1.equipo.set(equip)
            defi = get_default_equipo_id()
            lista = [defi]
            total = 2 ** math.ceil(math.log2(len(equip)))
            for _ in range(total):
                partido = Partido.objects.create(bracket = brack_1, torneo = instance.champions.torneo)
                lista.append(partido.id)
            brack_1.bracket = lista
            brack_1.save()
        if b_2:
            champ = instance.champions
            equip = b_2.pop('equipo',[])
            brack_2 = Bracket.objects.create(champions = champ,**b_2)
            brack_2.equipo.set(equip)
            defi = get_default_equipo_id()
            lista = [defi]
            total = 2 ** math.ceil(math.log2(len(equip)))
            for _ in range(total):
                partido = Partido.objects.create(bracket = brack_2, torneo = instance.champions.torneo)
                lista.append(partido.id)
            brack_2.bracket = lista
            brack_2.save()
        instance.save()
        return instance

# Modificar Grupo
class Grupo_ModSerializers(serializers.ModelSerializer):
    class Meta:
        model = Grupo
        fields = ('id','nombre')
