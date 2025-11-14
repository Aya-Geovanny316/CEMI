import React, { useMemo, useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import { usePreciosContext } from './Context';

const ListadoPrecios = () => {
    const { skus, abrirModalEditarPrecios, seguros, precios } = usePreciosContext();
    const [fCodigo, setFCodigo] = useState('');
    const [fNombre, setFNombre] = useState('');
    const [fBarcode, setFBarcode] = useState('');

    const filas = useMemo(() => {
        const rows = Array.isArray(skus) ? skus : [];
        const t = (s) => (String(s || '')).toLowerCase();
        const filtered = rows.filter((r) => (
            (!fCodigo || t(r.codigo_sku).includes(t(fCodigo))) &&
            (!fNombre || t(r.nombre || r.descripcion).includes(t(fNombre))) &&
            (!fBarcode || t(r.barcode).includes(t(fBarcode)))
        ));
        return [...filtered].sort((a,b)=> String(a.codigo_sku||'').localeCompare(String(b.codigo_sku||'')));
    }, [skus, fCodigo, fNombre, fBarcode]);

    return (
        <div className="mt-4">
            <h5 className="mb-3">Listado de SKUs</h5>
            <div className="table-responsive">
                <div className="row g-2 mb-2">
                    <div className="col-md-3"><input className="form-control" placeholder="Código" value={fCodigo} onChange={(e)=>setFCodigo(e.target.value)} /></div>
                    <div className="col-md-3"><input className="form-control" placeholder="Nombre" value={fNombre} onChange={(e)=>setFNombre(e.target.value)} /></div>
                    <div className="col-md-3"><input className="form-control" placeholder="Código de barras" value={fBarcode} onChange={(e)=>setFBarcode(e.target.value)} /></div>
                </div>
                <Table bordered hover size="sm">
                    <thead className="table-primary text-dark">
                        <tr>
                            <th>Nombre</th>
                            <th>Código SKU</th>
                            <th>Acciones</th>
                            {seguros.map((s) => (
                                <th key={s.id}>{s.nombre}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filas.map((sku, idx) => (
                            <tr key={idx}>
                                <td>{sku.nombre}</td>
                                <td>{sku.codigo_sku}</td>
                                <td className="text-center">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => abrirModalEditarPrecios(sku)}
                                    >
                                        Editar precios
                                    </Button>
                                </td>
                                {seguros.map((s) => {
                                    const precio = precios.find(p => p.sku === sku.id && p.seguro_id === s.id);
                                    return (
                                        <td key={s.id} className="text-center">
                                            {precio ? `Q${precio.precio.toFixed(2)}` : '—'}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>

                </Table>
            </div>
        </div>
    );
};

export default ListadoPrecios;
