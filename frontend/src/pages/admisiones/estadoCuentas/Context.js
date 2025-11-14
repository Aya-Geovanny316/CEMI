import React, { createContext, useEffect, useState } from 'react';
import { getData, putData, API_URL } from '../../../apiService';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const { register, handleSubmit, setValue, getValues, watch } = useForm();

    const [admisionesData, setAdmisionesData] = useState([]);
    const [admisionesMovimientos, setAdmisionesMovimientos] = useState([])
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoFormulario, setModoFormulario] = useState('ver');
    const [loading, setLoading] = useState(false);
    const [seccionActiva, setSeccionActiva] = useState('datos-seguro');
    const [todayDate, setTodayDate] = useState('');
    const [idAdmision, setIdAdmision] = useState(0)


    const getAdmisionesResumen = async (pagina = 1) => {
        Swal.fire({
            title: 'Cargando admisiones...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const response = await getData(`admisiones/admisiones-resumen/?page=${pagina}`);
            const resultados = response.data.results;

            setAdmisionesData(resultados);

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

    const getMovimientos = async (id) => {
        try {
            const response = await getData(`admisiones/estado-cuenta/${id}/`)
            console.log(response.data.movimientos)
            setAdmisionesMovimientos(response.data.movimientos)
        } catch (error) {
            console.error('Error al cargar movimientos:', error);
        }
    }

    const descargarPDF = async () => {
        console.log(idAdmision)
        try {
            const response = await fetch(`${API_URL}admisiones/estado-cuenta-imprimir/${idAdmision}/`, {
                method: 'GET',
            });
            console.log(response)
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `estado_cuenta_${idAdmision}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error('Error al descargar PDF:', error);
        }
    };

    const onSubmit = async (data) => {
        console.log("DATOS", data)
        try {
            const { status, data: response } = await putData(`admisiones/editar/${data.idFicha}/`, data);

            if (status === 200) {
                console.log('Actualizado correctamente:', response);
                setMostrarModal(!mostrarModal)
                // cerrar modal, recargar tabla, etc.
            } else {
                console.error('Error al actualizar:', response);
            }
        } catch (error) {
            console.error('Error de red o servidor:', error);
        }
        getAdmisionesResumen()
    };

    const totalPublico = (precio, cantidad) => {
        return precio * cantidad
    }

    useEffect(() => {
        getAdmisionesResumen();
    }, []);

    const values = {
        admisionesData,
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
        getMovimientos,
        admisionesMovimientos,
        totalPublico,
        idAdmision,
        setIdAdmision,
        descargarPDF,
    }

    return (
        <AppContext.Provider value={values} >
            {children}
        </AppContext.Provider>
    );
};