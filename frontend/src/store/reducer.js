import * as actionTypes from './actions';
import config from './../config';

// Validar y parsear de forma segura los datos del usuario desde localStorage
const rawUser = localStorage.getItem("user");
let parsedUser = null;

try {
    parsedUser = rawUser && rawUser !== "undefined" ? JSON.parse(rawUser) : null;
} catch (e) {
    console.error("Error parsing user from localStorage:", e);
    parsedUser = null;
}

const initialState = {
    isOpen: [],
    isTrigger: [],
    ...config,
    isFullScreen: false,
    token: localStorage.getItem("token") || null,
    user: parsedUser,
};

const reducer = (state = initialState, action) => {
    let trigger = [];
    let open = [];

    switch (action.type) {
        case actionTypes.LOGIN_SUCCESS:
            try {
                const token = action.payload;
                localStorage.setItem("token", token);

                // Decodificar el payload del JWT de forma segura
                const base64Url = token.split(".")[1];
                const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
                const userData = JSON.parse(atob(base64));

                // Validar antes de guardar
                if (userData && typeof userData === "object") {
                    localStorage.setItem("user", JSON.stringify(userData));
                }

                return {
                    ...state,
                    token,
                    user: userData,
                };
            } catch (error) {
                console.error("Error al decodificar el token:", error);
                return state;
            }

        case actionTypes.LOGOUT:
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            return {
                ...state,
                token: null,
                user: null,
            };

        case actionTypes.COLLAPSE_MENU:
            return {
                ...state,
                collapseMenu: !state.collapseMenu,
            };

        case actionTypes.COLLAPSE_TOGGLE:
            if (action.menu.type === 'sub') {
                open = state.isOpen.includes(action.menu.id)
                    ? state.isOpen.filter(item => item !== action.menu.id)
                    : [...state.isOpen, action.menu.id];

                trigger = state.isTrigger.includes(action.menu.id)
                    ? state.isTrigger.filter(item => item !== action.menu.id)
                    : [...state.isTrigger, action.menu.id];
            } else {
                trigger = state.isTrigger.includes(action.menu.id) ? [] : [action.menu.id];
                open = trigger;
            }

            return { ...state, isOpen: open, isTrigger: trigger };

        case actionTypes.NAV_CONTENT_LEAVE:
            return { ...state, isOpen: [], isTrigger: [] };

        case actionTypes.NAV_COLLAPSE_LEAVE:
            if (action.menu.type === 'sub') {
                open = state.isOpen.filter(item => item !== action.menu.id);
                trigger = state.isTrigger.filter(item => item !== action.menu.id);
                return { ...state, isOpen: open, isTrigger: trigger };
            }
            return state;

        case actionTypes.FULL_SCREEN:
            return { ...state, isFullScreen: !state.isFullScreen };

        case actionTypes.FULL_SCREEN_EXIT:
            return { ...state, isFullScreen: false };

        case actionTypes.CHANGE_LAYOUT:
            return { ...state, layout: action.layout };

        default:
            return state;
    }
};

export default reducer;
