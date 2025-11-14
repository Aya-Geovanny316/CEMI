import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom'; // ✅ Cambiado a HashRouter

import App from './App/index';
import * as serviceWorker from './serviceWorker';
import reducer from './store/reducer';

import 'react-notifications/lib/notifications.css';
import './assets/vendor/bootstrap.min.css';

//Programador Kevyn Giron

const store = createStore(reducer);

const app = (
    <Provider store={store}>
        <HashRouter>
            <App />
        </HashRouter>
    </Provider>
);

ReactDOM.render(app, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
