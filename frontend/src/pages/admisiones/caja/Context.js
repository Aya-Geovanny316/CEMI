import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [state, setState] = useState(null);
    const [loading, setLoading] = useState(false);

    //Poner toda la logica aqui

    const values = {
        state,
        setState,
        loading,
        setLoading
    };

    return (
        <AppContext.Provider value={values}>
            {children}
        </AppContext.Provider>
    );
};
