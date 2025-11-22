from django.db import models

class Proveedor(models.Model):
    ESTADO_CHOICES = [
        ('alta', 'Alta'),
        ('baja', 'Baja'),
    ]

    nit = models.CharField(max_length=20, blank=True, null=True)
    nombre = models.TextField()
    direccion = models.TextField(blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    correo = models.EmailField(blank=True, null=True)
    pagina_web = models.URLField(blank=True, null=True)
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default='alta')
    observaciones = models.TextField(blank=True, null=True)

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre
