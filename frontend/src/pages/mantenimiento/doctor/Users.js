import React, { useState } from 'react';
import {
  Table,
  Button,
  Form,
  InputGroup,
  Dropdown
} from 'react-bootstrap';
import { useMyContext } from './Context';
import { FiEdit3, FiSettings, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { BiSearch } from 'react-icons/bi';

const formatFecha = () => {
  const hoy = new Date();
  return hoy.toLocaleDateString('es-ES');
};

const Users = () => {
  const {
    data,
    pagination,
    fetchPage,
    searchUsers,
    openCreateUserModal,
    openViewUserModal
  } = useMyContext();

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const totalPages = Math.ceil(pagination.count / pageSize);

  const handlePageChange = (pageNumber) => {
    if (pageNumber !== currentPage && pageNumber >= 1 && pageNumber <= totalPages) {
      const baseUrl = pagination.next
        ? pagination.next.split('?')[0]
        : pagination.previous
          ? pagination.previous.split('?')[0]
          : 'user/';
      fetchPage(`${baseUrl}?page=${pageNumber}`);
      setCurrentPage(pageNumber);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (value.trim() === '') {
      fetchPage('user/');
      setCurrentPage(1);
    } else {
      searchUsers(value);
      setCurrentPage(1);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    const isStart = currentPage <= 3;
    const isEnd = currentPage >= totalPages - 2;

    if (isStart) {
      for (let i = 1; i <= Math.min(maxPagesToShow, totalPages); i++) {
        pages.push(i);
      }
      if (totalPages > maxPagesToShow) {
        pages.push('...', totalPages);
      }
    } else if (isEnd) {
      pages.push(1, '...');
      for (let i = totalPages - (maxPagesToShow - 1); i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1, '...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push('...', totalPages);
    }

    return pages.map((number, index) =>
      number === '...' ? (
        <span key={index} className="mx-1">...</span>
      ) : (
        <Button
          key={index}
          variant={number === currentPage ? "primary" : "outline-secondary"}
          size="sm"
          className="mx-1"
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Button>
      )
    );
  };

  return (
    <div className="p-3 bg-light">
      {/* Título y Fecha */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
        <h4 className="fw-bold text-dark mb-0">Consulta Doctores</h4>
        <span className="fw-semibold text-dark">{formatFecha()}</span>
      </div>

      {/* Barra de control */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
        {/* <Button variant="primary" onClick={openCreateUserModal}>
          Add +
        </Button> */}

        <InputGroup style={{ flex: 1 }}>
          <Form.Control
            type="text"
            placeholder="Búsqueda rápida"
            value={search}
            onChange={handleSearch}
          />
          <InputGroup.Text>
            <BiSearch />
          </InputGroup.Text>
        </InputGroup>

        {/* <Dropdown>
          <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
            <FiSettings style={{ marginRight: '6px' }} />
            <span>Exportar</span>
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item disabled>PDF</Dropdown.Item>
            <Dropdown.Item disabled>WORD</Dropdown.Item>
            <Dropdown.Item disabled>Excel</Dropdown.Item>
            <Dropdown.Item disabled>XML</Dropdown.Item>
            <Dropdown.Item disabled>CSV</Dropdown.Item>
            <Dropdown.Item disabled>RTF</Dropdown.Item>
            <Dropdown.Item disabled>Imprimir</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown> */}
      </div>

      {/* Tabla */}
      <div className="table-responsive">
        <Table striped hover>
          <thead>
            <tr>
              <th style={{ width: '50px' }}></th>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>E-mail</th>
              <th>Activo</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => openViewUserModal(item.username)}
                  >
                    <FiEdit3 />
                  </Button>
                </td>
                <td>{item.username}</td>
                <td>{item.perfil?.primer_nombre || ''} {item.perfil?.primer_apellido || ''}</td>
                <td>{item.email || ''}</td>
                <td>{item.is_active ? 'Sí' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="d-flex justify-content-center align-items-center flex-wrap gap-2 mt-3">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <FiChevronLeft /> Anterior
        </Button>

        {renderPageNumbers()}

        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Siguiente <FiChevronRight />
        </Button>
      </div>
    </div>
  );
};

export default Users;
