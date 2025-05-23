# Generated by Django 5.1.2 on 2024-10-30 22:37

import Partido.models
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("Equipo", "0003_jugador_vacio"),
        ("Liga", "0002_alter_liga_patrocinadores"),
        ("Torneo", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Partido",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("nombre", models.CharField(max_length=64)),
                ("marcador_1", models.IntegerField()),
                ("marcador_2", models.IntegerField()),
                ("fecha_inicio", models.DateTimeField()),
                ("fecha_final", models.DateTimeField()),
                ("minutos_jugados", models.IntegerField()),
                ("tiempo_extra", models.IntegerField()),
                ("empezado", models.BooleanField(default=False)),
                ("finalizado", models.BooleanField(default=False)),
                ("descripcion", models.CharField(max_length=256)),
                (
                    "numero_alineacion",
                    models.CharField(choices=[("7", "7"), ("11", "11")], max_length=5),
                ),
                ("final", models.BooleanField(default=False)),
                ("vacio", models.BooleanField(default=False)),
                (
                    "bracket",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="partido",
                        to="Torneo.bracket",
                    ),
                ),
                (
                    "equipo_1",
                    models.ForeignKey(
                        default=Partido.models.get_default_equipo,
                        on_delete=django.db.models.deletion.SET_DEFAULT,
                        related_name="equipo_1",
                        to="Equipo.equipo",
                    ),
                ),
                (
                    "equipo_2",
                    models.ForeignKey(
                        default=Partido.models.get_default_equipo,
                        on_delete=django.db.models.deletion.SET_DEFAULT,
                        related_name="equipo_2",
                        to="Equipo.equipo",
                    ),
                ),
                (
                    "liga",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="partido",
                        to="Liga.liga",
                    ),
                ),
                (
                    "liga_v2",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="partido",
                        to="Torneo.liga_v2",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Evento",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "tipo",
                    models.CharField(
                        choices=[
                            ("tarjeta_amarilla", "Tarjeta Amarilla"),
                            ("tarjeta_roja", "Tarjeta Roja"),
                            ("gol", "Gol"),
                            ("falta", "Falta"),
                            ("corner", "Corner"),
                            ("penalti", "Penalti"),
                            ("sustitucion", "Sustitución"),
                            ("asistencia", "Asistencia"),
                            ("lesion", "Lesión"),
                            ("tiempo_anadido", "Tiempo Añadido"),
                        ],
                        max_length=64,
                    ),
                ),
                ("hora", models.DateTimeField()),
                (
                    "equipo",
                    models.ForeignKey(
                        default=Partido.models.get_default_equipo,
                        on_delete=django.db.models.deletion.SET_DEFAULT,
                        related_name="evento",
                        to="Equipo.equipo",
                    ),
                ),
                (
                    "jugador",
                    models.ForeignKey(
                        default=Partido.models.get_default_jugador,
                        on_delete=django.db.models.deletion.SET_DEFAULT,
                        related_name="evento",
                        to="Equipo.jugador",
                    ),
                ),
                (
                    "jugador_2",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=models.SET(Partido.models.get_default_jugador),
                        related_name="evento_sustitucion",
                        to="Equipo.jugador",
                    ),
                ),
                (
                    "partido",
                    models.ForeignKey(
                        default=Partido.models.get_default_partido,
                        on_delete=django.db.models.deletion.SET_DEFAULT,
                        related_name="evento",
                        to="Partido.partido",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Alineacion_7",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "equipo",
                    models.ForeignKey(
                        default=Partido.models.get_default_equipo,
                        on_delete=django.db.models.deletion.SET_DEFAULT,
                        related_name="alineacion_7",
                        to="Equipo.equipo",
                    ),
                ),
                (
                    "jugador_1",
                    models.ForeignKey(
                        default=Partido.models.get_default_jugador,
                        on_delete=django.db.models.deletion.SET_DEFAULT,
                        related_name="alineacion_7_1",
                        to="Equipo.jugador",
                    ),
                ),
                (
                    "jugador_2",
                    models.ForeignKey(
                        default=Partido.models.get_default_jugador,
                        on_delete=django.db.models.deletion.SET_DEFAULT,
                        related_name="alineacion_7_2",
                        to="Equipo.jugador",
                    ),
                ),
                (
                    "jugador_3",
                    models.ForeignKey(
                        default=Partido.models.get_default_jugador,
                        on_delete=django.db.models.deletion.SET_DEFAULT,
                        related_name="alineacion_7_3",
                        to="Equipo.jugador",
                    ),
                ),
                (
                    "jugador_4",
                    models.ForeignKey(
                        default=Partido.models.get_default_jugador,
                        on_delete=django.db.models.deletion.SET_DEFAULT,
                        related_name="alineacion_7_4",
                        to="Equipo.jugador",
                    ),
                ),
                (
                    "jugador_5",
                    models.ForeignKey(
                        default=Partido.models.get_default_jugador,
                        on_delete=django.db.models.deletion.SET_DEFAULT,
                        related_name="alineacion_7_5",
                        to="Equipo.jugador",
                    ),
                ),
                (
                    "jugador_6",
                    models.ForeignKey(
                        default=Partido.models.get_default_jugador,
                        on_delete=django.db.models.deletion.SET_DEFAULT,
                        related_name="alineacion_7_6",
                        to="Equipo.jugador",
                    ),
                ),
                (
                    "jugador_7",
                    models.ForeignKey(
                        default=Partido.models.get_default_jugador,
                        on_delete=django.db.models.deletion.SET_DEFAULT,
                        related_name="alineacion_7_7",
                        to="Equipo.jugador",
                    ),
                ),
                (
                    "jugadores",
                    models.ManyToManyField(
                        blank=True,
                        null=True,
                        related_name="alineacion_7",
                        to="Equipo.jugador",
                    ),
                ),
                (
                    "partido",
                    models.ForeignKey(
                        default=Partido.models.get_default_partido,
                        on_delete=django.db.models.deletion.SET_DEFAULT,
                        related_name="alineacion_7",
                        to="Partido.partido",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Alineacion_11",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "equipo",
                    models.ForeignKey(
                        default=Partido.models.get_default_equipo,
                        on_delete=django.db.models.deletion.SET_DEFAULT,
                        related_name="alineacion_11",
                        to="Equipo.equipo",
                    ),
                ),
                (
                    "jugador_1",
                    models.ForeignKey(
                        default=Partido.models.get_default_jugador,
                        on_delete=django.db.models.deletion.SET_DEFAULT,
                        related_name="alineacion_11_1",
                        to="Equipo.jugador",
                    ),
                ),
                (
                    "jugador_10",
                    models.ForeignKey(
                        default=Partido.models.get_default_jugador,
                        on_delete=django.db.models.deletion.SET_DEFAULT,
                        related_name="alineacion_11_10",
                        to="Equipo.jugador",
                    ),
                ),
                (
                    "jugador_11",
                    models.ForeignKey(
                        default=Partido.models.get_default_jugador,
                        on_delete=django.db.models.deletion.SET_DEFAULT,
                        related_name="alineacion_11_11",
                        to="Equipo.jugador",
                    ),
                ),
                (
                    "jugador_2",
                    models.ForeignKey(
                        default=Partido.models.get_default_jugador,
                        on_delete=django.db.models.deletion.SET_DEFAULT,
                        related_name="alineacion_11_2",
                        to="Equipo.jugador",
                    ),
                ),
                (
                    "jugador_3",
                    models.ForeignKey(
                        default=Partido.models.get_default_jugador,
                        on_delete=django.db.models.deletion.SET_DEFAULT,
                        related_name="alineacion_11_3",
                        to="Equipo.jugador",
                    ),
                ),
                (
                    "jugador_4",
                    models.ForeignKey(
                        default=Partido.models.get_default_jugador,
                        on_delete=django.db.models.deletion.SET_DEFAULT,
                        related_name="alineacion_11_4",
                        to="Equipo.jugador",
                    ),
                ),
                (
                    "jugador_5",
                    models.ForeignKey(
                        default=Partido.models.get_default_jugador,
                        on_delete=django.db.models.deletion.SET_DEFAULT,
                        related_name="alineacion_11_5",
                        to="Equipo.jugador",
                    ),
                ),
                (
                    "jugador_6",
                    models.ForeignKey(
                        default=Partido.models.get_default_jugador,
                        on_delete=django.db.models.deletion.SET_DEFAULT,
                        related_name="alineacion_11_6",
                        to="Equipo.jugador",
                    ),
                ),
                (
                    "jugador_7",
                    models.ForeignKey(
                        default=Partido.models.get_default_jugador,
                        on_delete=django.db.models.deletion.SET_DEFAULT,
                        related_name="alineacion_11_7",
                        to="Equipo.jugador",
                    ),
                ),
                (
                    "jugador_8",
                    models.ForeignKey(
                        default=Partido.models.get_default_jugador,
                        on_delete=django.db.models.deletion.SET_DEFAULT,
                        related_name="alineacion_11_8",
                        to="Equipo.jugador",
                    ),
                ),
                (
                    "jugador_9",
                    models.ForeignKey(
                        default=Partido.models.get_default_jugador,
                        on_delete=django.db.models.deletion.SET_DEFAULT,
                        related_name="alineacion_11_9",
                        to="Equipo.jugador",
                    ),
                ),
                (
                    "jugadores",
                    models.ManyToManyField(
                        blank=True,
                        null=True,
                        related_name="alineacion_11",
                        to="Equipo.jugador",
                    ),
                ),
                (
                    "partido",
                    models.ForeignKey(
                        default=Partido.models.get_default_partido,
                        on_delete=django.db.models.deletion.SET_DEFAULT,
                        related_name="alineacion_11",
                        to="Partido.partido",
                    ),
                ),
            ],
        ),
    ]
