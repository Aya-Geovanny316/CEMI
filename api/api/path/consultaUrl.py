from django.urls import path

from ..views.consultaViews import (
    crear_consulta,
    detalle_consulta,
    listar_consultas,
    listar_pacientes_consulta,
    recibo_consulta_pdf,
)

urlpatterns = [
    path('pacientes/', listar_pacientes_consulta, name='consulta_listar_pacientes'),
    path('', crear_consulta, name='consulta_crear'),
    path('consultas/', listar_consultas, name='consulta_listar'),
    path('<int:pk>/', detalle_consulta, name='consulta_detalle'),
    path('<int:pk>/recibo/', recibo_consulta_pdf, name='consulta_recibo_pdf'),
]
