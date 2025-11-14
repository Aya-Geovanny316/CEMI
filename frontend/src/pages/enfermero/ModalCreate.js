import React from 'react'
import { Modal } from 'react-bootstrap';
import { useMyContext } from './Context';
import { useForm } from 'react-hook-form';

const ModalCreate = () => {

    const { register, handleSubmit, formState: { errors } } = useForm();
    const { show, showModal, sendData } = useMyContext();

    const onSubmit = async (data) => {
        try {
            await sendData(data); // Envía los datos al contexto
        } catch (error) {
            console.error("Error en el login", error);
        }
    };

    return (
        <div>
            <Modal
                show={show}
                onHide={showModal}
                centered
            >
                <Modal.Body>
                    <>
                        {/* <Breadcrumb />
            <div className="auth-wrapper">
                <div className="auth-content">
                 <div className="auth-bg">
                        <span className="r" />
                        <span className="r s" />
                        <span className="r s" />
                        <span className="r" />
                    </div> */}
                        {/* <div className="card">
                        
                    </div> */}
                        <div className="card-body text-center">
                            <div className="mb-4">
                                <i className="feather icon-user-plus auth-icon" />
                            </div>
                            <h3 className="mb-4">Sign up</h3>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="input-group mb-3">
                                    <input type="text" className="form-control" placeholder="Username" {...register("username", { required: "Username is required" })} />
                                    {errors.username && <p className="text-danger">{errors.username.message}</p>}
                                </div>
                                <div className="input-group mb-3">
                                    <input type="email" className="form-control" placeholder="Email" {...register("email", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email format" } })} />
                                    {errors.email && <p className="text-danger">{errors.email.message}</p>}
                                </div>
                                <div className="input-group mb-4">
                                    <input type="password" className="form-control" placeholder="Password" {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })} />
                                    {errors.password && <p className="text-danger">{errors.password.message}</p>}
                                </div>
                                {/* <div className="form-group text-left">
                                    <div className="checkbox checkbox-fill d-inline">
                                        <input type="checkbox" id="checkbox-fill-2" {...register("newsletter")} />
                                        <label htmlFor="checkbox-fill-2" className="cr">Send me the <a href="#"> Newsletter</a> weekly.</label>
                                    </div>
                                </div> */}
                                <button type="submit" className="btn btn-primary shadow-2 mb-4">Sign up</button>
                            </form>
                            {/* <p className="mb-0 text-muted">Already have an account? <NavLink to="/auth/signin-1">Login</NavLink></p> */}
                        </div>
                        {/* </div>
            </div> */}
                    </>
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default ModalCreate