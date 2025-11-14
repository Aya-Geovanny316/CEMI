import React from 'react';
import { Table, Button, Container, Card } from 'react-bootstrap';
import { FcCancel, FcCheckmark } from "react-icons/fc";
import { useMyContext } from './Context';
import { convert_fecha_hora } from '../../utils/formatUtils';

const PrescriptionTable = () => {
    const { data = [], deletePrescription } = useMyContext();

    return (
        <Container className="mt-4">
            <Card className="shadow-sm">
                <Card.Body>
                    <Table striped bordered hover responsive className="text-center">
                        <thead className="table-primary">
                            <tr>
                                <th>#</th>
                                <th>Paciente</th>
                                <th>Medicamentos</th>
                                <th>Dosis</th>
                                <th>Observaciones</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(data) && data.length > 0 ? (
                                data.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{index + 1}</td>
                                        <td>{item.patient}</td>
                                        <td>{item.medications}</td>
                                        <td>{item.dosage}</td>
                                        <td>{item.observations || 'N/A'}</td>
                                        <td>
                                            <Button variant="outline-danger" size="sm" onClick={() => deletePrescription(item.id)}>
                                                <FcCancel />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-muted">No hay recetas registradas</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default PrescriptionTable;
