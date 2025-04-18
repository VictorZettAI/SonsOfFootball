# Generated by Django 5.1.2 on 2024-11-07 12:06

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("Partido", "0005_alter_partido_minutos_jugados_and_more"),
        ("Torneo", "0008_bracket_equipo"),
    ]

    operations = [
        migrations.AddField(
            model_name="partido",
            name="torneo",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="partido",
                to="Torneo.torneo",
            ),
        ),
    ]
