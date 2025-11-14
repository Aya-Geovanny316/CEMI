import React, { createContext, useEffect, useState } from 'react';
import { getData, putData } from '../../../apiService';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const { register, handleSubmit, setValue, getValues, watch, reset } = useForm();

    const [admisionesData, setAdmisionesData] = useState([]);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoFormulario, setModoFormulario] = useState('ver');
    const [loading, setLoading] = useState(false);
    const [seccionActiva, setSeccionActiva] = useState('datos-seguro');
    const [todayDate, setTodayDate] = useState('');
    const [seguros, setSeguros] = useState([])
    const [areaHabitacion, setAreaHabitacion] = useState([]);
    const [areaSeleccionada, setAreaSeleccionada] = useState('');
    const [doctor, setDoctor] = useState([]);
    const [listarHabitaciones, setListarHabitaciones] = useState([])
    //paginacion
    const [page, setPage] = useState(1);
    const [nullNextPage, setNullNextPage] = useState(null)
    const [nullPrevPage, setPrevNextPage] = useState(null)

    const calcularEdad = (fecha) => {
        const nacimiento = new Date(fecha);
        const hoy = new Date();

        const diffTiempo = hoy.getTime() - nacimiento.getTime();
        const diffDias = Math.floor(diffTiempo / (1000 * 60 * 60 * 24));

        if (diffDias < 30) {
            return `${diffDias} día(s)`;
        }

        const diffMeses = (hoy.getFullYear() - nacimiento.getFullYear()) * 12 + hoy.getMonth() - nacimiento.getMonth();
        if (diffMeses < 12) {
            return `${diffMeses} mes(es)`;
        }

        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        const dia = hoy.getDate() - nacimiento.getDate();

        if (mes < 0 || (mes === 0 && dia < 0)) {
            edad--;
        }

        return `${edad} año(s)`;
    };

    const getDoctores = async () => {
        setLoading(true);
        try {
            const response = await getData('user/doctor-users/?page_size=50');
            console.log('DOCTORES: ', response.data.results);
            setDoctor(response.data.results);
        } catch (error) {
            console.error('Fallo al obtener doctores:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    const getHabitaciones = async () => {
        setLoading(true);
        try {
            const response = await getData('habitaciones/habitaciones-listar/?page_size=50');
            const areasUnicas = [
                ...new Set(response.data.results.map(habitacion => habitacion.area))
            ];
            setAreaHabitacion(areasUnicas.map(area => ({ area })));
            setListarHabitaciones(response.data.results);
            console.log('HABITACIONES: ', response.data.results);
        } catch (error) {
            console.error('Fallo al obtener habitaciones:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    const getSeguros = async () => {
        setLoading(true);
        try {
            const response = await getData('inventario/seguros/?page_size=50');
            console.log('SEGUROS: ', response.data);
            setSeguros(response.data.results)
        } catch (error) {
            console.error('Fallo al obtener seguros:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    const getAdmisionesResumen = async () => {
        Swal.fire({
            title: 'Cargando admisiones...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const response = await getData(`admisiones/admisiones-resumen/?page=${page}&page_size=25`);
            const resultados = response.data.results;
            console.log('ADMISIÓN RESUMEN: ', resultados);
            setAdmisionesData(resultados);
            setNullNextPage(response.data.next);
            setPrevNextPage(response.data.previous);

            Swal.close();

            if (resultados.length === 0) {
                Swal.fire({
                    icon: 'info',
                    title: 'Sin resultados',
                    text: 'No se encontraron admisiones.',
                });
            }
        } catch (error) {
            Swal.close();

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al cargar admisiones',
            });

            console.error('Error al cargar admisiones:', error);
        }
    };

    const acompananteTieneDatos = (acompanante = {}) => {
        return Object.values(acompanante).some((valor) => {
            if (typeof valor === 'boolean') {
                return valor === true;
            }
            if (valor == null) {
                return false;
            }
            if (typeof valor === 'number') {
                return !Number.isNaN(valor);
            }
            if (typeof valor === 'string') {
                return valor.trim() !== '';
            }
            if (Array.isArray(valor)) {
                return valor.length > 0;
            }
            if (typeof valor === 'object') {
                return Object.keys(valor).length > 0;
            }
            return false;
        });
    };

    const transformarCampos = (formData) => {
        const valueFrom = (...keys) => {
            for (const key of keys) {
                if (formData[key] !== undefined) {
                    return formData[key];
                }
            }
            return undefined;
        };

        const payload = {
            ...formData,
            p_primer_nombre: valueFrom('p_primer_nombre', 'primerNombre'),
            p_segundo_nombre: valueFrom('p_segundo_nombre', 'segundoNombre'),
            p_primer_apellido: valueFrom('p_primer_apellido', 'primerApellido'),
            p_segundo_apellido: valueFrom('p_segundo_apellido', 'segundoApellido'),
            p_apellido_casada: valueFrom('p_apellido_casada', 'apellidoCasada'),
            p_genero: valueFrom('p_genero', 'genero'),
            p_estado_civil: valueFrom('p_estado_civil', 'estadoCivil'),
            p_fecha_nacimiento: valueFrom('p_fecha_nacimiento', 'fechaNacimiento'),
            p_tipo_identificacion: valueFrom('p_tipo_identificacion', 'tipoIdentificacion'),
            p_numero_identificacion: valueFrom('p_numero_identificacion', 'numeroIdentificacion'),
            p_telefono: valueFrom('p_telefono', 'telefono1'),
            edad: valueFrom('edad', 'edadPaciente'),
            direccion: valueFrom('direccion'),
            telefono1: valueFrom('telefono1'),
            telefono2: valueFrom('telefono2'),
            correo: valueFrom('correo'),
            observacion: valueFrom('observacion'),
            religion: valueFrom('religion'),
            nit: valueFrom('nit'),
            tipo_sangre: valueFrom('tipo_sangre', 'tipoSangre') ?? null,

            responsablePrimerNombre: valueFrom('responsablePrimerNombre', 'resp_primerNombre'),
            responsableSegundoNombre: valueFrom('responsableSegundoNombre', 'resp_segundoNombre'),
            responsablePrimerApellido: valueFrom('responsablePrimerApellido', 'resp_primerApellido'),
            responsableSegundoApellido: valueFrom('responsableSegundoApellido', 'resp_segundoApellido'),
            responsableTipoIdentificacion: valueFrom('responsableTipoIdentificacion', 'resp_tipoIdentificacion'),
            responsableNumeroIdentificacion: valueFrom('responsableNumeroIdentificacion', 'resp_numeroIdentificacion'),
            responsableFechaNacimiento: valueFrom('responsableFechaNacimiento', 'resp_fechaNacimiento'),
            responsableEdad: valueFrom('responsableEdad', 'resp_edad'),
            responsableGenero: valueFrom('responsableGenero', 'resp_genero'),
            responsableRelacionPaciente: valueFrom('responsableRelacionPaciente', 'resp_relacion'),
            responsableOcupacion: valueFrom('responsableOcupacion', 'resp_ocupacion'),
            responsableDomicilio: valueFrom('responsableDomicilio', 'resp_domicilio'),
            responsableEmpresa: valueFrom('responsableEmpresa', 'resp_empresa'),
            responsableDireccion: valueFrom('responsableDireccion', 'resp_direccion'),
            responsableTelefono1: valueFrom('responsableTelefono1', 'resp_telefono1'),
            responsableTelefono2: valueFrom('responsableTelefono2', 'resp_telefono2'),
            responsableContacto: valueFrom('responsableContacto', 'resp_contacto'),
            responsableEmail: valueFrom('responsableEmail', 'resp_email'),

            esposoNombre: valueFrom('esposoNombre', 'esposo_nombre'),
            esposoGenero: valueFrom('esposoGenero', 'esposo_genero'),
            esposoTipoIdentificacion: valueFrom('esposoTipoIdentificacion', 'esposo_tipoIdentificacion'),
            esposoNumeroIdentificacion: valueFrom('esposoNumeroIdentificacion', 'esposo_numeroIdentificacion'),
            esposoFechaNacimiento: valueFrom('esposoFechaNacimiento', 'esposo_fechaNacimiento'),
            esposoEdad: valueFrom('esposoEdad', 'esposo_edad'),
            esposoTelefono1: valueFrom('esposoTelefono1', 'esposo_telefono1'),
            esposoTelefono2: valueFrom('esposoTelefono2', 'esposo_telefono2'),
            esposoDomicilio: valueFrom('esposoDomicilio', 'esposo_domicilio'),
            esposoOcupacion: valueFrom('esposoOcupacion', 'esposo_ocupacion'),
            esposoEmpresa: valueFrom('esposoEmpresa', 'esposo_empresa'),
            esposoDireccion: valueFrom('esposoDireccion', 'esposo_direccion'),
            esposoEmail: valueFrom('esposoEmail', 'esposo_email'),

            empresa: valueFrom('empresa'),
            direccionEmpresa: valueFrom('direccionEmpresa'),
            telefonoEmpresa1: valueFrom('telefonoEmpresa1'),
            telefonoEmpresa2: valueFrom('telefonoEmpresa2'),
            ocupacion: valueFrom('ocupacion'),

            aseguradora: valueFrom('aseguradora'),
            listaPrecios: valueFrom('listaPrecios'),
            carnet: valueFrom('carnet'),
            certificado: valueFrom('certificado'),
            nombreTitular: valueFrom('nombreTitular'),
            coaseguro: valueFrom('coaseguro'),
            valorCopago: valueFrom('valorCopago'),
            valorDeducible: valueFrom('valorDeducible'),
            numero_poliza: valueFrom('numero_poliza'),

            tipoGarantia: valueFrom('tipoGarantia', 'garantiaPago'),
            numeroTcCheque: valueFrom('numeroTcCheque', 'tcCheque'),
            nombreFactura: valueFrom('nombreFactura'),
            direccionFactura: valueFrom('direccionFactura'),
            correoFactura: valueFrom('correoFactura'),
        };

        const acompanantes = Array.isArray(valueFrom('acompanantes'))
            ? valueFrom('acompanantes').filter(acompananteTieneDatos)
            : [];

        payload.acompanantes = acompanantes;

        delete payload.idFicha;
        delete payload.primerNombre;
        delete payload.segundoNombre;
        delete payload.primerApellido;
        delete payload.segundoApellido;
        delete payload.apellidoCasada;
        delete payload.genero;
        delete payload.estadoCivil;
        delete payload.fechaNacimiento;
        delete payload.tipoIdentificacion;
        delete payload.numeroIdentificacion;
        delete payload.tipoSangre;

        delete payload.resp_primerNombre;
        delete payload.resp_segundoNombre;
        delete payload.resp_primerApellido;
        delete payload.resp_segundoApellido;
        delete payload.resp_tipoIdentificacion;
        delete payload.resp_numeroIdentificacion;
        delete payload.resp_fechaNacimiento;
        delete payload.resp_edad;
        delete payload.resp_genero;
        delete payload.resp_relacion;
        delete payload.resp_ocupacion;
        delete payload.resp_domicilio;
        delete payload.resp_empresa;
        delete payload.resp_direccion;
        delete payload.resp_telefono1;
        delete payload.resp_telefono2;
        delete payload.resp_contacto;
        delete payload.resp_email;

        delete payload.esposo_nombre;
        delete payload.esposo_genero;
        delete payload.esposo_tipoIdentificacion;
        delete payload.esposo_numeroIdentificacion;
        delete payload.esposo_fechaNacimiento;
        delete payload.esposo_edad;
        delete payload.esposo_telefono1;
        delete payload.esposo_telefono2;
        delete payload.esposo_domicilio;
        delete payload.esposo_ocupacion;
        delete payload.esposo_empresa;
        delete payload.esposo_direccion;
        delete payload.esposo_email;
        delete payload.garantiaPago;
        delete payload.tcCheque;

        return payload;
    };

    const nextPage = () => {
        setPage(prev => prev + 1);
    }

    const prevPage = () => {
        setPage(prev => prev - 1);
    }

    const cargarAdmision = async (id) => {
        try {
            const { data } = await getData(`admisiones/${id}/`);
            console.log("DATOS CRUDOS", data);

            setTodayDate(data.fecha);

            const acompanantesTransformados = (data.acompanantes || []).map(a => ({
                nombre: a.nombre,
                tipoIdentificacion: a.tipo_identificacion,
                numeroIdentificacion: a.numero_identificacion,
                fechaNacimiento: a.fecha_nacimiento,
                edad: calcularEdad(a.fecha_nacimiento),
                genero: a.genero,
                correo: a.correo,
                nit: a.nit,
                tipo: a.tipo,
                responsableCuenta: a.responsable_cuenta,
                direccionLaboral: a.direccion_laboral,
                telefonoEmpresa: a.telefono_empresa,
                contacto: a.contacto,
                correoContacto: a.correo_contacto,
                telefonoContacto: a.telefono_contacto,
            }));

            reset({
                idFicha: data.id,
                primerNombre: data.paciente.primer_nombre,
                segundoNombre: data.paciente.segundo_nombre,
                primerApellido: data.paciente.primer_apellido,
                segundoApellido: data.paciente.segundo_apellido,
                apellidoCasada: data.paciente.apellido_casada,
                genero: data.paciente.genero,
                estadoCivil: data.paciente.estado_civil,
                tipoSangre: data.paciente.tipo_sangre || '',
                fechaNacimiento: data.paciente.fecha_nacimiento,
                edadPaciente: calcularEdad(data.paciente.fecha_nacimiento),
                tipoIdentificacion: data.paciente.tipo_identificacion,
                numeroIdentificacion: data.paciente.numero_identificacion,
                direccion: data.paciente.direccion,
                telefono1: data.paciente.telefono1,
                telefono2: data.paciente.telefono2,
                correo: data.paciente.correo,
                nit: data.paciente.nit,
                observacion: data.paciente.observacion,
                religion: data.paciente.religion,
                responsableCuenta: false,

                empresa: data.datos_laborales?.empresa,
                direccionEmpresa: data.datos_laborales?.direccion,
                telefonoEmpresa1: data.datos_laborales?.telefono1,
                telefonoEmpresa2: data.datos_laborales?.telefono2,
                ocupacion: data.datos_laborales?.ocupacion,

                area_admision: data.area_admision || '',
                habitacion: data.habitacion_fk?.id || '',
                medicoTratante: data.medico_tratante || '',

                aseguradora: data.datos_seguro?.aseguradora,
                listaPrecios: data.datos_seguro?.lista_precios,
                carnet: data.datos_seguro?.carnet,
                certificado: data.datos_seguro?.certificado,
                nombreTitular: data.datos_seguro?.nombre_titular,
                coaseguro: data.datos_seguro?.coaseguro,
                valorCopago: data.datos_seguro?.valor_copago,
                valorDeducible: data.datos_seguro?.valor_deducible,
                numero_poliza: data.datos_seguro?.numero_poliza, // ✅ agregado aquí

                garantiaPago: data.garantia_pago?.tipo,
                tcCheque: data.garantia_pago?.numero_tc_cheque,
                nombreFactura: data.garantia_pago?.nombre_factura,
                direccionFactura: data.garantia_pago?.direccion_factura,
                correoFactura: data.garantia_pago?.correo_factura,

                resp_primerNombre: data.responsable?.primer_nombre,
                resp_segundoNombre: data.responsable?.segundo_nombre,
                resp_primerApellido: data.responsable?.primer_apellido,
                resp_segundoApellido: data.responsable?.segundo_apellido,
                resp_tipoIdentificacion: data.responsable?.tipo_identificacion,
                resp_numeroIdentificacion: data.responsable?.numero_identificacion,
                resp_fechaNacimiento: data.responsable?.fecha_nacimiento,
                resp_genero: data.responsable?.genero,
                resp_relacionPaciente: data.responsable?.relacion_paciente,
                resp_ocupacion: data.responsable?.ocupacion,
                resp_domicilio: data.responsable?.domicilio,
                resp_empresa: data.responsable?.empresa,
                resp_direccion: data.responsable?.direccion,
                resp_telefono1: data.responsable?.telefono1,
                resp_telefono2: data.responsable?.telefono2,
                resp_contacto: data.responsable?.contacto,
                resp_email: data.responsable?.email,

                esposo_nombre: data.esposo?.nombre,
                esposo_genero: data.esposo?.genero,
                esposo_tipoIdentificacion: data.esposo?.tipo_identificacion,
                esposo_numeroIdentificacion: data.esposo?.numero_identificacion,
                esposo_fechaNacimiento: data.esposo?.fecha_nacimiento,
                esposo_telefono1: data.esposo?.telefono1,
                esposo_telefono2: data.esposo?.telefono2,
                esposo_domicilio: data.esposo?.domicilio,
                esposo_ocupacion: data.esposo?.ocupacion,
                esposo_empresa: data.esposo?.empresa,
                esposo_direccion: data.esposo?.direccion,
                esposo_email: data.esposo?.email,

                acompanantes: acompanantesTransformados,
            });
            setAreaSeleccionada(data.habitacion_fk?.area || data.area_admision || '');
        } catch (error) {
            console.error('Error al cargar admisión:', error);
        }
    };

    const onSubmit = async (formData) => {
        setLoading(true);
        try {
            const payload = transformarCampos(formData);
            const { status } = await putData(`admisiones/editar/${formData.idFicha}/`, payload);

            if (status === 200) {
                setMostrarModal(false);
                await getAdmisionesResumen();
                Swal.fire({
                    icon: 'success',
                    title: 'Admisión actualizada',
                    text: 'Los cambios se guardaron correctamente.',
                    timer: 2500,
                    showConfirmButton: false,
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar',
                    text: 'No se pudieron guardar los cambios.',
                });
            }
        } catch (error) {
            console.error('Error de red o servidor:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error de red',
                text: 'Ocurrió un problema al actualizar la admisión.',
            });
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        getHabitaciones()
        getSeguros()
        getDoctores()
        getAdmisionesResumen();
    }, [page]);

    const values = {
        admisionesData,
        cargarAdmision,
        mostrarModal,
        setMostrarModal,
        modoFormulario,
        setModoFormulario,
        loading,
        setLoading,
        seccionActiva,
        setSeccionActiva,
        register,
        handleSubmit,
        setValue,
        getValues,
        watch,
        onSubmit,
        nullNextPage,
        nullPrevPage,
        nextPage,
        prevPage,
        areaSeleccionada,
        setAreaSeleccionada,
        listarHabitaciones,
        setListarHabitaciones,
        seguros,
        areaHabitacion,
        doctor,
    }

    return (
        <AppContext.Provider value={values} >
            {children}
        </AppContext.Provider>
    );
};
