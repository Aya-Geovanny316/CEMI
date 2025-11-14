import React, { useEffect, useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useMyContext } from './Context';

const PrescriptionForm = () => {
    const { register, handleSubmit, formState: { errors }, reset, setValue, getValues } = useForm();
    const { setData } = useMyContext();
    const [currentDateTime, setCurrentDateTime] = useState('');
    const [isPatientLocked, setIsPatientLocked] = useState(false);

    useEffect(() => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        const localDateTime = now.toISOString().slice(0, 16);
        setCurrentDateTime(localDateTime);
        setValue("date", localDateTime);
    }, [setValue]);

    const onSubmit = async (formData) => {
        const newData = {
            id: Date.now(),
            patient: formData.patient,
            date: formData.date,
            medications: formData.medications,
            quantity: formData.quantity,
            dosage: formData.dosage,
            observations: formData.observations || ""
        };

        setData((prevData) => [...prevData, newData]);

        try {
            // await sendData(newData);
            const patientName = getValues("patient"); // Guardamos el paciente antes de resetear
            reset({
                patient: patientName, // Mantiene el paciente bloqueado
                date: currentDateTime, // Mantiene la fecha actual
                medications: "",
                quantity: "",
                dosage: "",
                observations: "",
            });
            setIsPatientLocked(true); // Bloqueamos el campo paciente
        } catch (error) {
            console.error("Error al guardar la receta", error);
        }
    };

    const handleResetForm = () => {
        reset({
            patient: "",
            date: currentDateTime,
            medications: "",
            quantity: "",
            dosage: "",
            observations: "",
        });
        setIsPatientLocked(false); // Desbloquear el campo paciente
    };

    return (
        <Container fluid className="mt-3">
            <h4 className="text-center mb-3">Registrar Receta Médica</h4>
            <Form onSubmit={handleSubmit(onSubmit)} className="p-3 border rounded shadow-sm">
                <Row className="mb-2">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Paciente</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nombre del paciente"
                                {...register("patient", { required: "El nombre es obligatorio" })}
                                disabled={isPatientLocked}
                                readOnly={isPatientLocked}
                            />
                            {errors.patient && <p className="text-danger small">{errors.patient.message}</p>}
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Fecha y Hora</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                {...register("date", { required: "La fecha es obligatoria" })}
                                defaultValue={currentDateTime}
                                disabled
                                readOnly
                            />
                            {errors.date && <p className="text-danger small">{errors.date.message}</p>}
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="mb-2">
                    <Form.Label>Medicamentos</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Ejemplo: Paracetamol 500mg"
                        {...register("medications", { required: "Debe ingresar al menos un medicamento" })}
                    />
                    {errors.medications && <p className="text-danger small">{errors.medications.message}</p>}
                </Form.Group>

                <Row className="mb-2">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Cantidad</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Cantidad de blisters, frascos, etc."
                                {...register("quantity", {
                                    required: "Debe ingresar la cantidad",
                                    min: { value: 1, message: "La cantidad debe ser mayor a 0" }
                                })}
                            />
                            {errors.quantity && <p className="text-danger small">{errors.quantity.message}</p>}
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Dosis</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ejemplo: 1 tableta cada 8 horas"
                                {...register("dosage", { required: "La dosis es obligatoria" })}
                            />
                            {errors.dosage && <p className="text-danger small">{errors.dosage.message}</p>}
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="mb-2">
                    <Form.Label>Observaciones</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={1}
                        placeholder="Notas adicionales (opcional)"
                        {...register("observations")}
                    />
                </Form.Group>

                <div className="text-center">
                    <Button variant="primary" type="submit" className="me-2">
                        Agregar medicamento
                    </Button>
                    <Button variant="secondary" type="button" onClick={handleResetForm}>
                        Revertir
                    </Button>
                </div>
            </Form>
        </Container>
    );
};

export default PrescriptionForm;
