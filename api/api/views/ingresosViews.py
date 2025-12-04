from datetime import datetime

from django.utils import timezone
from django.utils.dateparse import parse_date, parse_datetime
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from ..models import Habitacion, Seguros
from ..models.ingresosModel import IngresoSolicitud
from ..serializers.ingresosSerializer import IngresoSolicitudSerializer


def _coerce_date(value):
    if not value:
        return None
    parsed = parse_date(value)
    if parsed:
        return parsed
    try:
        return datetime.fromisoformat(value).date()
    except (TypeError, ValueError):
        return None


def _coerce_datetime(value):
    if not value:
        return None
    parsed = parse_datetime(value)
    if parsed:
        return parsed
    try:
        if isinstance(value, str) and len(value) == 16 and value[10] == 'T':
            return datetime.fromisoformat(f"{value}:00")
        return datetime.fromisoformat(value)
    except (TypeError, ValueError):
        return None


def _flatten_payload(data):
    patient = data.get('patient_profile') or {}
    document = patient.get('document') or {}
    admission = data.get('admission_details') or {}
    emergency = data.get('emergency_contact') or {}
    financial = data.get('financial_snapshot') or {}

    birth_date = _coerce_date(patient.get('birth_date'))
    age_years = patient.get('age_years')
    if age_years in (None, '') and birth_date:
        try:
            today = timezone.now().date()
            age_years = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        except Exception:
            age_years = None
    try:
        age_years = int(age_years) if age_years not in (None, '', 'null') else None
    except (TypeError, ValueError):
        age_years = None

    room_id = admission.get('room_id') or admission.get('roomId')
    habitacion = None
    if room_id not in (None, '', 'null'):
        try:
            habitacion = Habitacion.objects.get(id=int(room_id))
        except (Habitacion.DoesNotExist, ValueError, TypeError):
            habitacion = None

    insurer_id = financial.get('insurer_id') or financial.get('insurerId')
    aseguradora = None
    if insurer_id not in (None, '', 'null'):
        try:
            aseguradora = Seguros.objects.get(id=int(insurer_id))
        except (Seguros.DoesNotExist, ValueError, TypeError):
            aseguradora = None

    estimated_stay = admission.get('estimated_stay_days') or admission.get('estimatedStay')
    try:
        estimated_stay = int(estimated_stay) if estimated_stay not in (None, '', 'null') else None
    except (TypeError, ValueError):
        estimated_stay = None

    doctor_identifier = admission.get('doctor_id') or admission.get('doctorId')
    try:
        doctor_identifier = int(doctor_identifier)
    except (TypeError, ValueError):
        doctor_identifier = None

    patient_full_name = patient.get('full_name') or ''
    if not patient_full_name:
        patient_full_name = 'Paciente sin nombre'

    room_code = getattr(habitacion, 'codigo', None)
    room_area = getattr(habitacion, 'area', None)
    room_label = admission.get('room_label') or admission.get('roomLabel')
    if not room_label and habitacion:
        room_parts = [part for part in (room_code, room_area) if part]
        room_label = " - ".join(room_parts) if room_parts else None

    flattened = {
        'intake_reference': data.get('intake_reference') or f"ING-{timezone.now().strftime('%Y%m%d%H%M%S')}",
        'patient_full_name': patient_full_name,
        'patient_document_type': document.get('type'),
        'patient_document_number': document.get('number'),
        'patient_birth_date': birth_date,
        'patient_age_label': patient.get('age_label'),
        'patient_age_years': age_years,
        'patient_phone': patient.get('phone'),
        'patient_email': patient.get('email'),
        'patient_address': patient.get('address'),
        'patient_department': patient.get('department'),
        'patient_municipality': patient.get('municipality'),
        'patient_reference': patient.get('reference'),
        'admission_reason': admission.get('reason'),
        'admission_type': admission.get('admission_type') or admission.get('admissionType'),
        'admission_priority': admission.get('priority') or admission.get('priorityLevel'),
        'doctor_id': doctor_identifier,
        'doctor_label': admission.get('doctor_label'),
        'care_area': admission.get('care_area') or admission.get('careArea'),
        'room': habitacion.id if habitacion else None,
        'room_label': room_label,
        'admission_at': _coerce_datetime(admission.get('admission_at') or admission.get('admissionDate')),
        'estimated_stay_days': estimated_stay,
        'additional_notes': admission.get('additional_notes') or admission.get('additionalNotes'),
        'emergency_name': emergency.get('name'),
        'emergency_relationship': emergency.get('relationship'),
        'emergency_phone': emergency.get('phone'),
        'emergency_notes': emergency.get('notes'),
        'coverage_type': financial.get('coverage_type') or financial.get('coverageType'),
        'insurer': aseguradora.id if aseguradora else None,
        'plan_code': financial.get('plan_code') or financial.get('planCode'),
        'coverage_notes': financial.get('notes'),
        'billing_name': financial.get('billing_name') or financial.get('billingName'),
        'billing_tax_id': financial.get('billing_tax_id') or financial.get('billingTaxId'),
        'billing_email': financial.get('billing_email') or financial.get('billingEmail'),
    }
    return flattened


@api_view(['POST'])
def crear_solicitud_ingreso(request):
    flattened = _flatten_payload(request.data)
    serializer = IngresoSolicitudSerializer(data=flattened)
    if serializer.is_valid():
        solicitud = serializer.save()
        return Response(
            {
                'message': 'Solicitud registrada correctamente',
                'reference': solicitud.intake_reference,
                'record': IngresoSolicitudSerializer(solicitud).data
            },
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def listar_solicitudes_ingreso(request):
    queryset = IngresoSolicitud.objects.all()
    serializer = IngresoSolicitudSerializer(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def detalle_solicitud_ingreso(request, pk):
    try:
        solicitud = IngresoSolicitud.objects.get(pk=pk)
    except IngresoSolicitud.DoesNotExist:
        return Response({'detail': 'Registro no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    serializer = IngresoSolicitudSerializer(solicitud)
    return Response(serializer.data, status=status.HTTP_200_OK)
