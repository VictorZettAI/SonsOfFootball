# Generated by Django 5.1.2 on 2024-11-19 14:00

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("Partido", "0013_remove_partido_tiempo_extra_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="alineacion",
            name="orden",
            field=models.CharField(
                blank=True, choices=[("vacio", "Vacío")], max_length=64, null=True
            ),
        ),
    ]
