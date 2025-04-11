from django.db import models
from Equipo.models import *
from Shopify.models import *
from PIL import Image
from math import ceil, log2

# Create your models here.
def get_default_equipo_id():
    equipo, created = Equipo.objects.get_or_create(nombre="Equipo ?", vacio=True)
    return equipo.id

def get_list_default_32(int):
    valor = get_default_equipo_id()
    lista =[valor] * 32
    return lista
def get_list_default_16(int):
    valor = get_default_equipo_id()
    lista =[valor] * 16
    return lista
def get_list_default_8(int):
    valor = get_default_equipo_id()
    lista =[valor] * 8
    return lista
def get_list_default_4(int):
    valor = get_default_equipo_id()
    lista =[valor] * 4
    return lista
def get_list_default_2(int):
    valor = get_default_equipo_id()
    lista =[valor] * 2
    return lista


class Torneo(models.Model):
    ALINEACIONES =[
        ('7','7'),
        ('11','11')
    ]
    nombre = models.CharField(max_length=64) # Formulario
    fecha_inicio = models.DateTimeField(null=True, blank=True) # Opcional
    fecha_final = models.DateTimeField(null=True, blank=True) # Opcional
    equipos = models.ManyToManyField(Equipo, related_name='torneo', null=True, blank=True) # Cuando la liga se haya creado, y tenga los equipos asignados, tambien se asigna acá.
    ganador = models.ForeignKey(Equipo, on_delete=models.SET_NULL, null=True, blank=True, related_name='torneo_ganador') # Cuando el torneo termine, se rellena a maquina
    patrocinadores = models.ManyToManyField(Patrocinador, related_name='torneo', null=True, blank=True) # Formulario
    empezado = models.BooleanField(default=False) # Boton
    finalizado = models.BooleanField(default=False) # Cuando el bracket termine
    descripcion = models.CharField(max_length=256, null=True, blank=True) # Opcional
    localizacion = models.CharField(max_length=64, null=True, blank=True) # Opcional
    imagen = models.ImageField(upload_to="torneo/", null=True, blank=True) # Opcional
    numero_alineacion = models.CharField(max_length=5, choices = ALINEACIONES, default='11') # Choice. Formulario
    organizador = models.CharField(max_length=64, null=True, blank=True) # Opcional

    def __str__(self):
        return f'Torneo: {self.nombre}'
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.imagen:
            img = Image.open(self.imagen.path)
            max_width, max_height = 300, 300
            if img.width > max_width or img.height > max_height:
                img.thumbnail((max_width, max_height))
                img.save(self.imagen.path)

class Champions(models.Model):
    fecha_inicio = models.DateTimeField(null=True, blank=True) # Opcional
    fecha_final = models.DateTimeField(null=True, blank=True) # Opcional
    empezado = models.BooleanField(default=False) # Boton
    finalizado = models.BooleanField(default=False) # Cuando el bracket termine
    torneo = models.OneToOneField(Torneo, related_name='champions', on_delete=models.CASCADE) # Primero se crea torneo, luego se une
    plata = models.BooleanField(null=True, blank=True)

    def __str__(self):
        return f'{self.torneo}: Champions'

class Bracket(models.Model):
    bracket = models.JSONField(null=True, blank=True) # Se autorellena con la variable ronda. Son los id de los equipos
    # jugadores = models.IntegerField() # Formulario
    equipo = models.ManyToManyField(Equipo, related_name='bracket')
    torneo = models.OneToOneField(Torneo, related_name='bracket', null=True, blank=True, on_delete=models.CASCADE) # Primero torneo y luego se une. Si es solo eso.
    champions = models.ForeignKey(Champions, related_name='bracket',null=True, blank=True, on_delete=models.CASCADE) # Primero se crea la champion, luego se une. Si es champion.
    finales = models.BooleanField(default=False)
    fecha_inicio = models.DateTimeField(null=True, blank=True) # Opcional
    fecha_final = models.DateTimeField(null=True, blank=True) # Opcional
    empezado = models.BooleanField(default=False) # Boton para dar el inicio
    finalizado = models.BooleanField(default=False) # Boton para terminar

    def __str__(self):
        return f'Bracket de {len(self.equipo.all())} jugadores, pertenece al torneo: {self.torneo if self.torneo else self.champions}'
    
    
class Liga_V2(models.Model):
    nota_corte = models.IntegerField(null = True, blank=True) # Formulario
    empezado = models.BooleanField(default=False) # boton
    finalizado = models.BooleanField(default=False) # boton
    fecha_inicio = models.DateTimeField(null=True, blank=True) # Opcional
    fecha_final = models.DateTimeField(null=True, blank=True) # Opcional
    equipos = models.ManyToManyField(Equipo, related_name='liga_v2', null=True, blank=True) # Se rellena más tarde, cuando todos los grupos esten asociados.
    champions = models.OneToOneField(Champions, related_name='liga_v2', null=True, blank=True, on_delete=models.CASCADE) # cuando la champions se haya creado

    def __str__(self):
        return f'{self.champions}: Liga'
    
class Grupo(models.Model):
    nombre = models.CharField(max_length=64) # Formulario
    liga = models.ForeignKey(Liga_V2, related_name='grupo', null=True, blank=True, on_delete=models.CASCADE) # cunado la liga se haya creado
    equipos = models.ManyToManyField(Equipo, related_name='grupo', null=True, blank=True) # Formualrio

    def __str__(self):
        return f'Grupo {self.nombre}'