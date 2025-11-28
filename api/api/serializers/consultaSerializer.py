from django.db.models import Q
from rest_framework import serializers

from ..models.admisionesModel import Paciente
from ..models.consultaModel import Consulta
from ..models.mantenimientoModel import Departamento


class PacienteConsultaSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.SerializerMethodField()

    class Meta:
        model = Paciente
        fields = [
            'id',
            'nombre_completo',
            'numero_identificacion',
            'tipo_identificacion',
            'telefono',
            'telefono1',
            'correo',
            'genero',
            'fecha_nacimiento',
        ]

    def get_nombre_completo(self, obj):
        return " ".join(filter(None, [
            obj.primer_nombre,
            obj.segundo_nombre,
            obj.primer_apellido,
            obj.segundo_apellido,
            obj.apellido_casada,
        ])).strip()

    @staticmethod
    def search_queryset(queryset, search_term):
        if not search_term:
            return queryset
        search_term = search_term.strip()
        return queryset.filter(
            Q(primer_nombre__icontains=search_term) |
            Q(segundo_nombre__icontains=search_term) |
            Q(primer_apellido__icontains=search_term) |
            Q(segundo_apellido__icontains=search_term) |
            Q(apellido_casada__icontains=search_term) |
            Q(numero_identificacion__icontains=search_term)
        )


class ConsultaSerializer(serializers.ModelSerializer):
    paciente = PacienteConsultaSerializer(read_only=True)
    paciente_id = serializers.PrimaryKeyRelatedField(
        source='paciente',
        queryset=Paciente.objects.all(),
        write_only=True
    )
    departamento_id = serializers.PrimaryKeyRelatedField(
        source='departamento',
        queryset=Departamento.objects.all(),
        write_only=True,
        allow_null=True,
        required=False
    )
    departamento = serializers.CharField(read_only=True, source='departamento.nombre')

    class Meta:
        model = Consulta
        fields = [
            'id',
            'paciente',
            'paciente_id',
            'departamento',
            'departamento_id',
            'fecha',
            'nombre_paciente',
            'edad',
            'mc',
            'hea',
            'sv_pa',
            'sv_fc',
            'sv_fr',
            'sv_sat',
            'sv_peso',
            'examen_fisico',
            'estudios',
            'impresion_clinica',
            'tratamiento',
            'plan',
            'medico',
            'monto',
            'metodo_pago',
        ]
        read_only_fields = ['id', 'paciente', 'departamento']

    def to_internal_value(self, data):
        # normalizar listas que puedan venir como string o arreglo
        for field in ['impresion_clinica', 'tratamiento', 'plan']:
            value = data.get(field)
            if isinstance(value, str):
                # separar por saltos de linea
                data[field] = [item.strip() for item in value.split('\n') if item.strip()]
        return super().to_internal_value(data)
