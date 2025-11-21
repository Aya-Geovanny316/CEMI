import React, { Component } from 'react';
import { connect } from 'react-redux';
import windowSize from 'react-window-size';

import * as actionTypes from '../../../../../store/actions';

class OutsideClick extends Component {
  constructor(props) {
    super(props);

    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleOutsideClick);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleOutsideClick);
  }

  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  /**
   * Cierra el menú si se hace click fuera del contenedor
   */
  handleOutsideClick(event) {
    const { windowWidth, collapseMenu, onToggleNavigation } = this.props;

    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      if (windowWidth < 992 && collapseMenu) {
        onToggleNavigation();
      }
    }
  }

  render() {
    const { windowWidth, collapseMenu, children } = this.props;

    // 📌 Vista DESKTOP: solo envuelve y deja que el layout maneje el sidebar
    if (windowWidth >= 992) {
      return (
        <div className="nav-outside" ref={this.setWrapperRef}>
          {children}
        </div>
      );
    }

    // 📌 Vista MÓVIL: overlay + sidebar con degradado (clases CEMI)
    return (
      <div
        ref={this.setWrapperRef}
        className="cemi-sidebar-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1500,
          background: 'rgba(0, 0, 0, 0.4)',
          display: collapseMenu ? 'block' : 'none'
        }}
      >
        <div
          className="cemi-sidebar cemi-sidebar-inner cemi-sidebar-scroll"
          style={{
            width: '260px',
            height: '100%',
            overflowY: 'auto',
            padding: '1rem'
            // ❌ sin background aquí: lo pone el SCSS (degradado)
          }}
        >
          {children}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    collapseMenu: state.collapseMenu
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onToggleNavigation: () => dispatch({ type: actionTypes.COLLAPSE_MENU })
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(windowSize(OutsideClick));
