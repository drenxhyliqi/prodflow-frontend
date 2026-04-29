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

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [editClient, setEditClient] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [pagination, setPagination] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const location = useLocation();

    // Create Client
    function createClient(e) {
        e.preventDefault();
        setSubmitting(true);
        const client = document.getElementById('client').value;
        const phone = document.getElementById('phone').value;
        const location = document.getElementById('location').value;
        api.post('/admin/create_client', { client, phone, location })
            .then(response => {
                toast.success(response.data.message);
                getClients();
                clearFields();
                setSubmitting(false);
            })
            .catch(error => {
                toast.error(error.response.data.message || 'Failed to create client.');
                setSubmitting(false);
            });
    }

    // Read Clients
    function getClients(page = 1, searchValue = '') {
        let url = `/admin/clients?page=${page}`;
        if (searchValue && searchValue.trim() !== '') {
            url += `&search=${encodeURIComponent(searchValue.trim())}`;
        }
        api.get(url)
            .then(response => {
                setClients(response.data.data);
                setPagination(response.data);
            })
            .catch(() => {
                toast.error('Failed to fetch clients.');
            });
    }

    // Search Clients
    const handleSearch = (e) => {
        e.preventDefault();
        const value = e.target.search.value.trim();
        const params = new URLSearchParams(location.search);
        params.set('search', value);
        params.set('page', 1);
        window.history.pushState({}, '', `?${params.toString()}`);
        getClients(1, value);
    };

    // Edit Client
    function checkEditClient(id) {
        api.get(`/admin/edit_client/${id}`)
            .then(response => {
                setEditClient(response.data);
            })
            .catch(error => {
                toast.error(error.response.data.message || 'No information found.');
                setSubmitting(false);
            });
    }

    // Update Client
    function updateClient(e) {
        e.preventDefault();
        setSubmitting(true);
        const cid = document.getElementById('cid').value;
        const client = document.getElementById('client').value;
        const phone = document.getElementById('phone').value;
        const location = document.getElementById('location').value;
        api.post('/admin/update_client', { cid, client, phone, location })
            .then(response => {
                toast.success(response.data.message);
                setSubmitting(false);
                setEditClient(null)
                getClients();
            })
            .catch(error => {
                toast.error(error.response.data.message || 'Failed to update client.');
                setSubmitting(false);
            });
    }

    // Delete Client
    function handleDelete(){
        api.get(`/admin/delete_client/${deleteId}`)
            .then(response => {
                toast.success(response.data.message);
                getClients();
                setDeleteId(null);
            })
            .catch(error => {
                toast.error(error.response.data.message || 'Failed to delete client.');
                setDeleteId(null);
            });
    }

    // Clear Fields
    function clearFields() {
        document.getElementById('client').value = '';
        document.getElementById('phone').value = '';
        document.getElementById('location').value = '';
    }

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const page = params.get('page') || 1;
        const urlSearch = params.get('search') || '';
        getClients(page, urlSearch);
        setSearch(urlSearch);
    }, [location.search]);

    return (
        <Layout>
            {!editClient && (
                <>
                    <h4 className='fw-bold'>Clients</h4>
                    <small className='d-inline-block opacity-75'>Manage registered clients by company</small>
                </>
            )}

            {editClient && (
                <>
                    <button onClick={() => setEditClient(null)} className='btn btn-transparent border-0 p-0 d-flex align-items-center fw-semibold'><IoIosArrowBack className='me-2'/>Turn back</button>
                </>
            )}

            {/* Edit Client */}
            {editClient && (
                <>
                    <div className="card rounded-4 mt-3">
                        <div className="card-header rounded-4">
                            <span className='fw-semibold'>Update Client <strong>#ID:{editClient.cid}</strong></span>
                        </div>
                        <div className="card-body">
                            <form method='post' onSubmit={updateClient}>
                                <input type="hidden" id='cid' name='cid' value={editClient.cid} required/>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="client" className="form-label">Client Name</label>
                                        <input type="text" defaultValue={editClient.client} className="form-control rounded-4 shadow-none" id="client" placeholder="Enter client name" />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="phone" className="form-label">Phone</label>
                                        <input type="text" defaultValue={editClient.phone} className="form-control rounded-4 shadow-none" id="phone" placeholder="Enter phone" />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="location" className="form-label">Location</label>
                                        <input type="text" defaultValue={editClient.location} className="form-control rounded-4 shadow-none" id="location" placeholder="Enter location" />
                                    </div>
                                    <div className="col-12">
                                        {submitting ? (
                                            <button type='button' className="btn btn-success rounded-4 d-flex align-items-center gap-1" disabled><FaEdit /> Updating...</button>
                                        ) : (
                                            <button type='submit' className="btn btn-success rounded-4 d-flex align-items-center gap-1"><FaEdit /> Update Client</button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {/* Create Client */}
            {!editClient && (
                <>
                    <div className="card rounded-4 mt-3">
                        <div className="card-header rounded-4">
                            <span className='fw-semibold'>Register new Client</span>
                        </div>
                        <div className="card-body">
                            <form method='post' onSubmit={createClient}>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="client" className="form-label">Client Name</label>
                                        <input type="text" className="form-control rounded-4 shadow-none" id="client" placeholder="Enter client name" />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="phone" className="form-label">Phone</label>
                                        <input type="text" className="form-control rounded-4 shadow-none" id="phone" placeholder="Enter phone" />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="location" className="form-label">Location</label>
                                        <input type="text" className="form-control rounded-4 shadow-none" id="location" placeholder="Enter location" />
                                    </div>
                                    <div className="col-12">
                                        {submitting ? (
                                            <button type='button' className="btn btn-success rounded-4 d-flex align-items-center gap-1" disabled><MdOutlineAddBox /> Creating...</button>
                                        ) : (
                                            <button type='submit' className="btn btn-success rounded-4 d-flex align-items-center gap-1"><MdOutlineAddBox /> Create Client</button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Clients List */}
                    <div className="card rounded-4 my-4">
                        <div className="card-header rounded-4">
                            <span className='fw-semibold'>Clients List</span>
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
                                            <th className='text-nowrap' scope="col">Client</th>
                                            <th className='text-nowrap' scope="col">Phone</th>
                                            <th className='text-nowrap' scope="col">Location</th>
                                            <th className='text-end text-nowrap' scope="col">Operations</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clients.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="text-center">No data to show...</td>
                                            </tr>
                                        ) : (
                                            clients.map((client, index) => (
                                                <tr key={client.cid}>
                                                    <td className='text-nowrap'>{client.cid}</td>
                                                    <td className='text-nowrap'>{client.client}</td>
                                                    <td className='text-nowrap'>{client.phone}</td>
                                                    <td className='text-nowrap'>{client.location}</td>
                                                    <td className='text-end text-nowrap'>
                                                        <button onClick={() => checkEditClient(client.cid)} className="btn btn-success btn-sm shadow-sm me-2"><FaEdit size={20} /></button>
                                                        <button onClick={() => setDeleteId(client.cid)} className="btn btn-danger btn-sm shadow-sm"><MdDeleteOutline size={20} /></button>
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

                    {/* Delete Client */}
                    {deleteId && (
                        <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4 px-3" style={{ zIndex: 1050, width: '100%', maxWidth: '500px' }}>
                            <div className="bg-white shadow-lg rounded-4 p-3 border">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>Confirm deletion</strong>
                                        <p className="mb-0 small text-muted">Are you sure you want to delete this client with <strong>#ID: {deleteId}</strong>?</p>
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

export default Clients