import React, { createContext, useState, useContext, useEffect } from 'react';
import { getData, postData, putData, deleteData } from '../../../apiService';
import { NotificationManager } from "react-notifications";
import Swal from 'sweetalert2';

const MyContext = createContext();

export const ContextProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [show, setShow] = useState(false);
  const [modoFormulario, setModoFormulario] = useState('crear'); // 'crear', 'editar' o 'ver'
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [role, setRole] = useState(null);

  // subcategorías se manejarán como objetos: { id?: number, nombre: string, _delete?: boolean, _dirty?: boolean }
  const [subcategorias, setSubcategorias] = useState([]);

  // paginación
  const [page, setPage] = useState(1);
  const [nullNextPage, setNullNextPage] = useState(null);
  const [nullPrevPage, setPrevNextPage] = useState(null);

  const nextPage = () => setPage(prev => prev + 1);
  const prevPage = () => setPage(prev => prev - 1);

  const cargarDatos = async () => {
    Swal.fire({
      title: 'Cargando...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const response = await getData(`inventario/categorias/?page=${page}&page_size=50`);
      const resultados = response.data.results || [];

      setData(resultados);
      setNullNextPage(response.data.next);
      setPrevNextPage(response.data.previous);

      Swal.close();

      if (resultados.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin resultados',
          text: 'No se encontraron datos para los filtros aplicados.',
        });
      }
    } catch (error) {
      Swal.close();
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error al cargar categorías' });
      console.error('Error al cargar categorías:', error);
    }
  };

  // CREAR
  const enviarDatos = async (dataForm) => {
    // dataForm.subcategorias viene como [{id?, nombre, ...}] desde el modal
    const { subcategorias: subcats = [], ...categoriaData } = dataForm;

    try {
      const response = await postData("inventario/categorias-crear/", categoriaData);
      if (response?.status === 201 && response.data) {
        NotificationManager.success("Categoría creada", "Éxito", 3000);
        const categoriaId = response.data.id;

        // Crear subcategorías nuevas
        for (const sc of subcats) {
          const nombre = (typeof sc === 'string') ? sc : sc?.nombre;
          if (nombre && nombre.trim() !== '') {
            await postData("inventario/subcategorias-crear/", {
              nombre,
              categoria: categoriaId,
              is_active: true,
            });
          }
        }

        setSubcategorias([]);
        showModal(); // cerrar
      } else {
        NotificationManager.error("Algo salió mal", "Error", 5000);
      }
    } catch (err) {
      console.error('Error al crear categoría:', err);
      NotificationManager.error("Error al crear categoría", "Error", 5000);
    }

    cargarDatos();
  };

  // EDITAR (actualiza categoría y resuelve altas/bajas/renombres de subcategorías)
  const actualizarProveedor = async (datos) => {
    const { subcategorias: subcats = [], ...categoriaData } = datos;

    try {
      // 1) Actualizar la categoría
      const resCat = await putData(`inventario/categorias-actualizar/${categoriaData.id}/`, categoriaData);

      if (resCat.status === 200 || resCat.status === 204) {
        // 2) Sin IDs, no se puede CRUD de subcats -> por eso guardamos objetos con id/estado
        // estrategia:
        //  - si item._delete === true y tiene id -> eliminar
        //  - si !id y nombre válido -> crear
        //  - si id y _dirty === true -> actualizar nombre
        for (const sc of subcats) {
          const id = sc?.id;
          const nombre = (typeof sc === 'string') ? sc : sc?.nombre;
          const marcadoEliminar = sc?._delete === true;
          const cambiado = sc?._dirty === true;

          // eliminar
          if (marcadoEliminar && id) {
            try {
              await deleteData(`inventario/subcategorias-eliminar/${id}/`);
            } catch (e) {
              console.error('Error al eliminar subcategoría:', e);
            }
            continue;
          }

          // crear
          if (!id && nombre && nombre.trim() !== '') {
            try {
              await postData("inventario/subcategorias-crear/", {
                nombre,
                categoria: categoriaData.id,
                is_active: true,
              });
            } catch (e) {
              console.error('Error al crear subcategoría:', e);
            }
            continue;
          }

          // actualizar nombre
          if (id && cambiado) {
            try {
              await putData(`inventario/subcategorias-actualizar/${id}/`, {
                id,
                nombre,
                categoria: categoriaData.id,
                is_active: true,
              });
            } catch (e) {
              console.error('Error al actualizar subcategoría:', e);
            }
          }
        }

        NotificationManager.success("Categoría actualizada", "Éxito", 3000);
        cargarDatos();
        setShow(false);
      } else {
        console.warn("Algo salió mal al actualizar:", resCat);
      }
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
      NotificationManager.error("No se pudo actualizar la categoría", "Error", 4000);
    }
  };

  // ELIMINAR
  const eliminarProveedor = async (id) => {
    const confirmed = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará permanentemente la categoría.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmed.isConfirmed) {
      try {
        await deleteData(`inventario/categorias-eliminar/${id}/`);
        NotificationManager.success("Categoría eliminada", "Éxito", 3000);
        cargarDatos();
      } catch (error) {
        console.error('Error al eliminar categoría:', error);
        NotificationManager.error("Hubo un error al eliminar", "Error", 3000);
      }
    }
  };

  const showModal = () => setShow(!show);

  const abrirModalCrear = () => {
    setProveedorSeleccionado(null);
    setModoFormulario('crear');
    // comenzamos con una fila vacía como objeto para no perder estructura
    setSubcategorias([{ id: undefined, nombre: '' }]);
    showModal();
  };

  const abrirModalEditar = async (categoria) => {
    setProveedorSeleccionado(categoria);
    setModoFormulario('editar');

    try {
      // ¡IMPORTANTE! conservar id y nombre
      const response = await getData(`inventario/categorias/subcategorias/${categoria.id}/`);
      const items = Array.isArray(response.data) ? response.data : [];
      const normalizados = items.map(sc => ({ id: sc.id, nombre: sc.nombre }));
      setSubcategorias(normalizados.length ? normalizados : [{ id: undefined, nombre: '' }]);
    } catch (error) {
      console.error('Error al obtener subcategorías:', error);
      setSubcategorias([{ id: undefined, nombre: '' }]);
    }

    showModal();
  };

  const abrirModalVer = async (categoria) => {
    setProveedorSeleccionado(categoria);
    setModoFormulario('ver');

    try {
      const response = await getData(`inventario/categorias/subcategorias/${categoria.id}/`);
      const items = Array.isArray(response.data) ? response.data : [];
      const normalizados = items.map(sc => ({ id: sc.id, nombre: sc.nombre }));
      setSubcategorias(normalizados);
    } catch (error) {
      console.error('Error al obtener subcategorías:', error);
      setSubcategorias([]);
    }

    showModal();
  };

  useEffect(() => {
    cargarDatos();
    const getRole = () => {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      const r = u?.roles?.[0];
      return typeof r === "string" ? r : r?.id || null;
    };
    setRole(getRole());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const values = {
    data,
    show,
    showModal,
    nullNextPage,
    nullPrevPage,
    nextPage,
    prevPage,
    enviarDatos,
    modoFormulario,
    setModoFormulario,
    proveedorSeleccionado,
    setProveedorSeleccionado,
    abrirModalEditar,
    abrirModalCrear,
    abrirModalVer,
    actualizarProveedor,
    eliminarProveedor,
    subcategorias,
    setSubcategorias,
    role,
  };

  return <MyContext.Provider value={values}>{children}</MyContext.Provider>;
};

export const useMyContext = () => useContext(MyContext);
