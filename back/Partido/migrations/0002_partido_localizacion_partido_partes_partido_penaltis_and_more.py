# Generated by Django 5.1.2 on 2024-11-03 19:31

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("Liga", "0003_liga_imagen_liga_localizacion_liga_organizador_and_more"),
        ("Partido", "0001_initial"),
        ("Torneo", "0002_remove_bracket_bracket_16_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="partido",
            name="localizacion",
            field=models.CharField(blank=True, max_length=64, null=True),
        ),
        migrations.AddField(
            model_name="partido",
            name="partes",
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="partido",
            name="penaltis",
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name="alineacion_11",
            name="partido",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="alineacion_11",
                to="Partido.partido",
            ),
        ),
        migrations.AlterField(
            model_name="alineacion_7",
            name="partido",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="alineacion_7",
                to="Partido.partido",
            ),
        ),
        migrations.AlterField(
            model_name="evento",
            name="tipo",
            field=models.CharField(
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
                    ("tarjeta_azul", "Tarjeta Azul"),
                    ("tiempo_anadido", "Tiempo Añadido"),
                ],
                max_length=64,
            ),
        ),
        migrations.AlterField(
            model_name="partido",
            name="fecha_final",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="partido",
            name="fecha_inicio",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="partido",
            name="minutos_jugados",
            field=models.JSONField(),
        ),
        migrations.CreateModel(
            name="Jornada",
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
                (
                    "grupo",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="jornada",
                        to="Torneo.grupo",
                    ),
                ),
                (
                    "liga",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="jornada",
                        to="Liga.liga",
                    ),
                ),
                (
                    "liva_v2",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="jornada",
                        to="Torneo.liga_v2",
                    ),
                ),
            ],
        ),
        migrations.AddField(
            model_name="partido",
            name="jornada",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="partido",
                to="Partido.jornada",
            ),
        ),
    ]
