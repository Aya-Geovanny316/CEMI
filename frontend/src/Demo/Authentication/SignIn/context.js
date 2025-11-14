import { createContext, useState, useContext, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { postData } from "../../../apiService";

const ComponentContext = createContext(null);

function ComponentProvider({ children, history }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const sendData = async (data) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await postData("user/login/", data);

            if (response?.status === 200 && response.data) {
                // Guardar token en localStorage
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.user));
                setIsLoading(false);
                history.push("/dashboard/default");

            } else {
                setError(`Error ${response?.status || "desconocido"}`);
            }
        } catch (err) {
            const backendError = err?.response?.data?.error;
            setError(backendError || "Ocurrió un error inesperado");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("token-data");
        localStorage.removeItem("user");
        localStorage.removeItem("user-data");
        localStorage.removeItem("userData");
    }, [])


    const values = {
        isLoading,
        error,
        sendData
    }

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
