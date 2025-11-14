import React from 'react';
import '../../../assets/scss/style.scss';
import { useForm } from 'react-hook-form';
import { useComponentContext } from './context';

const SignUp1 = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { sendData } = useComponentContext();

    const onSubmit = async (data) => {
        try {
            await sendData(data); // Envía los datos al contexto
        } catch (error) {
            console.error("Error en el login", error);
        }
    };

    return (
        <>
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
                    <button type="submit" className="btn btn-primary shadow-2 mb-4">Sign up</button>
                </form>
            </div>
        </>
    );
};
export default SignUp1;
