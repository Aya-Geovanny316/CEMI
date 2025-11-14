import React from 'react'
import { Row, Col, Card, Table, Button } from 'react-bootstrap';
import { useMyContext } from './Context';
import UcFirst from '../../App/components/UcFirst';
import { FcCancel } from "react-icons/fc";

export const Roles = () => {

  const { data, showModal, deleteUser } = useMyContext();

  return (
    <div>
      <h1>Roles</h1>
      <Button variant='primary' onClick={() => showModal()}><UcFirst text='Add +' /></Button>
      <div>
        <Table striped responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Rol</th>
              {/* <th>Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <th scope="row">{item.id}</th>
                <td>{item.name}</td>
                {/* <td><Button variant='outline-dark' onClick={() => deleteUser(item.id)}><FcCancel /></Button></td> */}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  )
}
