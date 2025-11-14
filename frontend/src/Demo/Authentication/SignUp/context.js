import { createContext, useState, useContext } from "react";
import { withRouter } from "react-router-dom";
import { postData } from "../../../apiService";
import { NotificationManager } from "react-notifications";

const ComponentContext = createContext(null);

function ComponentProvider({ children, history }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const sendData = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await postData("user/register/", data);

            if (response?.status === 201 && response.data) {
                NotificationManager.success("Mensaje", "Título", 3000);
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

    const values = { 
        isLoading, 
        error, 
        sendData 
    };

    return (
        <ComponentContext.Provider value={values}>
            {children}
        </ComponentContext.Provider>
    );
}

export function useComponentContext() {
    return useContext(ComponentContext);
}

export default withRouter(ComponentProvider);
