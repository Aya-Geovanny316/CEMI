from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0037_ingresosolicitud'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='proveedor',
            name='tipo',
        ),
        migrations.RemoveField(
            model_name='proveedor',
            name='dias_credito',
        ),
        migrations.RemoveField(
            model_name='proveedor',
            name='local_extranjero',
        ),
        migrations.RemoveField(
            model_name='proveedor',
            name='pais',
        ),
        migrations.RemoveField(
            model_name='proveedor',
            name='moneda',
        ),
        migrations.RemoveField(
            model_name='proveedor',
            name='retener_isr',
        ),
        migrations.RemoveField(
            model_name='proveedor',
            name='regimen_contable',
        ),
        migrations.RemoveField(
            model_name='proveedor',
            name='cuenta_contable',
        ),
        migrations.RemoveField(
            model_name='proveedor',
            name='cuentas_bancarias',
        ),
    ]
