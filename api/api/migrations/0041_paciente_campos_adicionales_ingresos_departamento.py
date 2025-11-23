from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0040_cargamasivaadmision_cargamasivaadmisionitem'),
    ]

    operations = [
        migrations.AddField(
            model_name='paciente',
            name='contacto_emergencia',
            field=models.CharField(blank=True, max_length=150, null=True),
        ),
        migrations.AddField(
            model_name='paciente',
            name='departamento',
            field=models.CharField(blank=True, max_length=120, null=True),
        ),
        migrations.AddField(
            model_name='paciente',
            name='edad',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='paciente',
            name='municipio',
            field=models.CharField(blank=True, max_length=120, null=True),
        ),
        migrations.AddField(
            model_name='paciente',
            name='referencia',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='ingresosolicitud',
            name='patient_age_years',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='ingresosolicitud',
            name='patient_department',
            field=models.CharField(blank=True, max_length=120, null=True),
        ),
        migrations.AddField(
            model_name='ingresosolicitud',
            name='patient_municipality',
            field=models.CharField(blank=True, max_length=120, null=True),
        ),
        migrations.AddField(
            model_name='ingresosolicitud',
            name='patient_reference',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
