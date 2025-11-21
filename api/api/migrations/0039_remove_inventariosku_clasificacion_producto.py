from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0038_remove_proveedor_financial_fields'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='inventariosku',
            name='clasificacion_producto',
        ),
    ]
