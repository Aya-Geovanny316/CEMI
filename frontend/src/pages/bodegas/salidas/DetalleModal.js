import React, { useContext, useEffect, useState } from 'react';
import { Modal, Table, Button } from 'react-bootstrap';
import { AppContext } from './Context';
import { getData } from '../../../apiService';

const DetalleModal = () => {
  const { showDetail, setShowDetail, selectedSalida } = useContext(AppContext);
  const [pacienteNombre, setPacienteNombre] = useState('');

  // Cargar nombre del paciente cuando sea tipo paciente
  useEffect(() => {
    const loadPaciente = async () => {
      try {
        if (!showDetail || !selectedSalida || selectedSalida?.tipo_salida !== 'paciente' || !selectedSalida?.admision) {
          setPacienteNombre('');
          return;
        }
        const res = await getData(`admisiones/${selectedSalida.admision}/`);
        const p = res?.data?.paciente || {};
        const nombre = [p.primer_nombre, p.segundo_nombre, p.primer_apellido, p.segundo_apellido, p.apellido_casada].filter(Boolean).join(' ');
        setPacienteNombre(nombre || '');
      } catch (_) {
        setPacienteNombre('');
      }
    };
    loadPaciente();
  }, [showDetail, selectedSalida]);

  if (!showDetail || !selectedSalida) return null;

  const items = selectedSalida.items || [];

  return (
    <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Salida #{selectedSalida.id}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <strong>Fecha:</strong>{' '}
          {selectedSalida.created_at ? new Date(selectedSalida.created_at).toLocaleString() : '-'}
        </p>
        <p><strong>Bodega:</strong> {selectedSalida.bodega ?? '-'}</p>
        <p><strong>Tipo:</strong> {selectedSalida.tipo_salida ?? '-'}</p>
        {selectedSalida.tipo_salida === 'paciente' && (
          <>
            <p><strong>Área:</strong> {selectedSalida.area || '-'}</p>
            <p><strong>Admisión:</strong> {selectedSalida.admision || '-'}{pacienteNombre ? ` – Nombre: ${pacienteNombre}` : ''}</p>
          </>
        )}
        <p><strong>Observaciones:</strong> {selectedSalida.observaciones ?? '-'}</p>
        <p><strong>Creado por:</strong> {selectedSalida.usuario || '-'}</p>
        <p><strong>Aplicado por:</strong> {selectedSalida.aplicado_por || '-'}</p>

        <Table bordered size="sm" className="mt-3">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Descripción</th>
              <th className="text-end">Cantidad</th>
              {selectedSalida.tipo_salida !== 'paciente' && <th className="text-end">Costo</th>}
              {selectedSalida.tipo_salida !== 'paciente' && <th className="text-end">Total</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => {
              const nf = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              return (
                <tr key={`${it.sku ?? idx}`}>
                  <td>{it.sku ?? '-'}</td>
                  <td>{it.descripcion ?? '-'}</td>
                  <td className="text-end">{it.cantidad ?? '-'}</td>
                  {selectedSalida.tipo_salida !== 'paciente' && <td className="text-end">{nf.format(Number(it.costo ?? 0))}</td>}
                  {selectedSalida.tipo_salida !== 'paciente' && <td className="text-end">{nf.format(Number(it.total ?? 0))}</td>}
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={selectedSalida.tipo_salida === 'paciente' ? 3 : 5} className="text-center">Sin items</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDetail(false)}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DetalleModal;
