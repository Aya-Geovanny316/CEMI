from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0041_alter_ingresosolicitud_id'),
        ('api', '0041_paciente_campos_adicionales_ingresos_departamento'),
    ]

    operations = [
        migrations.DeleteModel(
            name='IngresoSolicitud',
        ),
    ]
