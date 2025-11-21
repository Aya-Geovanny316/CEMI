from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0036_solicitudmedicamento_solicitudmedicamentoitem'),
    ]

    operations = [
        migrations.CreateModel(
            name='IngresoSolicitud',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('intake_reference', models.CharField(max_length=40, unique=True)),
                ('patient_full_name', models.CharField(max_length=200)),
                ('patient_document_type', models.CharField(blank=True, max_length=30, null=True)),
                ('patient_document_number', models.CharField(blank=True, max_length=50, null=True)),
                ('patient_birth_date', models.DateField(blank=True, null=True)),
                ('patient_age_label', models.CharField(blank=True, max_length=30, null=True)),
                ('patient_phone', models.CharField(blank=True, max_length=30, null=True)),
                ('patient_email', models.EmailField(blank=True, max_length=254, null=True)),
                ('patient_address', models.CharField(blank=True, max_length=255, null=True)),
                ('admission_reason', models.TextField(blank=True, null=True)),
                ('admission_type', models.CharField(blank=True, max_length=50, null=True)),
                ('admission_priority', models.CharField(blank=True, max_length=50, null=True)),
                ('doctor_id', models.IntegerField(blank=True, null=True)),
                ('doctor_label', models.CharField(blank=True, max_length=150, null=True)),
                ('care_area', models.CharField(blank=True, max_length=100, null=True)),
                ('room_label', models.CharField(blank=True, max_length=120, null=True)),
                ('admission_at', models.DateTimeField(blank=True, null=True)),
                ('estimated_stay_days', models.PositiveIntegerField(blank=True, null=True)),
                ('additional_notes', models.TextField(blank=True, null=True)),
                ('emergency_name', models.CharField(blank=True, max_length=150, null=True)),
                ('emergency_relationship', models.CharField(blank=True, max_length=100, null=True)),
                ('emergency_phone', models.CharField(blank=True, max_length=50, null=True)),
                ('emergency_notes', models.TextField(blank=True, null=True)),
                ('coverage_type', models.CharField(blank=True, max_length=50, null=True)),
                ('plan_code', models.CharField(blank=True, max_length=50, null=True)),
                ('coverage_notes', models.TextField(blank=True, null=True)),
                ('billing_name', models.CharField(blank=True, max_length=150, null=True)),
                ('billing_tax_id', models.CharField(blank=True, max_length=50, null=True)),
                ('billing_email', models.EmailField(blank=True, max_length=254, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('insurer', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.seguros')),
                ('room', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='ingresos_asignados', to='api.habitacion')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
