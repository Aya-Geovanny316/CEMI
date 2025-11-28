import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';

import { deleteData, getBinary, getData, postData } from '../../apiService';

export const ConsultaContext = createContext();

export const ConsultaProvider = ({ children }) => {
  const {
    register,
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: {
      fecha: '',
      edad: '',
      mc: '',
      hea: '',
      sv_pa: '',
      sv_fc: '',
      sv_fr: '',
      sv_sat: '',
      sv_peso: '',
      examen_fisico: '',
      estudios: '',
      impresion_clinica: '',
      tratamiento: '',
      plan: '',
      medico: '',
      monto: '',
      metodoPago: '',
    },
  });

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [showHistorial, setShowHistorial] = useState(false);
  const [departamentos, setDepartamentos] = useState([]);
  const [selectedDepartamento, setSelectedDepartamento] = useState('');

  const loadPatients = useCallback(async () => {
    setLoadingPatients(true);
    try {
      const { data } = await getData('consulta/pacientes/');
      setPatients(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo cargar pacientes',
        text: 'Intenta nuevamente o revisa tu conexion.',
      });
      console.error('Error cargando pacientes', error);
    } finally {
      setLoadingPatients(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const loadDepartamentos = useCallback(async () => {
    try {
      const { data } = await getData('mantenimiento/departamentos/');
      const list = Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : []);
      setDepartamentos(list);
    } catch (error) {
      console.error('Error cargando departamentos', error);
    }
  }, []);

  useEffect(() => {
    loadDepartamentos();
  }, [loadDepartamentos]);

  const filteredPatients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return patients;

    return patients.filter((patient) => {
      const fullName = (patient.nombre_completo || '').toLowerCase();
      const idNumber = (patient.numero_identificacion || '').toLowerCase();
      const phone = (patient.telefono || patient.telefono1 || '').toLowerCase();
      return (
        fullName.includes(term) ||
        idNumber.includes(term) ||
        phone.includes(term)
      );
    });
  }, [patients, search]);

  const patientsLimited = useMemo(
    () => filteredPatients.slice(0, 25),
    [filteredPatients],
  );

  const selectPatient = (patient) => {
    setSelectedPatient(patient);
    setSelectedDepartamento('');
  };

  const cargarHistorial = async (patient) => {
    if (!patient?.id) {
      return;
    }
    setLoadingHistorial(true);
    setShowHistorial(true);
    setHistorial([]);
    try {
      const { data } = await getData(
        `consulta/consultas/?paciente_id=${patient.id}`,
        { __skipLoader: true }
      );
      const registros = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : [];
      setHistorial(registros);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo cargar el historial',
        text: 'Intenta nuevamente.',
      });
      console.error('Error cargando historial', error);
    } finally {
      setLoadingHistorial(false);
    }
  };

  const descargarRecibo = async (consultaId) => {
    try {
      const response = await getBinary(`consulta/${consultaId}/recibo/`, {
        __skipLoader: true,
      });
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: 'application/pdf' })
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = `consulta_${consultaId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      Swal.fire({
        icon: 'warning',
        title: 'Recibo no disponible',
        text: 'La consulta se guardo pero el recibo no pudo descargarse.',
      });
      console.error('Error descargando recibo', error);
    }
  };

  const onSubmit = async (values) => {
    if (!selectedPatient) {
      Swal.fire({
        icon: 'info',
        title: 'Selecciona un paciente',
        text: 'Debes elegir un paciente para registrar la consulta.',
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        paciente_id: selectedPatient.id,
        departamento_id: selectedDepartamento || null,
        fecha: values.fecha,
        nombre_paciente: selectedPatient?.nombre_completo || '',
        edad: values.edad ? Number(values.edad) : null,
        mc: values.mc,
        hea: values.hea,
        sv_pa: values.sv_pa,
        sv_fc: values.sv_fc,
        sv_fr: values.sv_fr,
        sv_sat: values.sv_sat,
        sv_peso: values.sv_peso,
        examen_fisico: values.examen_fisico,
        estudios: values.estudios,
        impresion_clinica: (values.impresion_clinica || '').split('\n').filter((i) => i.trim()),
        tratamiento: (values.tratamiento || '').split('\n').filter((i) => i.trim()),
        plan: (values.plan || '').split('\n').filter((i) => i.trim()),
        medico: values.medico || null,
        monto: values.monto ? Number(values.monto) : 0,
        metodo_pago: values.metodoPago || null,
      };

      const { data } = await postData('consulta/', payload);
      const consultaId = data?.consulta?.id || data?.id;

      Swal.fire({
        icon: 'success',
        title: 'Consulta guardada',
        text: 'Se genero el recibo en PDF para imprimir.',
        timer: 2000,
        showConfirmButton: false,
      });

      reset();
      setSelectedPatient(null);
      setSelectedDepartamento('');
      if (consultaId) {
        await descargarRecibo(consultaId);
      }
    } catch (error) {
      const detail = error?.response?.data;
      const message = typeof detail === 'string'
        ? detail
        : 'No se pudo guardar la consulta. Revisa los datos ingresados.';
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: message,
      });
      console.error('Error guardando consulta', error);
    } finally {
      setSaving(false);
    }
  };


  const descargarReciboHistorial = async (id) => {
    if (!id) return;
    await descargarRecibo(id);
  };

  const eliminarConsulta = async (id) => {
    if (!id) return;
    const confirm = await Swal.fire({
      icon: 'question',
      title: '¿Eliminar consulta?',
      text: 'Esta acción no se puede deshacer',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!confirm.isConfirmed) return;

    try {
      await deleteData(`consulta/${id}/`);
      setHistorial((prev) => prev.filter((c) => c.id !== id));
      Swal.fire({
        icon: 'success',
        title: 'Consulta eliminada',
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo eliminar',
        text: 'Intenta nuevamente.',
      });
      console.error('Error eliminando consulta', error);
    }
  };
  const value = {
    register,
    handleSubmit,
    reset,
    onSubmit,
    patients: filteredPatients,
    patientsLimited,
    refreshPatients: loadPatients,
    loadingPatients,
    saving,
    search,
    setSearch,
    selectedPatient,
    selectPatient,
    historial,
    loadingHistorial,
    showHistorial,
    setShowHistorial,
    cargarHistorial,
    descargarReciboHistorial,
    eliminarConsulta,
    departamentos,
    selectedDepartamento,
    setSelectedDepartamento,
  };

  return (
    <ConsultaContext.Provider value={value}>
      {children}
    </ConsultaContext.Provider>
  );
};
