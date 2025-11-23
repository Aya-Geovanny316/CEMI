from django.db import models


class CargaMasivaExistencia(models.Model):
    bodega = models.CharField(max_length=150)
    usuario = models.CharField(max_length=150, blank=True, null=True)
    archivo_nombre = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class CargaMasivaExistenciaItem(models.Model):
    carga = models.ForeignKey(CargaMasivaExistencia, related_name='items', on_delete=models.CASCADE)
    sku = models.CharField(max_length=100)
    descripcion = models.CharField(max_length=255, blank=True, null=True)
    cantidad_cargada = models.IntegerField()
    cantidad_anterior = models.IntegerField(default=0)
    cantidad_resultante = models.IntegerField(default=0)


class CargaMasivaPrecio(models.Model):
    seguro = models.CharField(max_length=150)
    usuario = models.CharField(max_length=150, blank=True, null=True)
    archivo_nombre = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class CargaMasivaPrecioItem(models.Model):
    carga = models.ForeignKey(CargaMasivaPrecio, related_name='items', on_delete=models.CASCADE)
    sku = models.CharField(max_length=100)
    descripcion = models.CharField(max_length=255, blank=True, null=True)
    precio_anterior = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    precio_nuevo = models.DecimalField(max_digits=12, decimal_places=2)


class CargaMasivaAdmision(models.Model):
    usuario = models.CharField(max_length=150, blank=True, null=True)
    archivo_nombre = models.CharField(max_length=255, blank=True, null=True)
    archivo_fuente = models.TextField(blank=True, null=True)
    total_creados = models.IntegerField(default=0)
    total_omitidos = models.IntegerField(default=0)
    total_errores = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class CargaMasivaAdmisionItem(models.Model):
    ESTADO_CHOICES = (
        ('creado', 'Creado'),
        ('omitido', 'Omitido'),
        ('error', 'Error'),
    )

    carga = models.ForeignKey(CargaMasivaAdmision, related_name='items', on_delete=models.CASCADE)
    expediente = models.CharField(max_length=50, blank=True, null=True)
    nombre = models.CharField(max_length=255, blank=True, null=True)
    telefono = models.CharField(max_length=100, blank=True, null=True)
    telefono_secundario = models.CharField(max_length=100, blank=True, null=True)
    departamento = models.CharField(max_length=100, blank=True, null=True)
    municipio = models.CharField(max_length=100, blank=True, null=True)
    referencia = models.CharField(max_length=255, blank=True, null=True)
    contacto_emergencia = models.CharField(max_length=255, blank=True, null=True)
    dpi = models.CharField(max_length=50, blank=True, null=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='creado')
    mensaje = models.TextField(blank=True, null=True)
    admision_id = models.IntegerField(blank=True, null=True)
    paciente_id = models.IntegerField(blank=True, null=True)
