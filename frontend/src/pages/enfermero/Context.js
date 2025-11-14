import React, { createContext, useState, useContext, useEffect } from 'react';
import { getData, postData, deleteData } from '../../apiService';
import { NotificationManager } from "react-notifications";

// Crear el contexto
const MyContext = createContext();

// Crear el proveedor
export const ContextProvider = ({ children }) => {
  const [state, setState] = useState("Valor inicial");
  const [data, setData] = useState([])
  const [show, setShow] = useState(false)
  const [showRol, setShowRol] = useState(false)
  const [data1, setData1] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("");
  const [getRol, setGetRol] = useState([])

  const showModal = () => setShow(!show)
  const showModalRol = () => setShowRol(!showRol)

  const fetchData = async () => {
    try {
      const data = await getData('user/');
      const dataRol = await getData('rol/')
      setData(data.data)
      setGetRol(dataRol.data)
      console.log(data.data)
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
  };

  const sendData = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await postData("user/register/", data);

      console.log("Response completa:", response);

      if (response?.status === 201 && response.data) {
        setData1(response.data);
        NotificationManager.success("Mensaje", "Título", 3000);
        fetchData()
        showModal()
      } else {
        setError(`Error ${response?.status || "desconocido"}`);
        NotificationManager.error("Algo salió mal", "Error", 5000);
      }
    } catch (err) {
      setError(err.message || "Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await deleteData(`user/delete/${id}/`);
  
      if (response.status === 200) {
        NotificationManager.success("Usuario eliminado", "Éxito", 3000);
        fetchData(); // Refrescar datos después de eliminar
      } else {
        setError(`Error ${response.status || "desconocido"}`);
        NotificationManager.error("No se pudo eliminar", "Error", 5000);
      }
    } catch (err) {
      setError(err.message || "Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  const assignRol = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await postData("rol/assign/", data);

      console.log("Response completa:", response);

      if (response?.status === 200 && response.data) {
        setData1(response.data);
        NotificationManager.success("Mensaje", "Título", 3000);
        fetchData()
        showModalRol()
      } else {
        setError(`Error ${response?.status || "desconocido"}`);
        NotificationManager.error("Algo salió mal", "Error", 5000);
      }
    } catch (err) {
      setError(err.message || "Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };
  

  useEffect(() => {
    fetchData(); // Llamar a la función asíncrona
  }, []);

  const values = {
    state,
    data,
    show,
    showRol,
    username,
    getRol,
    assignRol,
    setUsername,
    showModalRol,
    setState,
    showModal,
    sendData,
    deleteUser,
  }

  return (
    <MyContext.Provider value={values}>
      {children}
    </MyContext.Provider>
  );
};

// Crear un hook personalizado para usar el contexto
export const useMyContext = () => {
  return useContext(MyContext);
};
