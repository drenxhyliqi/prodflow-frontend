import React, { useEffect, useState } from 'react'
import Layout from '../../layouts/Layout'
import api from '../../api/axios'
import { toast } from 'react-toastify';
import { MdOutlineAddBox, MdDeleteOutline, MdWarehouse } from 'react-icons/md';
import Paginate from '../../components/Paginate';
import { FaSearch, FaEdit } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { IoIosArrowBack } from "react-icons/io";

const BRAND = '#035dad';
const inputCls = 'form-control shadow-none rounded-3';
const btnBrand = { backgroundColor: BRAND, color: '#fff', border: 'none' };

const Warehouses = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [editWarehouse, setEditWarehouse] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [pagination, setPagination] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const location = useLocation();

    function createWarehouse(e) {
        e.preventDefault();
        setSubmitting(true);
        const warehouse = document.getElementById('warehouse').value;
        const locationVal = document.getElementById('location').value;
        
        api.post('/admin/create_warehouse', { warehouse, location: locationVal })
            .then(response => {
                toast.success(response.data.message);
                getWarehouses();
                clearFields();
                setSubmitting(false);
            })
            .catch(error => {
                toast.error(error.response.data.message || 'Failed to create warehouse.');
                setSubmitting(false);
            });
    }

    function getWarehouses(page = 1, searchValue = '') {
        let url = `/admin/warehouses?page=${page}`;
        if (searchValue && searchValue.trim() !== '') {
            url += `&search=${encodeURIComponent(searchValue.trim())}`;
        }
        api.get(url)
            .then(response => {
                setWarehouses(response.data.data);
                setPagination(response.data);
            })
            .catch(() => {
                toast.error('Failed to fetch warehouses.');
            });
    }

    const handleSearch = (e) => {
        e.preventDefault();
        const value = e.target.search.value.trim();
        const params = new URLSearchParams(location.search);
        params.set('search', value);
        params.set('page', 1);
        window.history.pushState({}, '', `?${params.toString()}`);
        getWarehouses(1, value);
    };

    function checkEditWarehouse(id) {
        api.get(`/admin/edit_warehouse/${id}`)
            .then(response => setEditWarehouse(response.data))
            .catch(error => {
                toast.error(error.response.data.message || 'No information found.');
                setSubmitting(false);
            });
    }

    function updateWarehouse(e) {
        e.preventDefault();
        setSubmitting(true);
        const wid = document.getElementById('wid').value;
        const warehouse = document.getElementById('warehouse').value;
        const locationVal = document.getElementById('location').value;

        api.post('/admin/update_warehouse', { wid, warehouse, location: locationVal })
            .then(response => {
                toast.success(response.data.message);
                setSubmitting(false);
                setEditWarehouse(null);
                getWarehouses();
            })
            .catch(error => {
                toast.error(error.response.data.message || 'Failed to update warehouse.');
                setSubmitting(false);
            });
    }

    function handleDelete() {
        api.get(`/admin/delete_warehouse/${deleteId}`)
            .then(response => {
                toast.success(response.data.message);
                getWarehouses();
                setDeleteId(null);
            })
            .catch(error => {
                toast.error(error.response.data.message || 'Failed to delete warehouse.');
                setDeleteId(null);
            });
    }

    function clearFields() {
        document.getElementById('warehouse').value = '';
        document.getElementById('location').value = '';
    }

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const page = params.get('page') || 1;
        const urlSearch = params.get('search') || '';
        getWarehouses(page, urlSearch);
        setSearch(urlSearch);
    }, [location.search]);

    /* ── EDIT MODE ─────────────────────────────────────── */
    if (editWarehouse) return (
        <Layout>
            <button
                onClick={() => setEditWarehouse(null)}
                className='btn btn-transparent border-0 p-0 d-flex align-items-center fw-semibold'
            >
                <IoIosArrowBack className='me-2' />Turn back
            </button>

            <div className="card rounded-4 mt-3 border-0 shadow-sm">
                <div className="card-header rounded-top-4 border-0 py-3 px-4" style={{ background: BRAND + '10' }}>
                    <span className='fw-semibold' style={{ color: BRAND }}>
                        Update Warehouse <strong>#ID:{editWarehouse.wid}</strong>
                    </span>
                </div>
                <div className="card-body px-4 pb-4">
                    <form onSubmit={updateWarehouse}>
                        <input type="hidden" id='wid' value={editWarehouse.wid} />
                        <div className="row g-3">
                            <div className="col-12 col-md-6">
                                <label className="form-label fw-semibold small">Warehouse Name</label>
                                <input type="text" defaultValue={editWarehouse.warehouse} className={inputCls} id="warehouse" placeholder="Enter warehouse name" />
                            </div>
                            <div className="col-12 col-md-6">
                                <label className="form-label fw-semibold small">Location</label>
                                <input type="text" defaultValue={editWarehouse.location} className={inputCls} id="location" placeholder="Enter location" />
                            </div>
                            <div className="col-12">
                                <button
                                    type={submitting ? 'button' : 'submit'}
                                    disabled={submitting}
                                    className="btn rounded-3 d-flex align-items-center gap-2 fw-semibold"
                                    style={btnBrand}
                                >
                                    <FaEdit /> {submitting ? 'Updating...' : 'Update Warehouse'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );

    /* ── MAIN VIEW ─────────────────────────────────────── */
    return (
        <Layout>
            {/* Header */}
            <div
                className="d-flex justify-content-between align-items-center flex-wrap gap-3 rounded-4 px-4 py-4 mb-4"
                style={{ background: BRAND + '1a' }}
            >
                <div>
                    <p className="mb-1 fw-semibold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.1em', color: BRAND }}>Stock</p>
                    <h4 className='fw-bold mb-1'>Warehouses Overview</h4>
                    <small className='text-muted'>Manage and track all warehouses.</small>
                </div>
                <button
                    className="btn rounded-pill d-flex align-items-center gap-2 fw-semibold px-4 py-2"
                    style={btnBrand}
                    onClick={() => document.getElementById('create-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                    <MdOutlineAddBox size={18} /> New Warehouse
                </button>
            </div>

            {/* Create Form */}
            <div id="create-form" className="card rounded-4 border-0 shadow-sm mb-4">
                <div className="card-body px-4 pt-4 pb-3">
                    <div className="d-flex align-items-center gap-3 mb-3">
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: BRAND + '18', color: BRAND,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                        }}>
                            <MdWarehouse />
                        </div>
                        <div>
                            <p className="fw-semibold mb-0">Register new Warehouse</p>
                            <small className="text-muted">Fill in the details to add a new warehouse</small>
                        </div>
                    </div>

                    <form onSubmit={createWarehouse}>
                        <div className="row g-3 pb-2">
                            <div className="col-12 col-md-6">
                                <label className="form-label fw-semibold small">Warehouse Name</label>
                                <input type="text" className={inputCls} id="warehouse" placeholder="Enter warehouse name" />
                            </div>
                            <div className="col-12 col-md-6">
                                <label className="form-label fw-semibold small">Location</label>
                                <input type="text" className={inputCls} id="location" placeholder="Enter location" />
                            </div>
                            <div className="col-12">
                                <button
                                    type={submitting ? 'button' : 'submit'}
                                    disabled={submitting}
                                    className="btn rounded-3 d-flex align-items-center gap-2 fw-semibold"
                                    style={btnBrand}
                                >
                                    <MdOutlineAddBox size={18} />
                                    {submitting ? 'Creating...' : 'Create Warehouse'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* List */}
            <div className="card rounded-4 border-0 shadow-sm mb-4">
                <div className="card-body px-4 pt-4">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                        <div>
                            <p className="fw-semibold mb-0">Warehouses List</p>
                            <small className="text-muted">{pagination.total || 0} entries</small>
                        </div>
                        <form onSubmit={handleSearch} style={{ minWidth: 220 }}>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0 rounded-start-3">
                                    <FaSearch className="text-muted" size={13} />
                                </span>
                                <input
                                    type="search" name="search" defaultValue={search}
                                    className="form-control border-start-0 shadow-none rounded-end-3"
                                    placeholder="Search warehouses..."
                                    style={{ fontSize: '0.875rem' }}
                                />
                            </div>
                        </form>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead>
                                <tr className="text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.06em', color: '#6b7280' }}>
                                    <th className="text-nowrap fw-semibold">#</th>
                                    <th className="text-nowrap fw-semibold">Warehouse</th>
                                    <th className="text-nowrap fw-semibold">Location</th>
                                    <th className="text-end text-nowrap fw-semibold">Operations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {warehouses.length === 0 ? (
                                    <tr><td colSpan="4" className="text-center text-muted py-4">No data to show...</td></tr>
                                ) : (
                                    warehouses.map(wh => (
                                        <tr key={wh.wid}>
                                            <td className="text-nowrap text-muted small">#{wh.wid}</td>
                                            <td className="text-nowrap fw-semibold">{wh.warehouse}</td>
                                            <td className="text-nowrap text-muted">{wh.location}</td>
                                            <td className="text-end text-nowrap">
                                                <button onClick={() => checkEditWarehouse(wh.wid)} className="btn btn-sm me-1" style={{ color: BRAND, background: BRAND + '12' }}>
                                                    <FaEdit size={15} />
                                                </button>
                                                <button onClick={() => setDeleteId(wh.wid)} className="btn btn-sm" style={{ color: '#ef4444', background: '#ef444412' }}>
                                                    <MdDeleteOutline size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Paginate data={pagination} />
                </div>
            </div>

            {/* Delete confirmation */}
            {deleteId && (
                <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4 px-3" style={{ zIndex: 1050, width: '100%', maxWidth: '500px' }}>
                    <div className="bg-white shadow-lg rounded-4 p-3 border">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>Confirm deletion</strong>
                                <p className="mb-0 small text-muted">Are you sure you want to delete warehouse <strong>#ID: {deleteId}</strong>?</p>
                            </div>
                            <button className="btn-close ms-2 shadow-none" onClick={() => setDeleteId(null)} />
                        </div>
                        <div className="d-flex justify-content-end mt-3 gap-2">
                            <button className="btn btn-light rounded-3" onClick={() => setDeleteId(null)}>Cancel</button>
                            <button className="btn btn-danger rounded-3" onClick={handleDelete}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}

export default Warehouses;