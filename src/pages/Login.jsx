import React, { useState } from 'react'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Check Login
    const checkLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const username = e.target.username.value;
        const password = e.target.password.value;

        await api.post('/login', { username, password })
            .then(response => {
                toast.success('Login successful');
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                navigate('/dashboard');
            })
            .catch(error => {
                toast.error(error.response?.data?.message || 'Login failed');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <>
            <div className="bg-light min-vh-100">
                <div className="d-flex justify-content-center pt-5">
                    <div className="col-11 col-md-8 col-lg-5">
                        <div className="card shadow-sm rounded-4">
                            <div className="card-header rounded-4 text-center">
                                <h5 className='mb-0 fw-semibold'>Prodflow - Management System</h5>
                            </div>
                            <div className="card-body">
                                <form method="post" onSubmit={e => checkLogin(e)}>
                                    <div className='mt-3'>
                                        <label htmlFor="username">Username</label>
                                        <input type="text" id="username" name="username" placeholder='Enter username' className='form-control rounded-4 shadow-sm'/>
                                    </div>
                                    <div className='mt-3'>
                                        <label htmlFor="password">Password</label>
                                        <input type="password" id="password" name="password" placeholder='Enter password' className='form-control rounded-4 shadow-sm'/>
                                    </div>
                                    {loading ? (
                                        <button className='btn btn-success mt-4 mb-3 rounded-4 shadow-sm w-100' type="button" disabled>
                                            Verifying...
                                        </button>
                                    ) : (
                                        <button className='btn btn-success mt-4 mb-3 rounded-4 shadow-sm w-100' type="submit">Login</button>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login