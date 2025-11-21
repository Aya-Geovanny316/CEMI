import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import windowSize from 'react-window-size';

import NavLogo from './NavLogo';
import NavContent from './NavContent';
import OutsideClick from './OutsideClick';
import Aux from './../../../../hoc/_Aux';
import * as actionTypes from './../../../../store/actions';
import staticRoutes from '../../../../utils/menuRoutes';

class Navigation extends Component {
  resize = () => {
    const contentWidth = document.getElementById('root').clientWidth;
    if (this.props.layout === 'horizontal' && contentWidth < 992) {
      this.props.onChangeLayout('vertical');
    }
  };

  componentDidMount() {
    this.resize();
    window.addEventListener('resize', this.resize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  render() {
    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;

    // Normaliza roles a strings y usa la unión (no exclusividad)
    const rawRoles = (user?.roles || []).map(role => String(role.id ?? role));
    const userRoles = new Set(rawRoles);

    // ✅ Filtro corregido
    const filterByRoles = (items) => {
      if (!Array.isArray(items)) return [];
      return items
        .filter(item => !item.roles || item.roles.some(role => userRoles.has(String(role))))
        .map(item => ({
          ...item,
          children: item.children ? filterByRoles(item.children) : undefined
        }))
        .filter(item => !item.children || item.children.length > 0);
    };

    // Eliminamos whitelist global para no limitar módulos; usamos solo roles
    const filteredRoutes = filterByRoles(staticRoutes);

  const navContent = (
  <div className="cemi-sidebar-inner">
    <div className="cemi-sidebar-scroll">
      <NavLogo
        collapseMenu={this.props.collapseMenu}
        windowWidth={this.props.windowWidth}
        onToggleNavigation={this.props.onToggleNavigation}
      />
      <NavContent navigation={filteredRoutes} />
    </div>

    <div className="cemi-sidebar-footer">
      © 2025 Oscar de Leon
    </div>
  </div>
);

return (
  <Aux>
    <nav
      className="pcoded-navbar no-scrollbar cemi-sidebar"
      style={{
        height: '100vh',
        width: '260px',
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        // 🔴 ya NO hay backgroundColor aquí
      }}
    >
      {this.props.windowWidth < 992 ? (
        <OutsideClick>{navContent}</OutsideClick>
      ) : (
        navContent
      )}
    </nav>
  </Aux>
);

  }
}

const mapStateToProps = state => ({
  layout: state.layout,
  preLayout: state.preLayout,
  collapseMenu: state.collapseMenu,
  layoutType: state.layoutType,
  navBackColor: state.navBackColor,
  navBackImage: state.navBackImage,
  navIconColor: state.navIconColor,
  navBrandColor: state.navBrandColor,
  layout6Background: state.layout6Background,
  layout6BackSize: state.layout6BackSize,
  rtlLayout: state.rtlLayout,
  navFixedLayout: state.navFixedLayout,
  boxLayout: state.boxLayout,
  navDropdownIcon: state.navDropdownIcon,
  navListIcon: state.navListIcon,
  navActiveListColor: state.navActiveListColor,
  navListTitleColor: state.navListTitleColor,
  navListTitleHide: state.navListTitleHide,
});

const mapDispatchToProps = dispatch => ({
  onToggleNavigation: () => dispatch({ type: actionTypes.COLLAPSE_MENU }),
  onChangeLayout: layout => dispatch({ type: actionTypes.CHANGE_LAYOUT, layout }),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(windowSize(Navigation)));
