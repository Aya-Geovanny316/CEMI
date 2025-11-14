import React, { createContext, useEffect, useState } from 'react';
import { getData, deleteData, putData, postData } from '../../../apiService';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { NotificationManager } from 'react-notifications';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const { register, handleSubmit, setValue, getValues, watch, formState: { errors } } = useForm();

    const [habitacionData, setHabitacionData] = useState([]);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoFormulario, setModoFormulario] = useState('ver');
    const [loading, setLoading] = useState(false);
    const [seccionActiva, setSeccionActiva] = useState('datos-seguro');
    const [todayDate, setTodayDate] = useState('');
    const [mostrarSelectArea, setMostrarSelectArea] = useState([]);
    const [page, setPage] = useState(1);
    const [nullNextPage, setNullNextPage] = useState(null);
    const [nullPrevPage, setPrevNextPage] = useState(null);

    const limpiarFormularioHabitacion = () => {
        setValue('idFicha', null);
        setValue('codigo', '');
        setValue('area', '');
        setValue('estado', '');
        setValue('admision', '');
        setValue('paciente', '');
        setValue('nivel', '');
        setValue('observacion', '');
        setValue('nuevo_estado', '');
    };


    const getHabitacion = async () => {
        Swal.fire({
            title: 'Cargando habitaciones...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const response = await getData(`habitaciones/habitaciones-listar/?page=${page}`);
            const resultados = response.data.results;

            setHabitacionData(resultados);
            setNullNextPage(response.data.next);
            setPrevNextPage(response.data.previous);

            Swal.close();

            if (resultados.length === 0) {
                Swal.fire({
                    icon: 'info',
                    title: 'Sin resultados',
                    text: 'No se encontraron habitaciones.',
                });
            }
        } catch (error) {
            Swal.close();

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al cargar habitaciones',
            });

            console.error('Error al cargar habitaciones:', error);
        }
    };

    const nextPage = () => setPage(prev => prev + 1);
    const prevPage = () => setPage(prev => prev - 1);

    const eliminarHabitacion = async (id) => {
        const confirmed = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción desactivará la habitación.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (confirmed.isConfirmed) {
            try {
                const response = await deleteData(`habitaciones/habitaciones-eliminar/${id}/`);
                console.log('Habitación desactivada:', response.status);
                NotificationManager.success("Habitación eliminada con éxito", "Éxito", 3000);
                getHabitacion(); // recarga listado
            } catch (error) {
                console.error('Error al eliminar habitación:', error);
                NotificationManager.error("Hubo un error al eliminar", "Error", 3000);
            }
        }
    };


    const actualizarHabitacion = async (id, data) => {
        try {
            const response = await putData(`habitaciones/habitaciones-actualizar/${id}/`, data);
            console.log('✅ Habitación actualizada:', response.data);
            getHabitacion();
        } catch (error) {
            console.error('❌ Error al actualizar habitación:', error.response?.data || error);
        }
    };

    const cargarHabitacion = async (id) => {
        try {
            const { data } = await getData(`habitaciones/${id}/`);
            console.log(data)
            setValue('idFicha', data.id);  // ID importante para editar
            setValue('codigo', data.codigo);
            setValue('area', data.area);
            setValue('estado', data.estado);
            setValue('admision', data.admision);
            setValue('paciente', data.paciente);
            setValue('nivel', data.nivel);
            setValue('observacion', data.observacion || '');
        } catch (error) {
            console.error('Error al cargar habitación:', error);
        }
    };

    const onSubmit = async (data) => {
        try {
            if (modoFormulario === 'editar') {
                await actualizarHabitacion(data.idFicha, {
                    codigo: data.codigo,
                    area: data.area,
                    nivel: data.nivel,
                    estado: data.nuevo_estado,
                    admision: data.admision || null,
                    paciente: data.paciente || '',
                    observacion: data.observacion || ''
                });
                NotificationManager.success("Habitación actualizada con éxito", "Éxito", 3000);

            } else if (modoFormulario === 'crear') {
                await postData('habitaciones/habitaciones-crear/', {
                    codigo: data.codigo,
                    area: data.area,
                    estado: data.nuevo_estado,
                    admision: data.admision || null,
                    paciente: data.paciente || '',
                    nivel: data.nivel,
                    observacion: data.observacion || ''
                });
                NotificationManager.success("Habitación creada con éxito", "Éxito", 3000);
            }

            setMostrarModal(false);
            getHabitacion();
        } catch (error) {
            console.error('Error al guardar habitación:', error.response?.data || error);
            NotificationManager.error("Hubo un error al guardar", "Error", 3000);
        }
    };

    useEffect(() => {
        getHabitacion();
        const rolesGuardados = JSON.parse(localStorage.getItem('rolesUsuario') || '[]');
        setMostrarSelectArea(rolesGuardados);
    }, [page]);

    const values = {
        habitacionData,
        cargarHabitacion,
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
        errors,
        nextPage,
        nullNextPage,
        nullPrevPage,
        prevPage,
        mostrarSelectArea,
        eliminarHabitacion,
        actualizarHabitacion,
        limpiarFormularioHabitacion
    };

    return (
        <AppContext.Provider value={values}>
            {children}
        </AppContext.Provider>
    );
};
