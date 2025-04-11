from django.db import models
from Shopify.models import Patrocinador
from Equipo.models import Equipo
from PIL import Image

# Create your models here.

class Liga(models.Model):
    TIPO =[
        ('ida', 'Ida'),
        ('ida_vuelta', 'Ida y vuelta'),
    ]
    ALINEACIONES =[
        ('7','7'),
        ('11','11')
    ]
    nombre = models.CharField(max_length=64) # Formulario
    empezado = models.BooleanField(default=False) # Boton para empezar
    finalizado = models.BooleanField(default=False) # boton para terminar
    fecha_inicio = models.DateTimeField(null=True, blank=True) # Opcional
    fecha_final = models.DateTimeField(null=True, blank=True) # Opcional
    patrocinadores = models.ManyToManyField(Patrocinador, related_name='liga',null=True, blank=True) # Opcional
    tipo = models.CharField(max_length=64, choices=TIPO) # Formulario
    equipos = models.ManyToManyField(Equipo, related_name='liga') #Formulario
    descripcion = models.CharField(max_length=256,null=True, blank=True) # Opcional
    imagen = models.ImageField(upload_to="liga/", null=True, blank=True) # Opcional
    localizacion = models.CharField(max_length=64,null=True, blank=True) # Opcional
    organizador = models.CharField(max_length=64,null=True, blank=True) # Opcional
    ganador = models.ForeignKey(Equipo, on_delete=models.SET_NULL, null=True, blank=True, related_name='liga_ganador') # Podría mirar la clasificacion y listo.
    numero_alineacion = models.CharField(max_length=5, choices = ALINEACIONES, default='11') # Choice. Formulario

    def __str__(self):
        return f'Liga: {self.nombre}'
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.imagen:
            img = Image.open(self.imagen.path)
            max_width, max_height = 300, 300
            if img.width > max_width or img.height > max_height:
                img.thumbnail((max_width, max_height))
                img.save(self.imagen.path)
