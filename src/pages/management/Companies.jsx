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

const Companies = () => {
    const [companies, setCompanies] = useState([]);
    const [editCompany, setEditCompany] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [pagination, setPagination] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const location = useLocation();

    // Create Company
    function createCompany(e) {
        e.preventDefault();
        setSubmitting(true);
        const name = document.getElementById('name').value;
        const sector = document.getElementById('sector').value;
        const location = document.getElementById('location').value;
        api.post('/admin/create_company', { name, sector, location })
            .then(response => {
                toast.success(response.data.message);
                getCompanies();
                clearFields();
                setSubmitting(false);
            })
            .catch(error => {
                toast.error(error.response.data.message || 'Failed to create company.');
                setSubmitting(false);
            });
    }

    // Read Companies
    function getCompanies(page = 1, searchValue = '') {
        let url = `/admin/companies?page=${page}`;
        if (searchValue && searchValue.trim() !== '') {
            url += `&search=${encodeURIComponent(searchValue.trim())}`;
        }
        api.get(url)
            .then(response => {
                setCompanies(response.data.data);
                setPagination(response.data);
            })
            .catch(() => {
                toast.error('Failed to fetch companies.');
            });
    }

    // Search Companies
    const handleSearch = (e) => {
        e.preventDefault();
        const value = e.target.search.value.trim();
        const params = new URLSearchParams(location.search);
        params.set('search', value);
        params.set('page', 1);
        window.history.pushState({}, '', `?${params.toString()}`);
        getCompanies(1, value);
    };

    // Edit Company
    function checkEditCompany(id) {
        api.get(`/admin/edit_company/${id}`)
            .then(response => {
                setEditCompany(response.data);
            })
            .catch(error => {
                toast.error(error.response.data.message || 'No information found.');
                setSubmitting(false);
            });
    }

    // Update Company
    function updateCompany(e) {
        e.preventDefault();
        setSubmitting(true);
        const cid = document.getElementById('cid').value;
        const name = document.getElementById('name').value;
        const sector = document.getElementById('sector').value;
        const location = document.getElementById('location').value;
        api.post('/admin/update_company', { cid, name, sector, location })
            .then(response => {
                toast.success(response.data.message);
                setSubmitting(false);
                setEditCompany(null)
                getCompanies();
            })
            .catch(error => {
                toast.error(error.response.data.message || 'Failed to update company.');
                setSubmitting(false);
            });
    }

    // Delete Company
    function handleDelete(){
        api.get(`/admin/delete_company/${deleteId}`)
            .then(response => {
                toast.success(response.data.message);
                getCompanies();
                setDeleteId(null);
            })
            .catch(error => {
                toast.error(error.response.data.message || 'Failed to delete company.');
                setDeleteId(null);
            });
    }

    // Clear Fields
    function clearFields() {
        document.getElementById('name').value = '';
        document.getElementById('sector').value = '';
        document.getElementById('location').value = '';
    }

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const page = params.get('page') || 1;
        const urlSearch = params.get('search') || '';
        getCompanies(page, urlSearch);
        setSearch(urlSearch);
    }, [location.search]);

    return (
        <Layout>
            {!editCompany && (
                <>
                    <h4 className='fw-bold'>Companies</h4>
                    <small className='d-inline-block opacity-75'>Manage registered companies</small>
                </>
            )}

            {editCompany && (
                <>
                    <button onClick={() => setEditCompany(null)} className='btn btn-transparent border-0 p-0 d-flex align-items-center fw-semibold'><IoIosArrowBack className='me-2'/>Turn back</button>
                </>
            )}

            {/* Edit Company */}
            {editCompany && (
                <>
                    <div className="card rounded-4 mt-3">
                        <div className="card-header rounded-4">
                            <span className='fw-semibold'>Update Company <strong>#ID:{editCompany.cid}</strong></span>
                        </div>
                        <div className="card-body">
                            <form method='post' onSubmit={updateCompany}>
                                <input type="hidden" id='cid' name='cid' value={editCompany.cid} required/>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="name" className="form-label">Company Name</label>
                                        <input type="text" defaultValue={editCompany.name} className="form-control rounded-4 shadow-none" id="name" placeholder="Enter company name" />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="sector" className="form-label">Sector</label>
                                        <input type="text" defaultValue={editCompany.sector} className="form-control rounded-4 shadow-none" id="sector" placeholder="Enter sector" />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="location" className="form-label">Location</label>
                                        <input type="text" defaultValue={editCompany.location} className="form-control rounded-4 shadow-none" id="location" placeholder="Enter location" />
                                    </div>
                                    <div className="col-12">
                                        {submitting ? (
                                            <button type='button' className="btn btn-success rounded-4 d-flex align-items-center gap-1" disabled><FaEdit /> Updating...</button>
                                        ) : (
                                            <button type='submit' className="btn btn-success rounded-4 d-flex align-items-center gap-1"><FaEdit /> Update Company</button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {/* Create Company */}
            {!editCompany && (
                <>
                    <div className="card rounded-4 mt-3">
                        <div className="card-header rounded-4">
                            <span className='fw-semibold'>Register new Company</span>
                        </div>
                        <div className="card-body">
                            <form method='post' onSubmit={createCompany}>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="name" className="form-label">Company Name</label>
                                        <input type="text" className="form-control rounded-4 shadow-none" id="name" placeholder="Enter company name" />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="sector" className="form-label">Sector</label>
                                        <input type="text" className="form-control rounded-4 shadow-none" id="sector" placeholder="Enter sector" />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="location" className="form-label">Location</label>
                                        <input type="text" className="form-control rounded-4 shadow-none" id="location" placeholder="Enter location" />
                                    </div>
                                    <div className="col-12">
                                        {submitting ? (
                                            <button type='button' className="btn btn-success rounded-4 d-flex align-items-center gap-1" disabled><MdOutlineAddBox /> Creating...</button>
                                        ) : (
                                            <button type='submit' className="btn btn-success rounded-4 d-flex align-items-center gap-1"><MdOutlineAddBox /> Create Company</button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Companies List */}
                    <div className="card rounded-4 my-4">
                        <div className="card-header rounded-4">
                            <span className='fw-semibold'>Companies List</span>
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
                                            <th className='text-nowrap' scope="col">Company</th>
                                            <th className='text-nowrap' scope="col">Sector</th>
                                            <th className='text-nowrap' scope="col">Location</th>
                                            <th className='text-nowrap' scope="col">Status</th>
                                            <th className='text-end text-nowrap' scope="col">Operations</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {companies.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center">No data to show...</td>
                                            </tr>
                                        ) : (
                                            companies.map((company, index) => (
                                                <tr key={company.cid}>
                                                    <td className='text-nowrap'>{company.cid}</td>
                                                    <td className='text-nowrap'>{company.name}</td>
                                                    <td className='text-nowrap'>{company.sector}</td>
                                                    <td className='text-nowrap'>{company.location}</td>
                                                    <td className='text-nowrap'>{company.status}</td>
                                                    <td className='text-end text-nowrap'>
                                                        <button onClick={() => checkEditCompany(company.cid)} className="btn btn-success btn-sm shadow-sm me-2"><FaEdit size={20} /></button>
                                                        <button onClick={() => setDeleteId(company.cid)} className="btn btn-danger btn-sm shadow-sm"><MdDeleteOutline size={20} /></button>
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

                    {/* Delete Company */}
                    {deleteId && (
                        <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4 px-3" style={{ zIndex: 1050, width: '100%', maxWidth: '500px' }}>
                            <div className="bg-white shadow-lg rounded-4 p-3 border">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>Confirm deletion</strong>
                                        <p className="mb-0 small text-muted">Are you sure you want to delete this ad with <strong>#ID: {deleteId}</strong>?</p>
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

export default Companies