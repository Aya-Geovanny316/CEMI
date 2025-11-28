from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0039_remove_inventariosku_clasificacion_producto'),
    ]

    operations = [
        migrations.CreateModel(
            name='Consulta',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fecha', models.DateField()),
                ('nombre_paciente', models.CharField(max_length=255)),
                ('edad', models.PositiveIntegerField(blank=True, null=True)),
                ('mc', models.TextField(help_text='Motivo de consulta')),
                ('hea', models.TextField(help_text='Historia de la enfermedad actual')),
                ('sv_pa', models.CharField(blank=True, max_length=50, null=True)),
                ('sv_fc', models.CharField(blank=True, max_length=50, null=True)),
                ('sv_fr', models.CharField(blank=True, max_length=50, null=True)),
                ('sv_sat', models.CharField(blank=True, max_length=50, null=True)),
                ('sv_peso', models.CharField(blank=True, max_length=50, null=True)),
                ('examen_fisico', models.TextField(blank=True, null=True)),
                ('estudios', models.TextField(blank=True, null=True)),
                ('impresion_clinica', models.JSONField(blank=True, default=list)),
                ('tratamiento', models.JSONField(blank=True, default=list)),
                ('plan', models.JSONField(blank=True, default=list)),
                ('medico', models.CharField(blank=True, max_length=150, null=True)),
                ('monto', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('metodo_pago', models.CharField(blank=True, max_length=50, null=True)),
                ('departamento', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='consultas', to='api.departamento')),
                ('paciente', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='consultas', to='api.paciente')),
            ],
            options={
                'ordering': ['-fecha'],
            },
        ),
    ]
