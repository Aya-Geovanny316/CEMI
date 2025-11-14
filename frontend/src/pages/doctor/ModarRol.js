import React, { useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useMyContext } from './Context';
import { useForm } from 'react-hook-form';

const ModalRol = () => {
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();
    const { showRol, showModalRol, assignRol, username, getRol } = useMyContext();

    // Sincroniza el valor del input con el estado de username
    useEffect(() => {
        setValue("username", username);
    }, [username, setValue]);

    const onSubmit = async (data) => {
        try {
            await assignRol(data); // Envía los datos al contexto
            //console.log(data)
        } catch (error) {
            console.error("Error en el login", error);
        }
    };

    return (
        <Modal
            show={showRol}
            onHide={showModalRol}
            centered
        >
            <Modal.Body>
                <div className="card-body text-center">
                    <h3 className="mb-4">Assign Rol</h3>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="input-group mb-3">
                            <input
                                type="text"
                                className="form-control"
                                {...register("username", { required: "Username is required" })}
                                disabled
                            />
                            {errors.username && <p className="text-danger">{errors.username.message}</p>}
                        </div>
                        <div className="input-group mb-3">
                            <select className="form-control" {...register("role", { required: "Role is required" })}>
                                <option value="">Select Role</option>
                                {getRol && getRol.map((item) => ( // Asegurar que getRol no sea undefined
                                    <option key={item.name} value={item.name}>{item.name}</option>
                                ))}
                            </select>
                            {errors.role && <p className="text-danger">{errors.role.message}</p>}
                        </div>
                        <button type="submit" className="btn btn-primary shadow-2 mb-4">Asignar</button>
                    </form>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default ModalRol;
