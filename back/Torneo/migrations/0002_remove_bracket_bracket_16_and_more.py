# Generated by Django 5.1.2 on 2024-11-03 19:31

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("Torneo", "0001_initial"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="bracket",
            name="bracket_16",
        ),
        migrations.RemoveField(
            model_name="bracket",
            name="bracket_2_final",
        ),
        migrations.RemoveField(
            model_name="bracket",
            name="bracket_2_perdedor",
        ),
        migrations.RemoveField(
            model_name="bracket",
            name="bracket_32",
        ),
        migrations.RemoveField(
            model_name="bracket",
            name="bracket_4",
        ),
        migrations.RemoveField(
            model_name="bracket",
            name="bracket_8",
        ),
        migrations.AddField(
            model_name="bracket",
            name="bracket",
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="torneo",
            name="imagen",
            field=models.ImageField(blank=True, null=True, upload_to="torneo/"),
        ),
        migrations.AddField(
            model_name="torneo",
            name="localizacion",
            field=models.CharField(blank=True, max_length=64, null=True),
        ),
        migrations.AddField(
            model_name="torneo",
            name="organizador",
            field=models.CharField(blank=True, max_length=64, null=True),
        ),
        migrations.AlterField(
            model_name="bracket",
            name="ronda",
            field=models.IntegerField(),
        ),
    ]
