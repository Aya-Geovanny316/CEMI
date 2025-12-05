from rest_framework import serializers

from ..models.ingresosModel import IngresoSolicitud

OPTIONAL_ALLOW_BLANK = [
    'patient_document_type',
    'patient_document_number',
    'patient_age_label',
    'patient_phone',
    'patient_email',
    'patient_address',
    'patient_department',
    'patient_municipality',
    'patient_reference',
    'admission_reason',
    'admission_type',
    'admission_priority',
    'doctor_label',
    'care_area',
    'room_label',
    'additional_notes',
    'emergency_name',
    'emergency_relationship',
    'emergency_phone',
    'emergency_notes',
    'coverage_type',
    'plan_code',
    'coverage_notes',
    'billing_name',
    'billing_tax_id',
    'billing_email',
]

OPTIONAL_ALLOW_NULL = [
    'patient_birth_date',
    'patient_age_years',
    'doctor_id',
    'room',
    'admission_at',
    'estimated_stay_days',
    'insurer',
]


class IngresoSolicitudSerializer(serializers.ModelSerializer):
    class Meta:
        model = IngresoSolicitud
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
        extra_kwargs = {
            **{
                field: {'required': False, 'allow_null': True, 'allow_blank': True}
                for field in OPTIONAL_ALLOW_BLANK
            },
            **{
                field: {'required': False, 'allow_null': True}
                for field in OPTIONAL_ALLOW_NULL
            },
        }
