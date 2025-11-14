import React, { Component, Suspense } from 'react';
import { Switch, Route, Redirect, withRouter } from 'react-router-dom';
import { NotificationContainer } from 'react-notifications'; // Importa NotificationContainer

import Loader from './layout/Loader'
import Aux from "../hoc/_Aux";
import ScrollToTop from './layout/ScrollToTop';
import SimpleLayout from './layout/SimpleLayout';
import authRoutes from "../route";
import appRoutes from "../routes";

const AdminLayout = React.lazy(() => import('./layout/AdminLayout'));

class App extends Component {
    render() {
        const menu = authRoutes.map((route, index) => {
            return (route.component) ? (
                <Route
                    key={index}
                    path={route.path}
                    exact={route.exact}
                    name={route.name}
                    render={props => (
                        <route.component {...props} />
                    )} />
            ) : (null);
        });

        const isIframeRoute = this.props.location?.pathname?.startsWith('/dashboard/pacientes/enfermeria/iframe');
        const iframeRoute = appRoutes.find((route) => route.path === '/dashboard/pacientes/enfermeria/iframe/:view');

        const switchRoutes = (
            <Suspense fallback={<Loader />}>
                <Switch>
                    {menu}

                    {iframeRoute ? (
                        <Route
                            key="pacientes-enfermeria-iframe"
                            path="/dashboard/pacientes/enfermeria/iframe/:view"
                            render={(props) => <iframeRoute.component {...props} />}
                        />
                    ) : null}

                    {/* Redirige desde raíz */}
                    <Route exact path="/">
                        <Redirect to="/auth/signin-1" />
                    </Route>

                    {/* Solo rutas dashboard */}
                    <Route path="/dashboard" component={AdminLayout} />

                    {/* Opcional: si quieres manejar otras rutas */}
                    <Route path="*" render={() => <Redirect to="/auth/signin-1" />} />
                </Switch>
            </Suspense>
        );

        const routing = (
            <Aux>
                {/* Agregar NotificationContainer aquí */}
                <NotificationContainer />
                <ScrollToTop>
                    {isIframeRoute ? switchRoutes : (
                        <SimpleLayout>
                            {switchRoutes}
                        </SimpleLayout>
                    )}
                </ScrollToTop>
            </Aux>
        );

        return routing;
    }
}

export default withRouter(App);
