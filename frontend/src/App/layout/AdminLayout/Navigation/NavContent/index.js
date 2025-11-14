import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import PerfectScrollbar from 'react-perfect-scrollbar';
import windowSize from 'react-window-size';

import { FiChevronRight } from 'react-icons/fi';

import Aux from "../../../../../hoc/_Aux";
import * as actionTypes from "../../../../../store/actions";

class NavContent extends Component {
  constructor(props) {
    super(props);
    this.parentMap = {};
    this.childMap = {};
    this.rootMenuIds = new Set();
    this.urlLookup = {};
    this.initializeNavigationData(props.navigation);
    this.state = {
      activeMenus: this.getActiveMenuStateForPath(props.location?.pathname || '')
    };
  }

  componentDidUpdate(prevProps) {
    const navigationChanged = prevProps.navigation !== this.props.navigation;
    const locationChanged = prevProps.location?.pathname !== this.props.location?.pathname;

    if (navigationChanged) {
      this.initializeNavigationData(this.props.navigation);
    }

    if (navigationChanged || locationChanged) {
      const nextState = this.getActiveMenuStateForPath(this.props.location?.pathname || '');
      if (!this.areActiveMenusEqual(this.state.activeMenus, nextState)) {
        this.setState({ activeMenus: nextState });
      }
    }
  }

  initializeNavigationData = (navigation) => {
    this.parentMap = {};
    this.childMap = {};
    this.rootMenuIds = new Set();
    this.urlLookup = {};
    this.buildParentMap(Array.isArray(navigation) ? navigation : []);
  };

  buildParentMap = (items, parentId = null) => {
    if (!Array.isArray(items)) {
      return;
    }
    items.forEach(item => {
      this.parentMap[item.id] = parentId;
      if (!parentId) {
        this.rootMenuIds.add(item.id);
      }
      this.childMap[item.id] = item.children ? item.children.map(child => child.id) : [];
      if (item.url) {
        const normalizedUrl = this.normalizePath(item.url);
        this.urlLookup[normalizedUrl] = item.id;
      }
      if (item.children) {
        this.buildParentMap(item.children, item.id);
      }
    });
  };

  normalizePath = (pathname) => {
    if (!pathname) {
      return '/';
    }
    const [pathOnly] = pathname.split('?');
    const [cleanPath] = pathOnly.split('#');
    if (cleanPath === '/') {
      return cleanPath;
    }
    return cleanPath.replace(/\/+$/, '') || '/';
  };

  findMenuIdByPath = (pathname) => {
    const normalized = this.normalizePath(pathname);
    if (this.urlLookup[normalized]) {
      return this.urlLookup[normalized];
    }

    const candidates = Object.keys(this.urlLookup)
      .filter((url) => normalized.startsWith(this.normalizePath(url)))
      .sort((a, b) => b.length - a.length);

    if (candidates.length === 0) {
      return null;
    }

    return this.urlLookup[candidates[0]];
  };

  getEmptyMenuState = () => {
    const base = {};
    Object.keys(this.parentMap).forEach((id) => {
      base[id] = false;
    });
    return base;
  };

  getActiveMenuStateForPath = (pathname) => {
    const activeState = this.getEmptyMenuState();
    const matchId = this.findMenuIdByPath(pathname);
    if (!matchId) {
      return activeState;
    }

    let currentId = matchId;
    while (currentId) {
      activeState[currentId] = true;
      currentId = this.parentMap[currentId] || null;
    }

    return activeState;
  };

  areActiveMenusEqual = (current, next) => {
    const keys = new Set([...Object.keys(current), ...Object.keys(next)]);
    for (const key of keys) {
      if (!!current[key] !== !!next[key]) {
        return false;
      }
    }
    return true;
  };

  // Maneja la apertura y cierre de los submenús sin colapsar los padres
  toggleSubmenu = (e, key) => {
    // Evitamos que el click se propague y cierre niveles superiores
    e.preventDefault();
    e.stopPropagation();

    this.setState(prevState => {
      const activeMenus = { ...prevState.activeMenus };
      const closeDescendants = (id) => {
        const children = this.childMap[id] || [];
        children.forEach(childId => {
          activeMenus[childId] = false;
          closeDescendants(childId);
        });
      };

      const parentId = this.parentMap[key] || null;
      const isOpening = !activeMenus[key];

      if (!isOpening && parentId) {
        return prevState;
      }

      if (isOpening) {
        const siblings = parentId ? (this.childMap[parentId] || []) : Array.from(this.rootMenuIds);
        siblings.forEach(siblingId => {
          if (siblingId !== key) {
            activeMenus[siblingId] = false;
            closeDescendants(siblingId);
          }
        });

        activeMenus[key] = true;

        let ancestorId = parentId;
        while (ancestorId) {
          activeMenus[ancestorId] = true;
          ancestorId = this.parentMap[ancestorId] || null;
        }
      } else {
        activeMenus[key] = false;
        closeDescendants(key);
      }

      return { activeMenus };
    });
  };

  renderNavItems = (items) => {
    return items.map((item) => {
      const currentKey = item.id;
      const hasChildren = item.children && item.children.length > 0;
      const isOpen = !!this.state.activeMenus[currentKey];
      const isLeafActive = !hasChildren && isOpen;
      const isActive = hasChildren ? isOpen : isLeafActive;

      const containerStyle = {
        padding: 0,
        margin: 0,
        backgroundColor: isActive ? '#384865' : 'transparent',
        borderLeft: isActive ? '3px solid #00BFFF' : '3px solid transparent',
        transition: 'background-color 0.3s ease, border-left-color 0.3s ease',
        listStyle: 'none',
        boxSizing: 'border-box'
      };

      const linkStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '8px 16px',
        minHeight: '40px',
        color: isActive ? '#00BFFF' : '#fff',
        fontWeight: isActive ? 600 : 400,
        textDecoration: 'none',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        width: '100%'
      };

      const iconSpan = (
        <span style={{
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px'
        }}>
          {item.icon}
        </span>
      );

      const textSpan = (
        <span style={{
          fontSize: '14px',
          marginLeft: '12px',
          transition: 'color 0.3s ease',
          color: 'inherit'
        }}>
          {item.title}
        </span>
      );

      // Si el ítem tiene hijos, renderiza el botón para desplegar
      if (hasChildren) {
        return (
          <li key={currentKey} style={containerStyle}>
            <button
              type="button"
              onClick={(e) => this.toggleSubmenu(e, currentKey)}
              style={linkStyle}
              aria-expanded={isOpen}
            >
              {iconSpan}
              {textSpan}
              <FiChevronRight style={{
                fontSize: '16px',
                marginLeft: 'auto',
                transition: 'transform 0.3s',
                transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)'
              }} />
            </button>
            <ul
              style={{
                paddingLeft: '20px',
                margin: 0,
                overflow: 'hidden',
                maxHeight: isOpen ? '1000px' : 0,
                opacity: isOpen ? 1 : 0,
                pointerEvents: isOpen ? 'auto' : 'none',
                transition: 'max-height 0.3s ease, opacity 0.3s ease'
              }}
            >
              {this.renderNavItems(item.children)}
            </ul>
          </li>
        );
      }

      // Ítems sin hijos
      if (!item.url) {
        return (
          <li key={currentKey} style={containerStyle}>
            <span style={linkStyle}>
              {iconSpan}
              {textSpan}
            </span>
          </li>
        );
      }

      return (
        <li key={currentKey} style={containerStyle}>
          <Link
            to={item.url}
            style={linkStyle}
            onClick={() => {
              if (!item.parentId) {
                this.setState({ activeMenus: {} });
              }
            }}
          >
            {iconSpan}
            {textSpan}
          </Link>
        </li>
      );
    });
  };

  render() {
    const navItems = this.renderNavItems(this.props.navigation);
    const horizontal = this.props.layout === 'horizontal';

    const navList = (
      <ul
        className={`nav pcoded-inner-navbar ${horizontal ? 'sidenav-inner' : ''}`}
        id={horizontal ? 'sidenav-horizontal' : ''}
        onMouseLeave={this.props.onNavContentLeave}
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          backgroundColor: '#2e3b55',
          color: '#fff'
        }}
      >
        {navItems}
      </ul>
    );

    return (
      <Aux>
        {horizontal ? (
          <div className="navbar-content sidenav-horizontal" id="layout-sidenav">
            <div id="sidenav-wrapper" className="sidenav-horizontal-wrapper">{navList}</div>
          </div>
        ) : (
          <div className="navbar-content datta-scroll" style={{ height: '100vh', backgroundColor: '#2e3b55' }}>
            <PerfectScrollbar>{navList}</PerfectScrollbar>
          </div>
        )}
      </Aux>
    );
  }
}

const mapStateToProps = state => ({
  layout: state.layout,
  collapseMenu: state.collapseMenu,
});

const mapDispatchToProps = dispatch => ({
  onNavContentLeave: () => dispatch({ type: actionTypes.NAV_CONTENT_LEAVE }),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(windowSize(NavContent)));
