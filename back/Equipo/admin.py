from django.contrib import admin
from .models import *
from django.contrib.auth.models import Permission

admin.site.register(Permission)
admin.site.register(Equipo)
admin.site.register(Jugador)
