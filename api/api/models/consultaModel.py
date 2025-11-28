from django.db import models

from .admisionesModel import Paciente
from .mantenimientoModel import Departamento


class Consulta(models.Model):
    paciente = models.ForeignKey(
        Paciente,
        on_delete=models.CASCADE,
        related_name='consultas'
    )
    departamento = models.ForeignKey(
        Departamento,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='consultas'
    )
    fecha = models.DateField()
    nombre_paciente = models.CharField(max_length=255)
    edad = models.PositiveIntegerField(null=True, blank=True)

    mc = models.TextField(help_text="Motivo de consulta")
    hea = models.TextField(help_text="Historia de la enfermedad actual")

    sv_pa = models.CharField(max_length=50, blank=True, null=True)
    sv_fc = models.CharField(max_length=50, blank=True, null=True)
    sv_fr = models.CharField(max_length=50, blank=True, null=True)
    sv_sat = models.CharField(max_length=50, blank=True, null=True)
    sv_peso = models.CharField(max_length=50, blank=True, null=True)

    examen_fisico = models.TextField(blank=True, null=True)
    estudios = models.TextField(blank=True, null=True)

    impresion_clinica = models.JSONField(default=list, blank=True)
    tratamiento = models.JSONField(default=list, blank=True)
    plan = models.JSONField(default=list, blank=True)

    medico = models.CharField(max_length=150, blank=True, null=True)
    monto = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    metodo_pago = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        ordering = ['-fecha']

    def __str__(self):
        return f"Consulta {self.id} - {self.nombre_paciente}"
