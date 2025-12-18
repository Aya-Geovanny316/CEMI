from django.db import migrations, models
import django.db.models.deletion
import django.conf


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0042_delete_ingresosolicitud'),
        migrations.swappable_dependency(django.conf.settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='admision',
            name='cerrado_en',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='admision',
            name='cerrado_por',
            field=models.CharField(blank=True, max_length=150, null=True),
        ),
        migrations.AddField(
            model_name='admision',
            name='descargado_en',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='admision',
            name='descargado_por',
            field=models.CharField(blank=True, max_length=150, null=True),
        ),
        migrations.AddField(
            model_name='admision',
            name='estado_atencion',
            field=models.CharField(choices=[('PENDIENTE', 'Pendiente'), ('EN_ATENCION', 'En atención'), ('DESCARGADO', 'Descargado por médico'), ('CERRADO', 'Cerrado por secretaria')], default='PENDIENTE', max_length=20),
        ),
        migrations.AddField(
            model_name='admision',
            name='medico_asignado',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='admisiones_asignadas', to=django.conf.settings.AUTH_USER_MODEL),
        ),
    ]
