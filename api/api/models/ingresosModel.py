from django.db import models


class IngresoSolicitud(models.Model):
    intake_reference = models.CharField(max_length=40, unique=True)

    patient_full_name = models.CharField(max_length=200)
    patient_document_type = models.CharField(max_length=30, blank=True, null=True)
    patient_document_number = models.CharField(max_length=50, blank=True, null=True)
    patient_birth_date = models.DateField(blank=True, null=True)
    patient_age_label = models.CharField(max_length=30, blank=True, null=True)
    patient_age_years = models.IntegerField(blank=True, null=True)
    patient_phone = models.CharField(max_length=30, blank=True, null=True)
    patient_email = models.EmailField(blank=True, null=True)
    patient_address = models.CharField(max_length=255, blank=True, null=True)
    patient_department = models.CharField(max_length=120, blank=True, null=True)
    patient_municipality = models.CharField(max_length=120, blank=True, null=True)
    patient_reference = models.CharField(max_length=255, blank=True, null=True)

    admission_reason = models.TextField(blank=True, null=True)
    admission_type = models.CharField(max_length=50, blank=True, null=True)
    admission_priority = models.CharField(max_length=50, blank=True, null=True)
    doctor_id = models.IntegerField(blank=True, null=True)
    doctor_label = models.CharField(max_length=150, blank=True, null=True)
    care_area = models.CharField(max_length=100, blank=True, null=True)
    room = models.ForeignKey(
        'Habitacion',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='ingresos_asignados'
    )
    room_label = models.CharField(max_length=120, blank=True, null=True)
    admission_at = models.DateTimeField(blank=True, null=True)
    estimated_stay_days = models.PositiveIntegerField(blank=True, null=True)
    additional_notes = models.TextField(blank=True, null=True)

    emergency_name = models.CharField(max_length=150, blank=True, null=True)
    emergency_relationship = models.CharField(max_length=100, blank=True, null=True)
    emergency_phone = models.CharField(max_length=50, blank=True, null=True)
    emergency_notes = models.TextField(blank=True, null=True)

    coverage_type = models.CharField(max_length=50, blank=True, null=True)
    insurer = models.ForeignKey('Seguros', on_delete=models.SET_NULL, blank=True, null=True)
    plan_code = models.CharField(max_length=50, blank=True, null=True)
    coverage_notes = models.TextField(blank=True, null=True)
    billing_name = models.CharField(max_length=150, blank=True, null=True)
    billing_tax_id = models.CharField(max_length=50, blank=True, null=True)
    billing_email = models.EmailField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f"{self.intake_reference} - {self.patient_full_name}"
