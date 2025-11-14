import React, { Component } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FiUser, FiLogOut } from 'react-icons/fi';

import ChatList from './ChatList';
import Aux from "../../../../../hoc/_Aux";

import Avatar1 from '../../../../../assets/images/user/avatar-1.jpg';
import { logout } from '../../../../../apiService';

class NavRight extends Component {
  state = {
    listOpen: false
  };

  handleLogout = async () => {
    try {
      await logout(); // ✅ llama tu nuevo wrapper con axios
    } catch (error) {
      // puede fallar si el token ya expiró o fue borrado, no pasa nada
      console.warn('No se pudo registrar el cierre de sesión:', error);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/#/auth/signin-1';
  };

  render() {
    const user = JSON.parse(localStorage.getItem("user"));
    const username = user?.username || "Usuario";

    return (
      <Aux>
        <ul className="navbar-nav ml-auto">
          <li>
            <Dropdown alignRight={!this.props.rtlLayout} className="drp-user">
              <Dropdown.Toggle variant="link" id="dropdown-user">
                <FiUser size={20} />
              </Dropdown.Toggle>
              <Dropdown.Menu alignRight className="profile-notification">
                <div className="pro-head text-center p-3 border-bottom">
                  <img src={Avatar1} className="img-radius mb-2" alt="User" style={{ width: '40px', height: '40px' }} />
                  <div>{username}</div>
                </div>
                <Dropdown.Item onClick={this.handleLogout} className="d-flex align-items-center">
                  <FiLogOut className="me-2" />
                  Cerrar sesión
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </li>
        </ul>
        <ChatList listOpen={this.state.listOpen} closed={() => { this.setState({ listOpen: false }); }} />
      </Aux>
    );
  }
}

export default NavRight;
