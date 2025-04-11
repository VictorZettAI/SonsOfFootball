from django.db import models
from PIL import Image
from django.core.exceptions import ValidationError


class Equipo(models.Model):
    nombre = models.CharField(max_length=64) # Formulario
    escudo = models.ImageField(upload_to='escuderia/', null=True, blank=True) # Opcional
    poblacion = models.CharField(max_length=64, null=True, blank=True) # Opcional
    activo = models.BooleanField(default=True) # Default
    vacio = models.BooleanField(default=False) # No se toca

    def __str__(self):
        return f'{self.nombre}'
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.escudo:
            img = Image.open(self.escudo.path)
            max_width, max_height = 256, 256
            if img.width > max_width or img.height > max_height:
                img.thumbnail((max_width, max_height))
                img.save(self.escudo.path)

    def delete(self, *args, **kwargs):
        if self.nombre == 'Equipo ?' and self.vacio == True:
            raise ValidationError("No se puede eliminar el equipo por defecto")
        super().delete(*args, **kwargs)

def get_default_equipo():
    equipo, created = Equipo.objects.get_or_create(nombre="Equipo ?", vacio=True)
    return equipo

class Jugador(models.Model):
    POSICIONES = [
        ('portero', 'Portero'),
        ('defensa_lateral_izquierdo', 'Defensa Lateral Izquierdo'),
        ('defensa_central', 'Defensa Central'),
        ('defensa_lateral_derecho', 'Defensa Lateral Derecho'),
        ('medio_centro', 'Medio Centro'),
        ('medio_centro_defensivo', 'Medio Centro Defensivo'),
        ('medio_centro_ofensivo', 'Medio Centro Ofensivo'),
        ('extremo_izquierdo', 'Extremo Izquierdo'),
        ('delantero_centro', 'Delantero Centro'),
        ('extremo_derecho', 'Extremo Derecho')
    ]
    nombre = models.CharField(max_length=64) # Formulario
    edad = models.IntegerField(null=True, blank=True) # Opcional
    nacionalidad = models.CharField(max_length=64, null=True, blank=True) # Opcional
    posicion = models.CharField(max_length=64, choices=POSICIONES) # Choice
    equipo = models.ForeignKey(Equipo, on_delete=models.SET_DEFAULT, default=get_default_equipo, related_name='jugador') #Default/Formulario
    numero = models.IntegerField(null=True, blank=True) # Opcional
    vacio = models.BooleanField(default=False) # No se toca

    def __str__(self):
        return f'{self.nombre}'
    
