# Generated by Django 5.1.2 on 2024-11-06 22:18

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("Equipo", "0005_alter_jugador_edad_alter_jugador_nacionalidad"),
        (
            "Torneo",
            "0007_alter_bracket_fecha_final_alter_bracket_fecha_inicio_and_more",
        ),
    ]

    operations = [
        migrations.AddField(
            model_name="bracket",
            name="equipo",
            field=models.ManyToManyField(related_name="bracket", to="Equipo.equipo"),
        ),
    ]
