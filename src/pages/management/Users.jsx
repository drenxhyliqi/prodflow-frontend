import React, { useEffect, useState } from 'react'
import Layout from '../../layouts/Layout'
import api from '../../api/axios'
import { toast } from 'react-toastify';
import { MdOutlineAddBox } from 'react-icons/md';
import Paginate from '../../components/Paginate';
import { FaSearch } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaEdit } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import { MdDeleteOutline } from "react-icons/md";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [editUser, setEditUser] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [pagination, setPagination] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const location = useLocation();

    // Create User
    function createUser(e) {
        e.preventDefault();
        setSubmitting(true);
        const user = document.getElementById('user').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const company_id = document.getElementById('company_id').value;
        const role = document.getElementById('role').value;
        api.post('/admin/create_user', { user, username, password, company_id, role })
            .then(response => {
                toast.success(response.data.message);
                getUsers();
                clearFields();
                setSubmitting(false);
            })
            .catch(error => {
                toast.error(error.response.data.message || 'Failed to create user.');
                setSubmitting(false);
            });
    }

    // Read Companies
    function getCompanies() {
        let url = `/admin/all_companies`;
        api.get(url)
            .then(response => {
                setCompanies(response.data);
            })
            .catch(() => {
                toast.error('Failed to fetch companies.');
            });
    }

    // Read Users
    function getUsers(page = 1, searchValue = '') {
        let url = `/admin/users?page=${page}`;
        if (searchValue && searchValue.trim() !== '') {
            url += `&search=${encodeURIComponent(searchValue.trim())}`;
        }
        api.get(url)
            .then(response => {
                setUsers(response.data.data);
                setPagination(response.data);
            })
            .catch(() => {
                toast.error('Failed to fetch users.');
            });
    }

    // Search Users
    const handleSearch = (e) => {
        e.preventDefault();
        const value = e.target.search.value.trim();
        const params = new URLSearchParams(location.search);
        params.set('search', value);
        params.set('page', 1);
        window.history.pushState({}, '', `?${params.toString()}`);
        getUsers(1, value);
    };

    // Edit User
    function checkEditUser(id) {
        api.get(`/admin/edit_user/${id}`)
            .then(response => {
                setEditUser(response.data);
            })
            .catch(error => {
                toast.error(error.response.data.message || 'No information found.');
                setSubmitting(false);
            });
    }

    // Update User
    function updateUser(e) {
        e.preventDefault();
        setSubmitting(true);
        const uid = document.getElementById('uid').value;
        const user = document.getElementById('user').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const company_id = document.getElementById('company_id').value;
        const role = document.getElementById('role').value;
        api.post('/admin/update_user', { uid, user, username, password, company_id, role })
            .then(response => {
                toast.success(response.data.message);
                setSubmitting(false);
                setEditUser(null)
                getUsers();
            })
            .catch(error => {
                toast.error(error.response.data.message || 'Failed to update user.');
                setSubmitting(false);
            });
    }

    // Delete User
    function handleDelete(){
        api.get(`/admin/delete_user/${deleteId}`)
            .then(response => {
                toast.success(response.data.message);
                getUsers();
                setDeleteId(null);
            })
            .catch(error => {
                toast.error(error.response.data.message || 'Failed to delete user.');
                setDeleteId(null);
            });
    }

    // Clear Fields
    function clearFields() {
        document.getElementById('user').value = '';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('company_id').value = '';
    }

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const page = params.get('page') || 1;
        const urlSearch = params.get('search') || '';
        getUsers(page, urlSearch);
        getCompanies();
        setSearch(urlSearch);
    }, [location.search]);

    return (
        <Layout>
            {!editUser && (
                <>
                    <h4 className='fw-bold'>Users</h4>
                    <small className='d-inline-block opacity-75'>Manage registered users</small>
                </>
            )}

            {editUser && (
                <>
                    <button onClick={() => setEditUser(null)} className='btn btn-transparent border-0 p-0 d-flex align-items-center fw-semibold'><IoIosArrowBack className='me-2'/>Turn back</button>
                </>
            )}

            {/* Edit User */}
            {editUser && (
                <>
                    <div className="card rounded-4 mt-3">
                        <div className="card-header rounded-4">
                            <span className='fw-semibold'>Update User <strong>#ID:{editUser.uid}</strong></span>
                        </div>
                        <div className="card-body">
                            <form method='post' onSubmit={updateUser}>
                                <input type="hidden" id='uid' name='uid' value={editUser.uid} required/>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="user" className="form-label">Name & Surname</label>
                                        <input type="text" defaultValue={editUser.user} className="form-control rounded-4 shadow-none" id="user" placeholder="Enter name and surname" />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="username" className="form-label">Username</label>
                                        <input type="text" defaultValue={editUser.username} className="form-control rounded-4 shadow-none" id="username" placeholder="Enter username" />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="password" className="form-label">Password</label>
                                        <input type="password" className="form-control rounded-4 shadow-none" id="password" placeholder="Enter password" />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="company_id" className="form-label">Company</label>
                                        <select name="company_id" defaultValue={editUser.company_id} id="company_id" className="form-control rounded-4 shadow-none">
                                            {companies.length === 0 ? (
                                                <option value="">-- 0 Companies --</option>
                                            ) : (
                                                <>
                                                    <option value="">-- Select Company --</option>
                                                    {companies.map((c, index) => (
                                                        <option key={index} value={c.cid}>
                                                            {c.name}
                                                        </option>
                                                    ))}
                                                </>
                                            )}
                                        </select>
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="role" className="form-label">Role</label>
                                        <select name="role" defaultValue={editUser.role} id="role" className="form-control rounded-4 shadow-none">
                                            <option value="admin">Admin</option>
                                            <option value="manager">Manager</option>
                                            <option value="employee">Employee</option>
                                        </select>
                                    </div>
                                    <div className="col-12">
                                        {submitting ? (
                                            <button type='button' className="btn btn-success rounded-4 d-flex align-items-center gap-1" disabled><FaEdit /> Updating...</button>
                                        ) : (
                                            <button type='submit' className="btn btn-success rounded-4 d-flex align-items-center gap-1"><FaEdit /> Update User</button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {/* Create User */}
            {!editUser && (
                <>
                    <div className="card rounded-4 mt-3">
                        <div className="card-header rounded-4">
                            <span className='fw-semibold'>Register new User</span>
                        </div>
                        <div className="card-body">
                            <form method='post' onSubmit={createUser}>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="user" className="form-label">Name & Surname</label>
                                        <input type="text" className="form-control rounded-4 shadow-none" id="user" placeholder="Enter name and surname" />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="username" className="form-label">Username</label>
                                        <input type="text" className="form-control rounded-4 shadow-none" id="username" placeholder="Enter username" />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="password" className="form-label">Password</label>
                                        <input type="password" className="form-control rounded-4 shadow-none" id="password" placeholder="Enter password" />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="company_id" className="form-label">Company</label>
                                        <select name="company_id" id="company_id" className="form-control rounded-4 shadow-none">
                                            {companies.length === 0 ? (
                                                <option value="">-- 0 Companies --</option>
                                            ) : (
                                                <>
                                                    <option value="">-- Select Company --</option>
                                                    {companies.map((c, index) => (
                                                        <option key={index} value={c.cid}>
                                                            {c.name}
                                                        </option>
                                                    ))}
                                                </>
                                            )}
                                        </select>
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="role" className="form-label">Role</label>
                                        <select name="role" id="role" className="form-control rounded-4 shadow-none">
                                            <option value="admin">Admin</option>
                                            <option value="manager">Manager</option>
                                            <option value="employee">Employee</option>
                                        </select>
                                    </div>
                                    <div className="col-12">
                                        {submitting ? (
                                            <button type='button' className="btn btn-success rounded-4 d-flex align-items-center gap-1" disabled><MdOutlineAddBox /> Creating...</button>
                                        ) : (
                                            <button type='submit' className="btn btn-success rounded-4 d-flex align-items-center gap-1"><MdOutlineAddBox /> Create User</button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Users List */}
                    <div className="card rounded-4 my-4">
                        <div className="card-header rounded-4">
                            <span className='fw-semibold'>Users List</span>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <form onSubmit={handleSearch}>
                                    <div className="input-group mb-3">
                                        <input type="search" name='search' defaultValue={search} className="form-control rounded-start-4 shadow-none" placeholder="Search..." aria-describedby="button-addon2"/>
                                        <button className="btn btn-primary rounded-end-4" type="submit" id="button-addon2"><FaSearch /></button>
                                    </div>
                                </form>
                            </div>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th className='text-nowrap' scope="col">#</th>
                                            <th className='text-nowrap' scope="col">User</th>
                                            <th className='text-nowrap' scope="col">Username</th>
                                            <th className='text-nowrap' scope="col">Company</th>
                                            <th className='text-nowrap' scope="col">Role</th>
                                            <th className='text-end text-nowrap' scope="col">Operations</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center">No data to show...</td>
                                            </tr>
                                        ) : (
                                            users.map((user, index) => (
                                                <tr key={user.uid}>
                                                    <td className='text-nowrap'>{user.uid}</td>
                                                    <td className='text-nowrap'>{user.user}</td>
                                                    <td className='text-nowrap'>{user.username}</td>
                                                    <td className='text-nowrap'>{user.company}</td>
                                                    <td className='text-nowrap text-capitalize'>{user.role}</td>
                                                    <td className='text-end text-nowrap'>
                                                        <button onClick={() => checkEditUser(user.uid)} className="btn btn-success btn-sm shadow-sm me-2"><FaEdit size={20} /></button>
                                                        <button onClick={() => setDeleteId(user.uid)} className="btn btn-danger btn-sm shadow-sm"><MdDeleteOutline size={20} /></button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <Paginate data={pagination} />
                        </div>
                    </div>

                    {/* Delete User */}
                    {deleteId && (
                        <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4 px-3" style={{ zIndex: 1050, width: '100%', maxWidth: '500px' }}>
                            <div className="bg-white shadow-lg rounded-4 p-3 border">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>Confirm deletion</strong>
                                        <p className="mb-0 small text-muted">Are you sure you want to delete this user with <strong>#ID: {deleteId}</strong>?</p>
                                    </div>
                                    <button className="btn-close ms-2 shadow-none" onClick={() => setDeleteId(null)}></button>
                                </div>
                                <div className="d-flex justify-content-end mt-3">
                                    <button className="btn btn-light me-2" onClick={() => setDeleteId(null)}>Cancel</button>
                                    <button className="btn btn-danger" onClick={handleDelete}>Confirm</button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </Layout>
    )
}

export default Users