# Generated by Django 5.1.2 on 2024-11-05 23:00

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("Torneo", "0005_alter_torneo_fecha_final_alter_torneo_fecha_inicio"),
    ]

    operations = [
        migrations.AlterField(
            model_name="champions",
            name="fecha_final",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="champions",
            name="fecha_inicio",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
