import React, { createContext, useState, useContext, useEffect } from 'react';
import { getData, postData, deleteData, putData } from '../../apiService';
import { NotificationManager } from "react-notifications";

const MyContext = createContext();

export const ContextProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [show, setShow] = useState(false);
  const [formKey, setFormKey] = useState(Date.now());
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [isViewingProduct, setIsViewingProduct] = useState(false);
  const [categories, setCategories] = useState([]);

  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [prevPageUrl, setPrevPageUrl] = useState(null);

  const showModal = () => setShow(!show);

  const fetchData = async (url = 'products/') => {
    try {
      const response = await getData(url);
      setData(response.data.results || response.data);
      setNextPageUrl(response.data.next || null);
      setPrevPageUrl(response.data.previous || null);

      const cats = await getData('category/');
      setCategories(cats.data);
    } catch (error) {
      console.error('Error al obtener productos o categorías:', error);
    }
  };

  const sendData = async (product) => {
    try {
      await postData('products/createcode a/', product);
      NotificationManager.success("Producto creado", "Éxito", 3000);
      fetchData();
      showModal();
    } catch (error) {
      NotificationManager.error("Error al crear producto", "Error", 5000);
    }
  };

  const updateProduct = async (product) => {
    try {
      const response = await putData(`products/update/${product.id}/`, product); // <-- PUT en vez de POST
      if (response.status === 200) {
        NotificationManager.success("Producto actualizado", "Éxito", 3000);
        fetchData();
        showModal();
      } else {
        NotificationManager.error("Error al actualizar", "Error", 5000);
      }
    } catch (error) {
      NotificationManager.error("Error al actualizar", "Error", 5000);
    }
  };  

  const deleteProduct = async (id) => {
    try {
      await deleteData(`products/delete/${id}/`);
      NotificationManager.success("Producto eliminado", "Éxito", 3000);
      fetchData();
    } catch (error) {
      NotificationManager.error("Error al eliminar", "Error", 5000);
    }
  };

  const openCreateProductModal = () => {
    setSelectedProduct(null);
    setIsEditingProduct(false);
    setIsViewingProduct(false);
    setFormKey(Date.now());
    setShow(true);
  };

  const openEditProductModal = (product) => {
    setSelectedProduct(product);
    setIsEditingProduct(true);
    setIsViewingProduct(false);
    setFormKey(Date.now());
    setShow(true);
  };

  const openViewProductModal = (product) => {
    setSelectedProduct(product);
    setIsViewingProduct(true);
    setIsEditingProduct(false);
    setFormKey(Date.now());
    setShow(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const values = {
    data,
    show,
    formKey,
    selectedProduct,
    isEditingProduct,
    isViewingProduct,
    nextPageUrl,
    prevPageUrl,
    categories,
    showModal,
    sendData,
    updateProduct,
    deleteProduct,
    fetchPage: fetchData,
    openCreateProductModal,
    openEditProductModal,
    openViewProductModal,
  };

  return (
    <MyContext.Provider value={values}>
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => useContext(MyContext);