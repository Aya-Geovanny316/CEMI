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
    const [areaHabitacion, setAreaHabitacion] = useState([]);
    const [areaSeleccionada, setAreaSeleccionada] = useState('');
    const [doctor, setDoctor] = useState([]);
    const [listarHabitaciones, setListarHabitaciones] = useState([]);
    const [seguros, setSeguros] = useState([]);

    const calcularEdad = (fecha) => {
        if (!fecha) {
            return '';
        }

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
            setDoctor(response.data.results || []);
        } catch (error) {
            console.error('Fallo al obtener doctores:', error);
        } finally {
            setLoading(false);
        }
    };

    const getHabitaciones = async () => {
        setLoading(true);
        try {
            const response = await getData('habitaciones/habitaciones-listar/?page_size=50&solo_disponibles=1');
            const habitaciones = response.data.results || [];
            const areasUnicas = [...new Set(habitaciones.map((habitacion) => habitacion.area))];
            setAreaHabitacion(areasUnicas.map((area) => ({ area })));
            setListarHabitaciones(habitaciones);
        } catch (error) {
            console.error('Fallo al obtener habitaciones:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSeguros = async () => {
        setLoading(true);
        try {
            const response = await getData('inventario/seguros/?page_size=50');
            setSeguros(response.data.results || []);
        } catch (error) {
            console.error('Fallo al obtener seguros:', error);
        } finally {
            setLoading(false);
        }
    };

    const getAdmisionesResumen = async () => {
        Swal.fire({
            title: 'Cargando resumen de admisiones...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const response = await getData('admisiones/admisiones-resumen-estado/');
            const data = response.data || [];
            setAdmisionesData(Array.isArray(data) ? data : []);
            Swal.close();

            if ((Array.isArray(data) && data.length === 0) || (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0)) {
                Swal.fire({
                    icon: 'info',
                    title: 'Sin resultados',
                    text: 'No se encontraron datos de admisiones.'
                });
            }
        } catch (error) {
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al cargar el resumen de admisiones'
            });
            console.error('Error al cargar admisiones:', error);
        }
    };

    const cargarAdmision = async (id) => {
        try {
            const { data } = await getData(`admisiones/${id}/`);

            const acompanantesTransformados = (data.acompanantes || []).map((a) => ({
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
                numero_poliza: data.datos_seguro?.numero_poliza,

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
                esposo_edad: data.esposo?.edad,
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

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                tipo_sangre: data.tipoSangre || null,
            };

            delete payload.tipoSangre;

            const { status, data: response } = await putData(`admisiones/editar/${data.idFicha}/`, payload);

            if (status === 200) {
                setMostrarModal(false);
            } else {
                console.error('Error al actualizar:', response);
            }
        } catch (error) {
            console.error('Error de red o servidor:', error);
        }

        getAdmisionesResumen();
    };

    useEffect(() => {
        const subscription = watch((value, { name }) => {
            const regex = /^acompanantes\.(\d+)\.fechaNacimiento$/;
            const match = name && name.match(regex);
            if (match) {
                const index = match[1];
                const fecha = value?.acompanantes?.[index]?.fechaNacimiento;
                if (fecha) {
                    const edad = calcularEdad(fecha);
                    setValue(`acompanantes.${index}.edad`, edad);
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [watch, setValue]);

    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === 'fechaNacimiento' && value.fechaNacimiento) {
                const edad = calcularEdad(value.fechaNacimiento);
                setValue('edadPaciente', edad);
            }
        });

        return () => subscription.unsubscribe();
    }, [watch, setValue]);

    useEffect(() => {
        getHabitaciones();
        getSeguros();
        getDoctores();
        getAdmisionesResumen();
    }, []);

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
        areaSeleccionada,
        setAreaSeleccionada,
        listarHabitaciones,
        setListarHabitaciones,
        seguros,
        areaHabitacion,
        doctor,
    };

    return (
        <AppContext.Provider value={values}>
            {children}
        </AppContext.Provider>
    );
};
