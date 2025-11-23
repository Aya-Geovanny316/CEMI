from copy import deepcopy

from django.db.models import Max
from django.http import QueryDict
from rest_framework import serializers

from ..models.admisionesModel import (
    Paciente, Acompanante, Responsable, Esposo,
    DatosLaborales, DatosSeguro, GarantiaPago, Admision,
    MovimientoCuenta
)
from ..models.habitacionModel import Habitacion
from ..models import Seguros
from ..serializers.habitacionSerializer import HabitacionSerializer

# 🔹 Serializers simples para cada modelo
class PacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente
        fields = '__all__'

class AcompananteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Acompanante
        fields = '__all__'

class ResponsableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Responsable
        fields = '__all__'

class EsposoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Esposo
        fields = '__all__'

class DatosLaboralesSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatosLaborales
        fields = '__all__'

class DatosSeguroSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatosSeguro
        fields = '__all__'

class GarantiaPagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = GarantiaPago
        fields = '__all__'


# 🔹 Para detalle (GET)
class AdmisionDetalleSerializer(serializers.ModelSerializer):
    paciente = PacienteSerializer()
    responsable = ResponsableSerializer()
    esposo = EsposoSerializer()
    datos_laborales = DatosLaboralesSerializer()
    datos_seguro = DatosSeguroSerializer()
    garantia_pago = GarantiaPagoSerializer()
    acompanantes = AcompananteSerializer(many=True, read_only=True)  # ✅ ESTA LÍNEA AGREGA LOS ACOMPAÑANTES
    habitacion_fk = HabitacionSerializer(read_only=True)

    class Meta:
        model = Admision
        fields = '__all__'


# 🔹 Para creación (POST) desde datos planos
class AdmisionCreateSerializer(serializers.ModelSerializer):
    @staticmethod
    def _to_plain_dict(data):
        if isinstance(data, QueryDict):
            return {key: value[0] if isinstance(value, list) and len(value) == 1 else value
                    for key, value in data.lists()}
        if isinstance(data, dict):
            return deepcopy(data)
        return dict(data)

    @staticmethod
    def _split_name(full_name):
        parts = [segment for segment in (full_name or '').split() if segment]
        if not parts:
            return '', '', '', ''
        if len(parts) == 1:
            return parts[0], '', '', ''
        if len(parts) == 2:
            return parts[0], '', parts[1], ''
        if len(parts) == 3:
            return parts[0], parts[1], parts[2], ''
        return parts[0], parts[1], parts[-2], parts[-1]

    @staticmethod
    def normalize_payload(raw_data):
        """
        Permite recibir tanto el payload plano anterior como la nueva estructura
        anidada enviada desde la pantalla de ingresos.
        """
        base = AdmisionCreateSerializer._to_plain_dict(raw_data)
        if 'patient_profile' not in base:
            return base

        normalized = deepcopy(base)
        patient = base.get('patient_profile') or {}
        document = patient.get('document') or {}
        admission = base.get('admission_details') or {}
        emergency = base.get('emergency_contact') or {}
        financial = base.get('financial_snapshot') or {}

        p_first, p_second, p_last, p_second_last = AdmisionCreateSerializer._split_name(
            patient.get('full_name', '')
        )
        normalized['p_primer_nombre'] = normalized.get('p_primer_nombre') or p_first
        normalized['p_segundo_nombre'] = normalized.get('p_segundo_nombre') or p_second
        normalized['p_primer_apellido'] = normalized.get('p_primer_apellido') or p_last
        normalized['p_segundo_apellido'] = normalized.get('p_segundo_apellido') or p_second_last
        normalized['p_genero'] = normalized.get('p_genero') or patient.get('gender')
        normalized['p_estado_civil'] = normalized.get('p_estado_civil') or patient.get('civil_status')
        normalized['p_fecha_nacimiento'] = normalized.get('p_fecha_nacimiento') or patient.get('birth_date')
        normalized['p_tipo_identificacion'] = normalized.get('p_tipo_identificacion') or document.get('type')
        normalized['p_numero_identificacion'] = normalized.get('p_numero_identificacion') or document.get('number')
        normalized['p_telefono'] = normalized.get('p_telefono') or patient.get('phone')
        normalized['direccion'] = normalized.get('direccion') or patient.get('address')
        normalized['departamento'] = normalized.get('departamento') or patient.get('department')
        normalized['municipio'] = normalized.get('municipio') or patient.get('municipality')
        normalized['referencia'] = normalized.get('referencia') or patient.get('reference')
        normalized['edad'] = normalized.get('edad') or patient.get('age_years')
        normalized['contacto_emergencia'] = normalized.get('contacto_emergencia') or patient.get('emergency_contact')
        normalized['telefono1'] = normalized.get('telefono1') or patient.get('phone')
        normalized['correo'] = normalized.get('correo') or patient.get('email')
        normalized['observacion'] = normalized.get('observacion') or admission.get('additional_notes')
        normalized['nit'] = normalized.get('nit') or financial.get('billingTaxId')
        normalized['nombreFactura'] = normalized.get('nombreFactura') or financial.get('billingName')
        normalized['direccionFactura'] = normalized.get('direccionFactura') or patient.get('address')
        normalized['correoFactura'] = normalized.get('correoFactura') or financial.get('billingEmail')
        if (normalized.get('edad') in (None, '', 0)) and normalized.get('p_fecha_nacimiento'):
            try:
                birth_date = normalized['p_fecha_nacimiento']
                if isinstance(birth_date, str):
                    from datetime import date
                    try:
                        birth_date = date.fromisoformat(birth_date)
                    except Exception:
                        birth_date = None
                if birth_date:
                    from datetime import date
                    today = date.today()
                    normalized['edad'] = today.year - birth_date.year - (
                        (today.month, today.day) < (birth_date.month, birth_date.day)
                    )
            except Exception:
                pass

        r_first, r_second, r_last, r_second_last = AdmisionCreateSerializer._split_name(
            emergency.get('name', '')
        )
        normalized['responsablePrimerNombre'] = normalized.get('responsablePrimerNombre') or r_first
        normalized['responsableSegundoNombre'] = normalized.get('responsableSegundoNombre') or r_second
        normalized['responsablePrimerApellido'] = normalized.get('responsablePrimerApellido') or r_last
        normalized['responsableSegundoApellido'] = normalized.get('responsableSegundoApellido') or r_second_last
        normalized['responsableRelacionPaciente'] = normalized.get('responsableRelacionPaciente') or emergency.get('relationship')
        normalized['responsableTelefono1'] = normalized.get('responsableTelefono1') or emergency.get('phone')
        normalized['responsableContacto'] = normalized.get('responsableContacto') or emergency.get('notes')
        normalized['responsableEmail'] = normalized.get('responsableEmail') or emergency.get('email')

        normalized['area_admision'] = normalized.get('area_admision') or admission.get('care_area')
        normalized['habitacion'] = normalized.get('habitacion') or admission.get('room_id')
        doctor_label = admission.get('doctor_label') or admission.get('doctor_id')
        normalized['medico_tratante'] = normalized.get('medico_tratante') or doctor_label
        normalized['tipoGarantia'] = normalized.get('tipoGarantia') or financial.get('coverage_type')
        normalized['listaPrecios'] = normalized.get('listaPrecios') or financial.get('planCode')
        normalized['aseguradoraId'] = normalized.get('aseguradoraId') or financial.get('insurer_id')
        normalized['coverageNotes'] = normalized.get('coverageNotes') or financial.get('notes')
        normalized['nombreTitular'] = normalized.get('nombreTitular') or patient.get('full_name')

        if normalized.get('habitacion') is not None:
            normalized['habitacion'] = str(normalized['habitacion'])

        normalized.setdefault('acompanantes', base.get('acompanantes', []))

        return normalized

    class Meta:
        model = Admision
        fields = ['area_admision', 'habitacion', 'medico_tratante']

    def create(self, validated_data):
        request_data = self.context.get('normalized_payload') or self.context['request'].data

        aseguradora_nombre = request_data.get('aseguradora')
        aseguradora_id = request_data.get('aseguradoraId')
        if (not aseguradora_nombre) and aseguradora_id:
            try:
                aseguradora_nombre = Seguros.objects.get(id=int(aseguradora_id)).nombre
            except (Seguros.DoesNotExist, ValueError, TypeError):
                aseguradora_nombre = None

        paciente = Paciente.objects.create(
            primer_nombre=request_data.get('p_primer_nombre'),
            segundo_nombre=request_data.get('p_segundo_nombre'),
            primer_apellido=request_data.get('p_primer_apellido'),
            segundo_apellido=request_data.get('p_segundo_apellido'),
            apellido_casada=request_data.get('p_apellido_casada'),
            genero=request_data.get('p_genero'),
            estado_civil=request_data.get('p_estado_civil'),
            fecha_nacimiento=request_data.get('p_fecha_nacimiento'),
            edad=request_data.get('edad'),
            tipo_identificacion=request_data.get('p_tipo_identificacion'),
            numero_identificacion=request_data.get('p_numero_identificacion'),
            telefono=request_data.get('p_telefono'),
            direccion=request_data.get('direccion'),
            departamento=request_data.get('departamento'),
            municipio=request_data.get('municipio'),
            referencia=request_data.get('referencia'),
            telefono1=request_data.get('telefono1'),
            telefono2=request_data.get('telefono2'),
            correo=request_data.get('correo'),
            observacion=request_data.get('observacion'),
            religion=request_data.get('religion'),
            contacto_emergencia=request_data.get('contacto_emergencia'),
            nit=request_data.get('nit'),
            nombre_factura=request_data.get('nombreFactura'),
            direccion_factura=request_data.get('direccionFactura'),
            correo_factura=request_data.get('correoFactura'),
            tipo_sangre=request_data.get('tipo_sangre'),
        )

        responsable = Responsable.objects.create(
            primer_nombre=request_data.get('responsablePrimerNombre'),
            segundo_nombre=request_data.get('responsableSegundoNombre'),
            primer_apellido=request_data.get('responsablePrimerApellido'),
            segundo_apellido=request_data.get('responsableSegundoApellido'),
            tipo_identificacion=request_data.get('responsableTipoIdentificacion'),
            numero_identificacion=request_data.get('responsableNumeroIdentificacion'),
            fecha_nacimiento=request_data.get('responsableFechaNacimiento'),
            edad=request_data.get('responsableEdad'),
            genero=request_data.get('responsableGenero'),
            relacion_paciente=request_data.get('responsableRelacionPaciente'),
            ocupacion=request_data.get('responsableOcupacion'),
            domicilio=request_data.get('responsableDomicilio'),
            empresa=request_data.get('responsableEmpresa'),
            direccion=request_data.get('responsableDireccion'),
            telefono1=request_data.get('responsableTelefono1'),
            telefono2=request_data.get('responsableTelefono2'),
            contacto=request_data.get('responsableContacto'),
            email=request_data.get('responsableEmail')
        )

        esposo = Esposo.objects.create(
            nombre=request_data.get('esposoNombre'),
            genero=request_data.get('esposoGenero'),
            tipo_identificacion=request_data.get('esposoTipoIdentificacion'),
            numero_identificacion=request_data.get('esposoNumeroIdentificacion'),
            fecha_nacimiento=request_data.get('esposoFechaNacimiento'),
            edad=request_data.get('esposoEdad'),
            telefono1=request_data.get('esposoTelefono1'),
            telefono2=request_data.get('esposoTelefono2'),
            domicilio=request_data.get('esposoDomicilio'),
            ocupacion=request_data.get('esposoOcupacion'),
            empresa=request_data.get('esposoEmpresa'),
            direccion=request_data.get('esposoDireccion'),
            email=request_data.get('esposoEmail')
        )

        datos_laborales = DatosLaborales.objects.create(
            empresa=request_data.get('empresa'),
            direccion=request_data.get('direccionEmpresa'),
            telefono1=request_data.get('telefonoEmpresa1'),
            telefono2=request_data.get('telefonoEmpresa2'),
            ocupacion=request_data.get('ocupacion')
        )

        datos_seguro = DatosSeguro.objects.create(
            aseguradora=aseguradora_nombre,
            lista_precios=request_data.get('listaPrecios'),
            carnet=request_data.get('carnet'),
            certificado=request_data.get('certificado'),
            nombre_titular=request_data.get('nombreTitular'),
            coaseguro=request_data.get('coaseguro'),
            valor_copago=request_data.get('valorCopago'),
            valor_deducible=request_data.get('valorDeducible'),
            numero_poliza=request_data.get('numero_poliza')
        )

        garantia_pago = GarantiaPago.objects.create(
            tipo=request_data.get('tipoGarantia'),
            numero_tc_cheque=request_data.get('numeroTcCheque'),
            nit=request_data.get('nit'),
            nombre_factura=request_data.get('nombreFactura'),
            direccion_factura=request_data.get('direccionFactura'),
            correo_factura=request_data.get('correoFactura')
        )

        estado = validated_data.pop('estado', 'ingresado') 

        ultimo_id = Admision.objects.aggregate(Max('id'))['id__max']
        nuevo_id = max(7000, (ultimo_id or 6999) + 1)

        admision = Admision.objects.create(
            id=nuevo_id,
            paciente=paciente,
            responsable=responsable,
            esposo=esposo,
            datos_laborales=datos_laborales,
            datos_seguro=datos_seguro,
            garantia_pago=garantia_pago,
            estado=estado,
            **validated_data
        )

        habitacion_obj = None
        habitacion_id = request_data.get('habitacion')
        if habitacion_id:
            try:
                habitacion_obj = Habitacion.objects.get(id=int(habitacion_id))
            except (Habitacion.DoesNotExist, ValueError, TypeError):
                habitacion_obj = None

        if habitacion_obj:
            nombre_paciente = " ".join(filter(None, [
                paciente.primer_nombre,
                paciente.segundo_nombre,
                paciente.primer_apellido,
                paciente.segundo_apellido,
                paciente.apellido_casada,
            ])).strip() or None

            habitacion_obj.estado = 'Ocupada Inspeccionada'
            habitacion_obj.admision = admision
            habitacion_obj.paciente = nombre_paciente
            habitacion_obj.save(update_fields=['estado', 'admision', 'paciente'])

            admision.habitacion_fk = habitacion_obj
            admision.habitacion = str(habitacion_obj.id)
            admision.save(update_fields=['habitacion_fk', 'habitacion'])

        # Guardar acompañantes después de crear la admisión
        acompanantes_data = request_data.get('acompanantes', [])
        for acompanante_data in acompanantes_data:
            if acompanante_data.get('nombre') or acompanante_data.get('telefono'):
                Acompanante.objects.create(
                    admision=admision,
                    nombre=acompanante_data.get('nombre'),
                    tipo_identificacion=acompanante_data.get('tipoIdentificacion'),
                    numero_identificacion=acompanante_data.get('numeroIdentificacion'),
                    fecha_nacimiento=acompanante_data.get('fechaNacimiento'),
                    edad=acompanante_data.get('edad'),
                    genero=acompanante_data.get('genero'),
                    correo=acompanante_data.get('correo'),
                    nit=acompanante_data.get('nit'),
                    tipo=acompanante_data.get('tipo'),
                    responsable_cuenta=acompanante_data.get('responsableCuenta', False),
                    direccion_laboral=acompanante_data.get('direccionLaboral'),
                    telefono_empresa=acompanante_data.get('telefonoEmpresa'),
                    contacto=acompanante_data.get('contacto'),
                    correo_contacto=acompanante_data.get('correoContacto'),
                    telefono_contacto=acompanante_data.get('telefonoContacto')
                )


        return admision

# 🔹 Para actualización (PUT) — espera datos anidados

class AdmisionUpdateFlatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admision
        fields = ['area_admision', 'habitacion', 'medico_tratante']

    def update(self, instance, validated_data):
        data = self.context['request'].data

        def actualizar_si_existe(obj, field, data, key):
            if key in data and data[key] is not None:
                setattr(obj, field, data[key])

        habitacion_actual = instance.habitacion_fk
        nueva_habitacion = None
        habitacion_id = data.get('habitacion')
        if habitacion_id:
            try:
                nueva_habitacion = Habitacion.objects.get(id=int(habitacion_id))
            except (Habitacion.DoesNotExist, ValueError, TypeError):
                nueva_habitacion = None

        # Paciente
        paciente = instance.paciente
        actualizar_si_existe(paciente, 'primer_nombre', data, 'p_primer_nombre')
        actualizar_si_existe(paciente, 'segundo_nombre', data, 'p_segundo_nombre')
        actualizar_si_existe(paciente, 'primer_apellido', data, 'p_primer_apellido')
        actualizar_si_existe(paciente, 'segundo_apellido', data, 'p_segundo_apellido')
        actualizar_si_existe(paciente, 'apellido_casada', data, 'p_apellido_casada')
        actualizar_si_existe(paciente, 'genero', data, 'p_genero')
        actualizar_si_existe(paciente, 'estado_civil', data, 'p_estado_civil')
        actualizar_si_existe(paciente, 'fecha_nacimiento', data, 'p_fecha_nacimiento')
        actualizar_si_existe(paciente, 'edad', data, 'edad')
        actualizar_si_existe(paciente, 'tipo_identificacion', data, 'p_tipo_identificacion')
        actualizar_si_existe(paciente, 'numero_identificacion', data, 'p_numero_identificacion')
        actualizar_si_existe(paciente, 'telefono', data, 'p_telefono')
        actualizar_si_existe(paciente, 'direccion', data, 'direccion')
        actualizar_si_existe(paciente, 'departamento', data, 'departamento')
        actualizar_si_existe(paciente, 'municipio', data, 'municipio')
        actualizar_si_existe(paciente, 'referencia', data, 'referencia')
        actualizar_si_existe(paciente, 'telefono1', data, 'telefono1')
        actualizar_si_existe(paciente, 'telefono2', data, 'telefono2')
        actualizar_si_existe(paciente, 'correo', data, 'correo')
        actualizar_si_existe(paciente, 'observacion', data, 'observacion')
        actualizar_si_existe(paciente, 'religion', data, 'religion')
        actualizar_si_existe(paciente, 'contacto_emergencia', data, 'contacto_emergencia')
        actualizar_si_existe(paciente, 'nit', data, 'nit')
        actualizar_si_existe(paciente, 'nombre_factura', data, 'nombreFactura')
        actualizar_si_existe(paciente, 'direccion_factura', data, 'direccionFactura')
        actualizar_si_existe(paciente, 'correo_factura', data, 'correoFactura')
        actualizar_si_existe(paciente, 'tipo_sangre', data, 'tipo_sangre')
        paciente.save()

        nombre_paciente = " ".join(filter(None, [
            paciente.primer_nombre,
            paciente.segundo_nombre,
            paciente.primer_apellido,
            paciente.segundo_apellido,
            paciente.apellido_casada,
        ])).strip() or None

        # Actualizar o reemplazar acompañantes
        acompanantes_data = data.get('acompanantes', [])
        if acompanantes_data:
            instance.acompanantes.all().delete()

            for acomp in acompanantes_data:
                # Solo omitir acompañantes completamente vacíos
                if all(not acomp.get(k) for k in ['nombre', 'numeroIdentificacion']):
                    continue


                Acompanante.objects.create(
                    admision=instance,
                    nombre=acomp.get('nombre'),
                    tipo_identificacion=acomp.get('tipoIdentificacion'),
                    numero_identificacion=acomp.get('numeroIdentificacion'),
                    fecha_nacimiento=acomp.get('fechaNacimiento') or None,
                    edad=acomp.get('edad') or "",
                    genero=acomp.get('genero'),
                    correo=acomp.get('correo'),
                    nit=acomp.get('nit'),
                    tipo=acomp.get('tipo'),
                    responsable_cuenta=acomp.get('responsableCuenta', False),
                    direccion_laboral=acomp.get('direccionLaboral'),
                    telefono_empresa=acomp.get('telefonoEmpresa'),
                    contacto=acomp.get('contacto'),
                    correo_contacto=acomp.get('correoContacto'),
                    telefono_contacto=acomp.get('telefonoContacto'),
                )


        # Responsable
        if instance.responsable:
            r = instance.responsable
            actualizar_si_existe(r, 'primer_nombre', data, 'responsablePrimerNombre')
            actualizar_si_existe(r, 'segundo_nombre', data, 'responsableSegundoNombre')
            actualizar_si_existe(r, 'primer_apellido', data, 'responsablePrimerApellido')
            actualizar_si_existe(r, 'segundo_apellido', data, 'responsableSegundoApellido')
            actualizar_si_existe(r, 'tipo_identificacion', data, 'responsableTipoIdentificacion')
            actualizar_si_existe(r, 'numero_identificacion', data, 'responsableNumeroIdentificacion')
            actualizar_si_existe(r, 'fecha_nacimiento', data, 'responsableFechaNacimiento')
            actualizar_si_existe(r, 'edad', data, 'responsableEdad')
            actualizar_si_existe(r, 'genero', data, 'responsableGenero')
            actualizar_si_existe(r, 'relacion_paciente', data, 'responsableRelacionPaciente')
            actualizar_si_existe(r, 'ocupacion', data, 'responsableOcupacion')
            actualizar_si_existe(r, 'domicilio', data, 'responsableDomicilio')
            actualizar_si_existe(r, 'empresa', data, 'responsableEmpresa')
            actualizar_si_existe(r, 'direccion', data, 'responsableDireccion')
            actualizar_si_existe(r, 'telefono1', data, 'responsableTelefono1')
            actualizar_si_existe(r, 'telefono2', data, 'responsableTelefono2')
            actualizar_si_existe(r, 'contacto', data, 'responsableContacto')
            actualizar_si_existe(r, 'email', data, 'responsableEmail')
            r.save()

        # Esposo
        if instance.esposo:
            e = instance.esposo
            actualizar_si_existe(e, 'nombre', data, 'esposoNombre')
            actualizar_si_existe(e, 'genero', data, 'esposoGenero')
            actualizar_si_existe(e, 'tipo_identificacion', data, 'esposoTipoIdentificacion')
            actualizar_si_existe(e, 'numero_identificacion', data, 'esposoNumeroIdentificacion')
            actualizar_si_existe(e, 'fecha_nacimiento', data, 'esposoFechaNacimiento')
            actualizar_si_existe(e, 'edad', data, 'esposoEdad')
            actualizar_si_existe(e, 'telefono1', data, 'esposoTelefono1')
            actualizar_si_existe(e, 'telefono2', data, 'esposoTelefono2')
            actualizar_si_existe(e, 'domicilio', data, 'esposoDomicilio')
            actualizar_si_existe(e, 'ocupacion', data, 'esposoOcupacion')
            actualizar_si_existe(e, 'empresa', data, 'esposoEmpresa')
            actualizar_si_existe(e, 'direccion', data, 'esposoDireccion')
            actualizar_si_existe(e, 'email', data, 'esposoEmail')
            e.save()

        # Datos laborales
        if instance.datos_laborales:
            d = instance.datos_laborales
            actualizar_si_existe(d, 'empresa', data, 'empresa')
            actualizar_si_existe(d, 'direccion', data, 'direccionEmpresa')
            actualizar_si_existe(d, 'telefono1', data, 'telefonoEmpresa1')
            actualizar_si_existe(d, 'telefono2', data, 'telefonoEmpresa2')
            actualizar_si_existe(d, 'ocupacion', data, 'ocupacion')
            d.save()

        # Datos del seguro
        if instance.datos_seguro:
            s = instance.datos_seguro
            actualizar_si_existe(s, 'aseguradora', data, 'aseguradora')
            actualizar_si_existe(s, 'lista_precios', data, 'listaPrecios')
            actualizar_si_existe(s, 'carnet', data, 'carnet')
            actualizar_si_existe(s, 'certificado', data, 'certificado')
            actualizar_si_existe(s, 'nombre_titular', data, 'nombreTitular')
            actualizar_si_existe(s, 'coaseguro', data, 'coaseguro')
            actualizar_si_existe(s, 'valor_copago', data, 'valorCopago')
            actualizar_si_existe(s, 'valor_deducible', data, 'valorDeducible')
            actualizar_si_existe(s, 'numero_poliza', data, 'numero_poliza')

            s.save()

        # Garantía de pago
        if instance.garantia_pago:
            g = instance.garantia_pago
            actualizar_si_existe(g, 'tipo', data, 'tipoGarantia')
            actualizar_si_existe(g, 'numero_tc_cheque', data, 'numeroTcCheque')
            actualizar_si_existe(g, 'nit', data, 'nit')
            actualizar_si_existe(g, 'nombre_factura', data, 'nombreFactura')
            actualizar_si_existe(g, 'direccion_factura', data, 'direccionFactura')
            actualizar_si_existe(g, 'correo_factura', data, 'correoFactura')
            g.save()

        # Campos propios de admisión
        actualizar_si_existe(instance, 'area_admision', data, 'area_admision')
        actualizar_si_existe(instance, 'habitacion', data, 'habitacion')
        actualizar_si_existe(instance, 'medico_tratante', data, 'medicoTratante')
        instance.save()

        if nueva_habitacion and nueva_habitacion != habitacion_actual:
            if habitacion_actual:
                habitacion_actual.estado = 'Vacante Inspeccionada -DISPONIBLE-'
                habitacion_actual.admision = None
                habitacion_actual.paciente = None
                habitacion_actual.save(update_fields=['estado', 'admision', 'paciente'])

            nueva_habitacion.estado = 'Ocupada Inspeccionada'
            nueva_habitacion.admision = instance
            nueva_habitacion.paciente = nombre_paciente
            nueva_habitacion.save(update_fields=['estado', 'admision', 'paciente'])

            instance.habitacion_fk = nueva_habitacion
            instance.habitacion = str(nueva_habitacion.id)
            instance.save(update_fields=['habitacion_fk', 'habitacion'])
        elif habitacion_actual:
            habitacion_actual.paciente = nombre_paciente
            if habitacion_actual.estado != 'Ocupada Inspeccionada':
                habitacion_actual.estado = 'Ocupada Inspeccionada'
                habitacion_actual.save(update_fields=['paciente', 'estado'])
            else:
                habitacion_actual.save(update_fields=['paciente'])

        return instance

class MovimientoCuentaSerializer(serializers.ModelSerializer):
     class Meta:
        model = MovimientoCuenta
        fields = [
            'id',
            'fecha',
            'categoria',
            'descripcion',
            'facturar_a',
            'cantidad',
            'precio_unitario',
            'total',
            'precio_aseguradora',
            'total_aseguradora',
            'precio_paciente',
            'total_paciente',
            'observacion',
            'admision'
        ]

class EstadoCuentaSerializer(serializers.ModelSerializer):
    paciente = serializers.SerializerMethodField()
    movimientos = MovimientoCuentaSerializer(many=True, read_only=True)

    class Meta:
        model = Admision
        fields = [
            'id',
            'fecha',
            'area_admision',
            'habitacion',
            'medico_tratante',
            'paciente',
            'movimientos'
        ]

    def get_paciente(self, obj):
        paciente = obj.paciente
        return {
            'nombre': f"{paciente.primer_nombre} {paciente.primer_apellido}",
            'genero': paciente.genero,
            'edad': paciente.edad
        }
