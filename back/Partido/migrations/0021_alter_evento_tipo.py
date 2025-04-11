# Generated by Django 5.1.2 on 2024-12-19 23:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Partido', '0020_alter_evento_tipo'),
    ]

    operations = [
        migrations.AlterField(
            model_name='evento',
            name='tipo',
            field=models.CharField(choices=[('inicio_partido', 'Inicio Partido'), ('fin_primer_tiempo', 'Fin del Primer Tiempo'), ('inicio_segundo_tiempo', 'Inicio del Segundo Tiempo'), ('fin_segundo_tiempo', 'Fin del Segundo Tiempo'), ('inicio_tercer_tiempo', 'Inicio del Tercer Tiempo'), ('fin_tercer_tiempo', 'Fin del Tercer Tiempo'), ('inicio_cuarto_tiempo', 'Inicio del Cuarto Tiempo'), ('fin_cuarto_tiempo', 'Fin del Cuarto Tiempo'), ('inicio_quinto_tiempo', 'Inicio del Quinto Tiempo'), ('fin_quinto_tiempo', 'Fin del Quinto Tiempo'), ('inicio_sexto_tiempo', 'Inicio del Sexto Tiempo'), ('fin_sexto_tiempo', 'Fin del Sexto Tiempo'), ('fin_partido', 'Fin del Partido'), ('inicio_primer_tiempo_prorroga', 'Inicio del Primer Tiempo Prorroga'), ('fin_primer_tiempo_prorroga', 'Fin del Primer Tiempo Prorroga'), ('inicio_segundo_tiempo_prorroga', 'Inicio del Segundo Tiempo Prorroga'), ('fin_segundo_tiempo_prorroga', 'Fin del Segundo Tiempo Prorroga'), ('inicio_tercer_tiempo_prorroga', 'Inicio del Tercer Tiempo Prorroga'), ('fin_tercer_tiempo_prorroga', 'Fin del Tercer Tiempo Prorroga'), ('inicio_cuarto_tiempo_prorroga', 'Inicio del Cuarto Tiempo Prorroga'), ('fin_cuarto_tiempo_prorroga', 'Fin del Cuarto Tiempo Prorroga'), ('inicio_tanda_penaltis', 'Inicio de la Tanda de Penaltis'), ('tarjeta_amarilla', 'Tarjeta Amarilla'), ('segunda_tarjeta_amarilla', 'Segunda Tarjeta Amarilla'), ('tarjeta_roja', 'Tarjeta Roja'), ('gol', 'Gol'), ('gol_penalti', 'Gol de Penalti'), ('fallo_penalti', 'Fallo de Gol de Penalti'), ('falta', 'Falta'), ('corner', 'Corner'), ('penalti_gol', 'Penalti - Gol'), ('penalti_fallo', 'Penalti - Fallo'), ('sustitucion', 'Sustitución'), ('asistencia', 'Asistencia'), ('lesion', 'Lesión'), ('tarjeta_azul', 'Tarjeta Azul'), ('tiempo_anadido', 'Tiempo Añadido')], max_length=64),
        ),
    ]
