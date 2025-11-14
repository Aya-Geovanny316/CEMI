import React from 'react'
import { Row, Col, Card, Table, Button } from 'react-bootstrap';
import { useMyContext } from './Context';
import UcFirst from '../../App/components/UcFirst';
import { FcCancel, FcCheckmark } from "react-icons/fc";
import { convert_fecha_hora } from '../../utils/formatUtils';

export const Users = () => {

  const { data, showModal, deleteUser, showModalRol, username, setUsername } = useMyContext();
  const editRol = (user) => {
    setUsername(user)
    setTimeout(showModalRol, 0);
  }

  return (
    <div>
      <h1>Usuarios</h1>
      <Button variant='primary' onClick={() => showModal()}><UcFirst text='Add +' /></Button>
      <div>
        <Table striped responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Username</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Last Login</th>
              <th>Rol</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <th scope="row">{item.id}</th>
                <td>{item.username}</td>
                <td>{item.first_name}</td>
                <td>{item.last_name}</td>
                <td>{convert_fecha_hora(item.last_login)}</td>
                <td>{item.rol[0]?.rol || 'Sin rol'}</td>
                <td>
                  <div>
                    <Button variant='outline-dark' onClick={() => editRol(item.username)}><FcCheckmark /></Button>
                    <Button variant='outline-dark' onClick={() => deleteUser(item.id)}><FcCancel /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  )
}
