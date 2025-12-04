from rest_framework import serializers

from ..models.ingresosModel import IngresoSolicitud


class IngresoSolicitudSerializer(serializers.ModelSerializer):
    OPTIONAL_FIELDS = [
        'patient_document_type',
        'patient_document_number',
        'patient_birth_date',
        'patient_age_label',
        'patient_age_years',
        'patient_phone',
        'patient_email',
        'patient_address',
        'patient_department',
        'patient_municipality',
        'patient_reference',
        'admission_reason',
        'admission_type',
        'admission_priority',
        'doctor_id',
        'doctor_label',
        'care_area',
        'room',
        'room_label',
        'admission_at',
        'estimated_stay_days',
        'additional_notes',
        'emergency_name',
        'emergency_relationship',
        'emergency_phone',
        'emergency_notes',
        'coverage_type',
        'insurer',
        'plan_code',
        'coverage_notes',
        'billing_name',
        'billing_tax_id',
        'billing_email',
    ]

    class Meta:
        model = IngresoSolicitud
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
        extra_kwargs = {
            optional: {'required': False, 'allow_null': True, 'allow_blank': True}
            for optional in OPTIONAL_FIELDS
        }
