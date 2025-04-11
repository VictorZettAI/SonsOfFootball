# populate_data.py

import os
import django
import random
from faker import Faker
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'FootballWeb.settings')
django.setup()

from model_bakery import baker
from Liga.models import Liga
from Equipo.models import Equipo, Jugador

faker = Faker()

def populate_data():
    # Crear 10 equipos con datos personalizados
    equipos = baker.make(
        Equipo,
        nombre=lambda: faker.company(),
        poblacion=lambda: faker.city(),
        _quantity=10
    )

    # Crear 5 ligas y asignar equipos
    ligas = []
    for _ in range(5):
        # Generar fecha de inicio aleatoria en el futuro cercano
        fecha_inicio = faker.date_time_between(start_date='now', end_date='+30d')
        # Generar un número de días aleatorio para la duración de la liga
        duracion_dias = random.randint(1, 30)
        # Calcular la fecha final
        fecha_final = fecha_inicio + timedelta(days=duracion_dias)

        liga = baker.make(
            Liga,
            nombre='Liga ' + faker.word(),
            fecha_inicio=fecha_inicio,
            fecha_final=fecha_final,
            # Asignar valores None a los campos que no deseas rellenar
            descripcion=None,
            localizacion=None,
            organizador=None,
            ganador=None,
            _fill_optional=False  # No rellenar automáticamente campos opcionales
        )
        # Asignar equipos a la liga (si es un ManyToManyField)
        liga.equipos.set(equipos)
        liga.save()
        ligas.append(liga)

    # Crear jugadores y asignar a equipos
    posiciones = [pos[0] for pos in Jugador.POSICIONES]
    for equipo in equipos:
        jugadores = baker.make(
            Jugador,
            nombre=lambda: faker.name(),
            edad=lambda: random.randint(18, 40),
            nacionalidad=lambda: faker.country(),
            posicion=lambda: random.choice(posiciones),
            equipo=equipo,
            numero=lambda: random.randint(1, 99),
            _quantity=20
        )

    print("Datos generados exitosamente.")

if __name__ == '__main__':
    populate_data()
