from rest_framework import serializers

from ..models.ingresosModel import IngresoSolicitud


class IngresoSolicitudSerializer(serializers.ModelSerializer):
    class Meta:
        model = IngresoSolicitud
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
