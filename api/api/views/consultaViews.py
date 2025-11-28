import os
from datetime import date

from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.urls import reverse
from pathlib import Path
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from weasyprint import HTML

from ..models.admisionesModel import Paciente
from ..models.consultaModel import Consulta
from ..serializers.consultaSerializer import (
    ConsultaSerializer,
    PacienteConsultaSerializer,
)


def _nombre_paciente(paciente: Paciente) -> str:
    return " ".join(filter(None, [
        paciente.primer_nombre,
        paciente.segundo_nombre,
        paciente.primer_apellido,
        paciente.segundo_apellido,
        paciente.apellido_casada,
    ])).strip()


def _calcular_edad(fecha_nacimiento):
    if not fecha_nacimiento:
        return None
    hoy = date.today()
    return hoy.year - fecha_nacimiento.year - (
        (hoy.month, hoy.day) < (fecha_nacimiento.month, fecha_nacimiento.day)
    )


@api_view(['GET'])
def listar_pacientes_consulta(request):
    search_term = request.query_params.get('q', '')
    pacientes_qs = PacienteConsultaSerializer.search_queryset(Paciente.objects.all(), search_term)
    pacientes = pacientes_qs.order_by('primer_nombre', 'primer_apellido')
    serializer = PacienteConsultaSerializer(pacientes, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def listar_consultas(request):
    paciente_id = request.query_params.get('paciente_id')
    consultas = Consulta.objects.select_related('paciente', 'departamento').all()
    if paciente_id:
        consultas = consultas.filter(paciente_id=paciente_id)
    serializer = ConsultaSerializer(consultas, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
def crear_consulta(request):
    serializer = ConsultaSerializer(data=request.data)
    if serializer.is_valid():
        consulta = serializer.save()
        data = ConsultaSerializer(consulta).data
        recibo_url = request.build_absolute_uri(
            reverse('consulta_recibo_pdf', args=[consulta.id])
        )
        return Response(
            {
                "message": "Consulta creada correctamente",
                "consulta": data,
                "recibo_url": recibo_url,
            },
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def detalle_consulta(request, pk):
    consulta = get_object_or_404(
        Consulta.objects.select_related('paciente'),
        pk=pk
    )
    if request.method == 'GET':
        serializer = ConsultaSerializer(consulta)
        return Response(serializer.data, status=status.HTTP_200_OK)
    if request.method == 'DELETE':
        consulta.delete()
        return Response({"message": "Consulta eliminada"}, status=status.HTTP_204_NO_CONTENT)
    return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['GET'])
def recibo_consulta_pdf(request, pk):
    consulta = get_object_or_404(
        Consulta.objects.select_related('paciente', 'departamento'),
        pk=pk
    )
    paciente = consulta.paciente
    logo_file = Path(settings.BASE_DIR) / 'api' / 'static' / 'img' / 'hospital_image.jpg'
    context = {
        "consulta_id": consulta.id,
        "fecha": consulta.fecha.strftime('%d/%m/%Y'),
        "departamento": consulta.departamento.nombre if consulta.departamento else "Departamento",
        "paciente": {
            "nombre": consulta.nombre_paciente or _nombre_paciente(paciente) or "Paciente sin nombre",
            "edad": consulta.edad or _calcular_edad(paciente.fecha_nacimiento),
        },
        "mc": consulta.mc,
        "hea": consulta.hea,
        "signos_vitales": {
            "pa": consulta.sv_pa or "",
            "fc": consulta.sv_fc or "",
            "fr": consulta.sv_fr or "",
            "sat": consulta.sv_sat or "",
            "peso": consulta.sv_peso or "",
        },
        "examen_fisico": consulta.examen_fisico or "",
        "estudios": consulta.estudios or "",
        "impresion_clinica": consulta.impresion_clinica or [],
        "tratamiento": consulta.tratamiento or [],
        "plan": consulta.plan or [],
        "logo_path": logo_file.as_uri() if logo_file.exists() else None,
    }

    html_string = render_to_string('consulta_recibo.html', context)
    pdf_file = HTML(string=html_string, base_url=settings.BASE_DIR).write_pdf()

    response = HttpResponse(pdf_file, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="consulta_{consulta.id}.pdf"'
    return response
