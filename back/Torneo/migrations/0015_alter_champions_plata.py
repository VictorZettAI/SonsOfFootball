# Generated by Django 5.1.2 on 2024-12-19 12:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Torneo', '0014_champions_plata'),
    ]

    operations = [
        migrations.AlterField(
            model_name='champions',
            name='plata',
            field=models.BooleanField(blank=True, null=True),
        ),
    ]
