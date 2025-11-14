import React, { createContext, useEffect, useState } from 'react';
import { postData, getData } from '../../../apiService';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [state, setState] = useState(null);
    const [loading, setLoading] = useState(false);
    const [listarHabitaciones, setListarHabitaciones] = useState([]);
    const [seguros, setSeguros] = useState([]);
    const [areaHabitacion, setAreaHabitacion] = useState([]);
    const [areaSeleccionada, setAreaSeleccionada] = useState('');
    const [doctor, setDoctor] = useState([]);

    const { register, handleSubmit, watch, setValue, getValues, reset } = useForm();

    const getDoctores = async () => {
        setLoading(true);
        try {
            const response = await getData('user/doctor-users/?page_size=50');
            console.log('DOCTORES: ', response.data.results);
            setDoctor(response.data.results);
        } catch (error) {
            console.error('Fallo al obtener doctores:', error);
        } finally {
            setLoading(false);
        }
    };

    const getHabitaciones = async () => {
        setLoading(true);
        try {
            const response = await getData('habitaciones/habitaciones-listar/?page_size=1000&solo_disponibles=1');
            const areasUnicas = [
                ...new Set(response.data.results.map(habitacion => habitacion.area))
            ];
            setAreaHabitacion(areasUnicas.map(area => ({ area })));
            setListarHabitaciones(response.data.results);
            console.log('HABITACIONES: ', response.data.results);
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
            console.log('SEGUROS: ', response.data);
            setSeguros(response.data.results);
        } catch (error) {
            console.error('Fallo al obtener seguros:', error);
        } finally {
            setLoading(false);
        }
    };

    const guardarAdmision = async (formulario) => {
        setLoading(true);
        try {
            const datosLimpios = limpiarDatosVacios(formulario);
            console.log(datosLimpios);
            const response = await postData('admisiones/', datosLimpios);
            console.log('Admisión guardada con éxito:', response.data);

            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Admisión guardada con éxito',
                confirmButtonColor: '#007b8f'
            });

            return response.data;
        } catch (error) {
            console.error('Error al guardar admisión:', error);

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo guardar la admisión',
                confirmButtonColor: '#d33'
            });

            throw error;
        } finally {
            setLoading(false);
            reset(); // Limpiar el formulario después de guardar
        }
    };

    const limpiarDatosVacios = (obj) => {
        if (Array.isArray(obj)) {
            return obj
                .map(limpiarDatosVacios)
                .filter((item) => item !== null && item !== undefined);
        }

        if (typeof obj === 'object' && obj !== null) {
            const limpio = {};
            for (const clave in obj) {
                const valor = limpiarDatosVacios(obj[clave]);

                if (
                    valor === null ||
                    valor === undefined ||
                    (typeof valor === 'string' && valor.trim() === '') ||
                    (typeof valor === 'string' && ['null', 'undefined', 'invalid date', '0000'].includes(valor.toLowerCase())) ||
                    (typeof valor === 'number' && isNaN(valor)) ||
                    (Array.isArray(valor) && valor.length === 0) ||
                    (typeof valor === 'object' && Object.keys(valor).length === 0)
                ) {
                    continue;
                }

                limpio[clave] = valor;
            }
            return Object.keys(limpio).length > 0 ? limpio : undefined;
        }

        return obj;
    };

    useEffect(() => {
        getHabitaciones();
        getSeguros();
        getDoctores();
    }, []);

    const values = {
        state,
        listarHabitaciones,
        setState,
        guardarAdmision,
        loading,
        seguros,
        areaHabitacion,
        areaSeleccionada,
        setAreaSeleccionada,
        doctor,
        setDoctor,
        register,
        handleSubmit,
        watch,
        setValue,
        getValues,
        reset
    };

    return (
        <AppContext.Provider value={values}>
            {children}
        </AppContext.Provider>
    );
};
