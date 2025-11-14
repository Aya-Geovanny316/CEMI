import React, { useContext } from 'react';
import { Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import { AppContext } from './Context';

const ListEntradas = () => {
  const {
    entradas = [],
    filters = { fecha: '', bodega: '', tipo: '' },
    setFilters,
    page = 1,
    setPage,
    nextUrl,
    prevUrl,
    bodegas, // puede venir en cualquier formato
    setShowForm,
    setSelectedEntrada,
    setShowDetail,
    eliminarEntrada
  } = useContext(AppContext);

  // ---- Roles & permisos (10: estándar solo ver; 12: operador puede agregar/editar) ----
  const roles = (JSON.parse(localStorage.getItem('user') || '{}')?.roles || []).map(r => r.id);
  const isAdmin = roles.includes(1);
  const isOperador = roles.includes(12);
  const canManage = isAdmin || isOperador; // agregar/editar/aplicar
  const canAdd = canManage; // botón Nueva Entrada
  const canDelete = isAdmin; // Rol 12 no puede eliminar

  // ---- Normalización segura de bodegas a arreglo ----
  const bodegasList = Array.isArray(bodegas)
    ? bodegas
    : (bodegas && typeof bodegas === 'object'
        ? Object.values(bodegas) // p.ej. { "1": {...}, "2": {...} }
        : []);

  // ---- Handlers ----
  const onChangeFilter = (key) => (e) => {
    const v = e?.target?.value ?? e;
    setFilters((f) => ({ ...f, [key]: v }));
  };

  return (
    <Card className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="m-0">Entradas</h5>
        <Button
          disabled={!canAdd}
          onClick={() => {
            if (!canAdd) return;
            setSelectedEntrada(null);
            setShowForm(true);
          }}
        >
          Nueva Entrada
        </Button>
      </div>

      <Row className="mb-2 g-2">
        <Col md={3}>
          <Form.Control
            type="date"
            value={filters.fecha || ''}
            onChange={onChangeFilter('fecha')}
          />
        </Col>

        <Col md={3}>
          <Form.Control
            as="select"
            value={filters.bodega || ''}
            onChange={onChangeFilter('bodega')}
          >
            <option value="">Bodega</option>
            {bodegasList.map((b, idx) => {
              const id = b?.id ?? b?.value ?? b?.codigo ?? idx;
              const nombre = b?.nombre ?? b?.label ?? b?.descripcion ?? String(b);
              return (
                <option key={id} value={nombre}>
                  {nombre}
                </option>
              );
            })}
          </Form.Control>
        </Col>

        <Col md={3}>
          <Form.Control
            as="select"
            value={filters.tipo || ''}
            onChange={onChangeFilter('tipo')}
          >
            <option value="">Tipo de entrada</option>
            <option value="compra">Compra</option>
            <option value="donacion">Donación</option>
            <option value="ajuste">Ajuste</option>
          </Form.Control>
        </Col>
      </Row>

      <Table bordered hover size="sm" responsive>
        <thead className="table-primary">
          <tr>
            <th>#</th>
            <th>Fecha</th>
            <th>Bodega</th>
            <th>Tipo</th>
            <th>Proveedor</th>
            <th>Referencia</th>
            <th className="text-end">Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {entradas.map((e) => (
            <tr key={e.id}>
              <td>{e.id}</td>
              <td>{e?.created_at ? new Date(e.created_at).toLocaleString() : '-'}</td>
              <td>{e?.bodega ?? '-'}</td>
              <td>{e?.tipo_entrada ?? '-'}</td>
              <td>{e?.proveedor ?? '-'}</td>
              <td>{e?.numero_referencia ?? '-'}</td>
              <td className="text-end">
                {(() => {
                  const nf = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                  const v = typeof e?.total === 'number' ? e.total : (parseFloat(e?.total) || 0);
                  return nf.format(v);
                })()}
              </td>
              <td>{e?.estado === 'aplicada' ? 'Aplicada' : 'No Aplicada'}</td>
              <td className="d-flex gap-2">
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => {
                    setSelectedEntrada(e);
                    setShowDetail(true);
                  }}
                >
                  Ver
                </Button>
                {canManage && (
                  <>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => {
                        setSelectedEntrada(e);
                        setShowForm(true);
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      disabled={!canDelete}
                      title={!canDelete ? 'No tiene permisos para eliminar' : undefined}
                      onClick={() => {
                        if (!canDelete) return;
                        eliminarEntrada(e.id);
                      }}
                    >
                      Eliminar
                    </Button>
                    {e?.estado !== 'aplicada' && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => window.applyEntrada ? window.applyEntrada(e.id) : null}
                      >
                        Aplicar
                      </Button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}

          {entradas.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center">
                Sin resultados
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <div className="d-flex justify-content-end mt-2 gap-2">
        <Button
          size="sm"
          disabled={!prevUrl || page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </Button>
        <Button
          size="sm"
          disabled={!nextUrl}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </Card>
  );
};

export default ListEntradas;
