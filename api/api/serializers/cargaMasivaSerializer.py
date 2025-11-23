from rest_framework import serializers

from ..models.cargaMasivaModel import (
    CargaMasivaExistencia,
    CargaMasivaExistenciaItem,
    CargaMasivaPrecio,
    CargaMasivaPrecioItem,
    CargaMasivaAdmision,
    CargaMasivaAdmisionItem,
)


class CargaMasivaExistenciaItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CargaMasivaExistenciaItem
        fields = (
            'id',
            'sku',
            'descripcion',
            'cantidad_cargada',
            'cantidad_anterior',
            'cantidad_resultante',
        )


class CargaMasivaExistenciaSerializer(serializers.ModelSerializer):
    items = CargaMasivaExistenciaItemSerializer(many=True, read_only=True)

    class Meta:
        model = CargaMasivaExistencia
        fields = (
            'id',
            'bodega',
            'usuario',
            'archivo_nombre',
            'created_at',
            'items',
        )


class CargaMasivaPrecioItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CargaMasivaPrecioItem
        fields = (
            'id',
            'sku',
            'descripcion',
            'precio_anterior',
            'precio_nuevo',
        )


class CargaMasivaPrecioSerializer(serializers.ModelSerializer):
    items = CargaMasivaPrecioItemSerializer(many=True, read_only=True)

    class Meta:
        model = CargaMasivaPrecio
        fields = (
            'id',
            'seguro',
            'usuario',
            'archivo_nombre',
            'created_at',
            'items',
        )


class CargaMasivaAdmisionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CargaMasivaAdmisionItem
        fields = (
            'id',
            'expediente',
            'nombre',
            'telefono',
            'telefono_secundario',
            'departamento',
            'municipio',
            'referencia',
            'contacto_emergencia',
            'dpi',
            'estado',
            'mensaje',
            'admision_id',
            'paciente_id',
        )


class CargaMasivaAdmisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CargaMasivaAdmision
        fields = (
            'id',
            'usuario',
            'archivo_nombre',
            'archivo_fuente',
            'total_creados',
            'total_omitidos',
            'total_errores',
            'created_at',
        )


class CargaMasivaAdmisionDetalleSerializer(serializers.ModelSerializer):
    items = CargaMasivaAdmisionItemSerializer(many=True, read_only=True)

    class Meta:
        model = CargaMasivaAdmision
        fields = (
            'id',
            'usuario',
            'archivo_nombre',
            'archivo_fuente',
            'total_creados',
            'total_omitidos',
            'total_errores',
            'created_at',
            'items',
        )
