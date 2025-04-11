from django.db import models
from Equipo.models import *
from Liga.models import *
from Torneo.models import *
# ---------------------------------------------------- Revisa que esté todo bien relacionado, junto con los ? -------------------------------- 

def get_default_equipo():
    equipo, created = Equipo.objects.get_or_create(nombre="Equipo ?", vacio=True)
    return equipo
def get_default_partido():
    partido, created = Partido.objects.get_or_create(nombre="Partido ?", vacio=True)
    return partido
def get_default_jugador():
    jugador, created = Jugador.objects.get_or_create(nombre="Jugador ?", vacio=True)
    return jugador

class Jornada(models.Model):
    nombre = models.CharField(max_length=64) # Formulario
    liga = models.ForeignKey(Liga, related_name='jornada', null=True, blank=True, on_delete=models.CASCADE) # Depende
    liva_v2 = models.ForeignKey(Liga_V2, related_name='jornada', null=True, blank=True, on_delete=models.CASCADE) # Depende
    grupo = models.ForeignKey(Grupo, related_name='jornada', null=True, blank=True, on_delete=models.CASCADE) # Depende

    def __str__(self):
        return self.nombre
class Partido(models.Model):
    ALINEACIONES =[
        ('7','7'),
        ('11','11')
    ]
    nombre = models.CharField(max_length=64, null=True, blank=True) # Formulario
    equipos = models.ManyToManyField(Equipo, related_name='partido', null=True, blank=True) # Se autorrellena cunado equipo_1 y equipo_2 se crean.
    equipo_1 = models.ForeignKey(Equipo, related_name='equipo_1', on_delete=models.SET_DEFAULT,default=get_default_equipo) # Formulario
    equipo_2 = models.ForeignKey(Equipo, related_name='equipo_2', on_delete=models.SET_DEFAULT,default=get_default_equipo) # Formulario
    marcador_1 = models.IntegerField(default=0) # Se cambia cuando se van añadiendo los eventos.
    marcador_2 = models.IntegerField(default=0) # Se cambia cuando se van añadiendo los eventos
    ganador = models.ForeignKey(Equipo,related_name='partido_ganado', null=True, blank=True, on_delete=models.CASCADE) # Cuando el partido ha finalizado, mira el marcador. Si es empate, se queda null.
    fecha_inicio = models.DateTimeField(null=True, blank=True) # Opcional
    fecha_final = models.DateTimeField(null=True, blank=True) # Opcional
    partes = models.IntegerField(null=True, blank=True) # Formulario
    minutos_jugados = models.JSONField(null=True, blank=True) # Eventos Preguntar como rellenar (O como se rellenaría)
    partes_extra = models.IntegerField(null=True, blank=True) # Formulario
    minutos_jugados_extra = models.JSONField(null=True, blank=True) # Eventos Preguntar como rellenar (O como se rellenaría)
    liga = models.ForeignKey(Liga, related_name='partido', null=True, blank=True, on_delete=models.CASCADE) # Juntar con liga si es liga
    liga_v2 = models.ForeignKey(Liga_V2, related_name='partido', null=True, blank=True, on_delete=models.CASCADE) # Juntar con liga_v2 si es torneo
    bracket = models.ForeignKey(Bracket, related_name='partido', null=True, blank=True, on_delete=models.CASCADE) # juntar con bracket si es torneo
    jornada = models.ForeignKey(Jornada, related_name='partido', null=True, blank=True, on_delete=models.CASCADE) # juntar con jornada a la vez que con liga.
    torneo = models.ForeignKey(Torneo, related_name='partido', null=True, blank=True, on_delete=models.CASCADE) # juntar con torneo 
    grupo = models.ForeignKey(Grupo, related_name='partido', null=True, blank=True, on_delete=models.CASCADE) # juntar con grupo
    empezado = models.BooleanField(default=False) # Boton para comenzar partido
    finalizado = models.BooleanField(default=False) # Boton para terminar partido
    penaltis = models.BooleanField(default=False) # Si un evento es de penaltis, esto se activa. O si se acaba con penaltis
    localizacion = models.CharField(max_length=64, null=True, blank=True) # Opcional
    descripcion = models.CharField(max_length=256, null=True, blank=True) # Opcional
    numero_alineacion = models.CharField(max_length=5, choices = ALINEACIONES, null=True, blank=True) # Choice. Formulario
    final = models.BooleanField(default=False) # Esto es para que, si es el partido final, automaticamente termine la liga o el bracket. Ver si al final se añade. Se marcaría en el formulario
    vacio = models.BooleanField(default=False) # No se toca.

    def __str__(self):
        return f'{self.nombre}: {self.equipo_1} vs {self.equipo_2}'
        
class Evento(models.Model):
    TIPOS = [
        ('inicio_partido', 'Inicio Partido'), # Importante
        ('fin_primer_tiempo', 'Fin del Primer Tiempo'),
        ('inicio_segundo_tiempo', 'Inicio del Segundo Tiempo'),
        ('fin_segundo_tiempo', 'Fin del Segundo Tiempo'),
        ('inicio_tercer_tiempo', 'Inicio del Tercer Tiempo'),
        ('fin_tercer_tiempo', 'Fin del Tercer Tiempo'),
        ('inicio_cuarto_tiempo', 'Inicio del Cuarto Tiempo'),
        ('fin_cuarto_tiempo', 'Fin del Cuarto Tiempo'),
        ('inicio_quinto_tiempo', 'Inicio del Quinto Tiempo'),
        ('fin_quinto_tiempo', 'Fin del Quinto Tiempo'),
        ('inicio_sexto_tiempo', 'Inicio del Sexto Tiempo'),
        ('fin_sexto_tiempo', 'Fin del Sexto Tiempo'),
        ('fin_partido', 'Fin del Partido'), # Importante 
        ('inicio_primer_tiempo_prorroga', 'Inicio del Primer Tiempo Prorroga'),
        ('fin_primer_tiempo_prorroga', 'Fin del Primer Tiempo Prorroga'),
        ('inicio_segundo_tiempo_prorroga', 'Inicio del Segundo Tiempo Prorroga'),
        ('fin_segundo_tiempo_prorroga', 'Fin del Segundo Tiempo Prorroga'),
        ('inicio_tercer_tiempo_prorroga', 'Inicio del Tercer Tiempo Prorroga'),
        ('fin_tercer_tiempo_prorroga', 'Fin del Tercer Tiempo Prorroga'),
        ('inicio_cuarto_tiempo_prorroga', 'Inicio del Cuarto Tiempo Prorroga'),
        ('fin_cuarto_tiempo_prorroga', 'Fin del Cuarto Tiempo Prorroga'),
        ('inicio_tanda_penaltis', 'Inicio de la Tanda de Penaltis'),
        ('tarjeta_amarilla', 'Tarjeta Amarilla'),
        ('segunda_tarjeta_amarilla', 'Segunda Tarjeta Amarilla'),
        ('tarjeta_roja', 'Tarjeta Roja'),
        ('gol', 'Gol'),
        ('gol_penalti', 'Gol de Penalti'),
        ('fallo_penalti', 'Fallo de Gol de Penalti'),
        ('falta', 'Falta'),
        ('corner', 'Corner'),
        ('penalti_gol', 'Penalti - Gol'),
        ('penalti_fallo', 'Penalti - Fallo'),
        ('sustitucion', 'Sustitución'),
        ('asistencia', 'Asistencia'),
        ('lesion', 'Lesión'),
        ('tarjeta_azul', 'Tarjeta Azul'),
        ('tiempo_anadido', 'Tiempo Añadido')
    ]
    partido = models.ForeignKey(Partido, on_delete=models.CASCADE,default=get_default_partido, related_name='evento') # Formulario
    tipo = models.CharField(max_length=64, choices=TIPOS) # Formulario
    equipo = models.ForeignKey(Equipo, related_name='evento', on_delete=models.SET(get_default_equipo), null=True, blank=True) # Formulario
    jugador = models.ForeignKey(Jugador, related_name='evento', on_delete=models.SET(get_default_jugador), null=True, blank=True)# Formulario
    jugador_2 = models.ForeignKey(Jugador, related_name='evento_sustitucion', on_delete=models.SET(get_default_jugador), null=True, blank=True) # Solo si es cambio. Aparte, tendrá que cambiar en la alineación.
    hora = models.TimeField(null=True, blank=True) # Formulario
    posicion_expulsion = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f'{self.hora} {self.tipo} {self.jugador}'
    
class Alineacion(models.Model):
    ORDEN = [
        ('4-4-2', '4-4-2'),
        ('4-3-3', '4-3-3'),
        ('3-5-2', '3-5-2'),
        ('4-2-3-1', '4-2-3-1'),
        ('5-3-2', '5-3-2'),
    ]

    posiciones = models.JSONField(null=True, blank=True)
    jugadores = models.ManyToManyField(Jugador, related_name='alineacion', null=True, blank=True)
    equipo = models.ForeignKey(Equipo, related_name='alineacion', on_delete=models.SET_DEFAULT, default=get_default_equipo)
    partido = models.ForeignKey(Partido, related_name='alineacion', on_delete=models.SET_NULL, null=True, blank=True)
    orden = models.CharField(max_length=64, choices=ORDEN, null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.posiciones:
            # Obtener el jugador por defecto
            jugador_default = get_default_jugador()
            # Crear lista de 11 posiciones con el ID del jugador por defecto
            self.posiciones = [jugador_default.id] * 11
        super().save(*args, **kwargs)            
        if self.posiciones:
            posiciones_ids = set(self.posiciones) 
            default_jugador_id = get_default_jugador().id
            filtered_ids = posiciones_ids - {default_jugador_id}
            print(posiciones_ids)
            print(filtered_ids)
            self.jugadores.set(filtered_ids)
