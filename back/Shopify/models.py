from django.db import models
from PIL import Image
import os

# Create your models here.

class Patrocinador(models.Model):
    nombre = models.CharField(max_length=64) # Formulario
    logo = models.ImageField(upload_to='patrocinador/', null=True, blank=True) # Formulario
    descripcion = models.CharField(max_length=256, null=True, blank=True) # Opcional

    def __str__(self):
        return f'Patrocinador: {self.nombre}'
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.logo:
            img = Image.open(self.logo.path)
            max_width, max_height = 300, 300
            if img.width > max_width or img.height > max_height:
                img.thumbnail((max_width, max_height))
                img.save(self.logo.path)


class Publicidad(models.Model):
    titulo = models.CharField(max_length=64)
    descripcion = models.CharField(max_length=512, null=True, blank=True)
    precio = models.CharField(max_length=64)
    url = models.URLField(null=True, blank=True)
    imagen = models.ImageField(upload_to='publicidad/', null=True, blank=True)
    region = models.CharField(max_length=256, null=True, blank=True)

    def __str__(self):
        return f'{self.titulo} : {self.precio}'
    
    def save(self, *args, **kwargs):
        if self.pk:
            instancia_antigua = Publicidad.objects.get(pk=self.pk)
            if instancia_antigua.imagen and instancia_antigua.imagen != self.imagen:
                if os.path.isfile(instancia_antigua.imagen.path):
                    os.remove(instancia_antigua.imagen.path)
        super().save(*args, **kwargs)