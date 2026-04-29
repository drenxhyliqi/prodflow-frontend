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

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [editSupplier, setEditSupplier] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [pagination, setPagination] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const location = useLocation();

    // Create Supplier
    function createSupplier(e) {
        e.preventDefault();
        setSubmitting(true);
        const supplier = document.getElementById('supplier').value;
        const phone = document.getElementById('phone').value;
        const location = document.getElementById('location').value;
        api.post('/admin/create_supplier', { supplier, phone, location })
            .then(response => {
                toast.success(response.data.message);
                getSuppliers();
                clearFields();
                setSubmitting(false);
            })
            .catch(error => {
                toast.error(error.response.data.message || 'Failed to create supplier.');
                setSubmitting(false);
            });
    }

    // Read Suppliers
    function getSuppliers(page = 1, searchValue = '') {
        let url = `/admin/suppliers?page=${page}`;
        if (searchValue && searchValue.trim() !== '') {
            url += `&search=${encodeURIComponent(searchValue.trim())}`;
        }
        api.get(url)
            .then(response => {
                setSuppliers(response.data.data);
                setPagination(response.data);
            })
            .catch(() => {
                toast.error('Failed to fetch suppliers.');
            });
    }

    // Search Suppliers
    const handleSearch = (e) => {
        e.preventDefault();
        const value = e.target.search.value.trim();
        const params = new URLSearchParams(location.search);
        params.set('search', value);
        params.set('page', 1);
        window.history.pushState({}, '', `?${params.toString()}`);
        getSuppliers(1, value);
    };

    // Edit Supplier
    function checkEditSupplier(id) {
        api.get(`/admin/edit_supplier/${id}`)
            .then(response => {
                setEditSupplier(response.data);
            })
            .catch(error => {
                toast.error(error.response.data.message || 'No information found.');
                setSubmitting(false);
            });
    }

    // Update Supplier
    function updateSupplier(e) {
        e.preventDefault();
        setSubmitting(true);
        const sid = document.getElementById('sid').value;
        const supplier = document.getElementById('supplier').value;
        const phone = document.getElementById('phone').value;
        const location = document.getElementById('location').value;
        api.post('/admin/update_supplier', { sid, supplier, phone, location })
            .then(response => {
                toast.success(response.data.message);
                setSubmitting(false);
                setEditSupplier(null)
                getSuppliers();
            })
            .catch(error => {
                toast.error(error.response.data.message || 'Failed to update supplier.');
                setSubmitting(false);
            });
    }

    // Delete Supplier
    function handleDelete(){
        api.get(`/admin/delete_supplier/${deleteId}`)
            .then(response => {
                toast.success(response.data.message);
                getSuppliers();
                setDeleteId(null);
            })
            .catch(error => {
                toast.error(error.response.data.message || 'Failed to delete supplier.');
                setDeleteId(null);
            });
    }

    // Clear Fields
    function clearFields() {
        document.getElementById('supplier').value = '';
        document.getElementById('phone').value = '';
        document.getElementById('location').value = '';
    }

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const page = params.get('page') || 1;
        const urlSearch = params.get('search') || '';
        getSuppliers(page, urlSearch);
        setSearch(urlSearch);
    }, [location.search]);

    return (
        <Layout>
            {!editSupplier && (
                <>
                    <h4 className='fw-bold'>Suppliers</h4>
                    <small className='d-inline-block opacity-75'>Manage registered suppliers by company</small>
                </>
            )}

            {editSupplier && (
                <>
                    <button onClick={() => setEditSupplier(null)} className='btn btn-transparent border-0 p-0 d-flex align-items-center fw-semibold'><IoIosArrowBack className='me-2'/>Turn back</button>
                </>
            )}

            {/* Edit Supplier */}
            {editSupplier && (
                <>
                    <div className="card rounded-4 mt-3">
                        <div className="card-header rounded-4">
                            <span className='fw-semibold'>Update Supplier <strong>#ID:{editSupplier.sid}</strong></span>
                        </div>
                        <div className="card-body">
                            <form method='post' onSubmit={updateSupplier}>
                                <input type="hidden" id='sid' name='sid' value={editSupplier.sid} required/>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="supplier" className="form-label">Supplier Name</label>
                                        <input type="text" defaultValue={editSupplier.supplier} className="form-control rounded-4 shadow-none" id="supplier" placeholder="Enter supplier name" />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="phone" className="form-label">Phone</label>
                                        <input type="text" defaultValue={editSupplier.phone} className="form-control rounded-4 shadow-none" id="phone" placeholder="Enter phone" />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="location" className="form-label">Location</label>
                                        <input type="text" defaultValue={editSupplier.location} className="form-control rounded-4 shadow-none" id="location" placeholder="Enter location" />
                                    </div>
                                    <div className="col-12">
                                        {submitting ? (
                                            <button type='button' className="btn btn-success rounded-4 d-flex align-items-center gap-1" disabled><FaEdit /> Updating...</button>
                                        ) : (
                                            <button type='submit' className="btn btn-success rounded-4 d-flex align-items-center gap-1"><FaEdit /> Update Supplier</button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {/* Create Supplier */}
            {!editSupplier && (
                <>
                    <div className="card rounded-4 mt-3">
                        <div className="card-header rounded-4">
                            <span className='fw-semibold'>Register new Supplier</span>
                        </div>
                        <div className="card-body">
                            <form method='post' onSubmit={createSupplier}>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="supplier" className="form-label">Supplier Name</label>
                                        <input type="text" className="form-control rounded-4 shadow-none" id="supplier" placeholder="Enter supplier name" />
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
                                            <button type='submit' className="btn btn-success rounded-4 d-flex align-items-center gap-1"><MdOutlineAddBox /> Create Supplier</button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Suppliers List */}
                    <div className="card rounded-4 my-4">
                        <div className="card-header rounded-4">
                            <span className='fw-semibold'>Suppliers List</span>
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
                                            <th className='text-nowrap' scope="col">Supplier</th>
                                            <th className='text-nowrap' scope="col">Phone</th>
                                            <th className='text-nowrap' scope="col">Location</th>
                                            <th className='text-end text-nowrap' scope="col">Operations</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {suppliers.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="text-center">No data to show...</td>
                                            </tr>
                                        ) : (
                                            suppliers.map((supplier, index) => (
                                                <tr key={supplier.sid}>
                                                    <td className='text-nowrap'>{supplier.sid}</td>
                                                    <td className='text-nowrap'>{supplier.supplier}</td>
                                                    <td className='text-nowrap'>{supplier.phone}</td>
                                                    <td className='text-nowrap'>{supplier.location}</td>
                                                    <td className='text-end text-nowrap'>
                                                        <button onClick={() => checkEditSupplier(supplier.sid)} className="btn btn-success btn-sm shadow-sm me-2"><FaEdit size={20} /></button>
                                                        <button onClick={() => setDeleteId(supplier.sid)} className="btn btn-danger btn-sm shadow-sm"><MdDeleteOutline size={20} /></button>
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

                    {/* Delete Supplier */}
                    {deleteId && (
                        <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4 px-3" style={{ zIndex: 1050, width: '100%', maxWidth: '500px' }}>
                            <div className="bg-white shadow-lg rounded-4 p-3 border">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>Confirm deletion</strong>
                                        <p className="mb-0 small text-muted">Are you sure you want to delete this supplier with <strong>#ID: {deleteId}</strong>?</p>
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

export default Suppliers