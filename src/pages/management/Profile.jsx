import React, { useEffect, useState } from 'react'
import Layout from '../../layouts/Layout'
import api from '../../api/axios'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaRegUserCircle } from 'react-icons/fa';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const storedUser = JSON.parse(localStorage.getItem('user'));

    // Read User
    function getUser() {
        api.get('/me')
            .then(response => {
                setUser(response.data);
            })
            .catch(() => {
                toast.error('Failed to fetch user.');
                navigate('/dashboard');
            });
    }

    // Update User
    function updateProfile(e) {
        e.preventDefault();
        setSubmitting(true);
        const user = document.getElementById('user').value;
        const password = document.getElementById('password').value;
        const new_password = document.getElementById('new_password').value;
        api.post('/admin/update_account', { user, password, new_password })
            .then(response => {
                toast.success(response.data.message);
                const updatedUser = {
                    ...storedUser,
                    user: user
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setSubmitting(false);
                clearFields();
                getUser();
            })
            .catch(error => {
                toast.error(error.response.data.message || 'Failed to update account.');
                setSubmitting(false);
            });
    }

    // Clear Fields
    function clearFields() {
        document.getElementById('password').value = '';
        document.getElementById('new_password').value = '';
    }

    useEffect(() => {
        getUser();
    }, []);

    return (
        <Layout>
            {user && (
                <>
                    <h4 className='fw-bold'>My Profile</h4>
                    <small className='d-inline-block opacity-75'>Manage your account</small>

                    {/* Account Details */}
                    <div className="card rounded-4 mt-3">
                        <div className="card-header rounded-4">
                            <span className='fw-semibold'>Update Account Details</span>
                        </div>
                        <div className="card-body">
                            <div className="row g-3 align-items-center">
                                <div className="col-12 col-md-4 col-lg-3 text-center">
                                    <FaRegUserCircle size={100}/>
                                </div>
                                <div className="col-12 col-md-8 col-lg-9">
                                    <form method='post' onSubmit={updateProfile}>
                                        <div className="row g-3">
                                            <div className="col-12 col-md-12 col-lg-6">
                                                <label htmlFor="username" className="form-label">Username</label>
                                                <input type="text" defaultValue={user.username} className="form-control rounded-4 shadow-none" id="username" placeholder="Enter username" disabled/>
                                            </div>
                                            <div className="col-12 col-md-12 col-lg-6">
                                                <label htmlFor="user" className="form-label">Name & Surname</label>
                                                <input type="text" defaultValue={user.user} className="form-control rounded-4 shadow-none" id="user" placeholder="Enter name & surname" />
                                            </div>
                                            <div className="col-12 col-md-12 col-lg-6">
                                                <label htmlFor="password" className="form-label">Actual Password</label>
                                                <input type="password" className="form-control rounded-4 shadow-none" id="password" placeholder="Enter actual password" />
                                            </div>
                                            <div className="col-12 col-md-12 col-lg-6">
                                                <label htmlFor="new_password" className="form-label">New Password</label>
                                                <input type="password" className="form-control rounded-4 shadow-none" id="new_password" placeholder="Enter new password" />
                                            </div>
                                            <div className="col-12">
                                                {submitting ? (
                                                    <button type='button' className="btn btn-success rounded-4 d-flex align-items-center gap-1" disabled><FaEdit /> Updating...</button>
                                                ) : (
                                                    <button type='submit' className="btn btn-success rounded-4 d-flex align-items-center gap-1"><FaEdit /> Update Account</button>
                                                )}
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </Layout>
    )
}

export default Profile
