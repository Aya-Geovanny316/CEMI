from django.urls import path

from ..views.ingresosViews import (
    crear_solicitud_ingreso,
    listar_solicitudes_ingreso,
    detalle_solicitud_ingreso
)

urlpatterns = [
    path('', crear_solicitud_ingreso, name='crear_solicitud_ingreso'),
    path('solicitudes/', listar_solicitudes_ingreso, name='listar_solicitudes_ingreso'),
    path('solicitudes/<int:pk>/', detalle_solicitud_ingreso, name='detalle_solicitud_ingreso'),
]
