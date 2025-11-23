from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0039_remove_inventariosku_clasificacion_producto'),
    ]

    operations = [
        migrations.CreateModel(
            name='CargaMasivaAdmision',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('usuario', models.CharField(blank=True, max_length=150, null=True)),
                ('archivo_nombre', models.CharField(blank=True, max_length=255, null=True)),
                ('archivo_fuente', models.TextField(blank=True, null=True)),
                ('total_creados', models.IntegerField(default=0)),
                ('total_omitidos', models.IntegerField(default=0)),
                ('total_errores', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='CargaMasivaAdmisionItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('expediente', models.CharField(blank=True, max_length=50, null=True)),
                ('nombre', models.CharField(blank=True, max_length=255, null=True)),
                ('telefono', models.CharField(blank=True, max_length=100, null=True)),
                ('telefono_secundario', models.CharField(blank=True, max_length=100, null=True)),
                ('departamento', models.CharField(blank=True, max_length=100, null=True)),
                ('municipio', models.CharField(blank=True, max_length=100, null=True)),
                ('referencia', models.CharField(blank=True, max_length=255, null=True)),
                ('contacto_emergencia', models.CharField(blank=True, max_length=255, null=True)),
                ('dpi', models.CharField(blank=True, max_length=50, null=True)),
                ('estado', models.CharField(choices=[('creado', 'Creado'), ('omitido', 'Omitido'), ('error', 'Error')], default='creado', max_length=20)),
                ('mensaje', models.TextField(blank=True, null=True)),
                ('admision_id', models.IntegerField(blank=True, null=True)),
                ('paciente_id', models.IntegerField(blank=True, null=True)),
                ('carga', models.ForeignKey(on_delete=models.CASCADE, related_name='items', to='api.cargamasivaadmision')),
            ],
        ),
    ]
