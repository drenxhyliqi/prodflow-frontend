import React, { useEffect, useState } from 'react';
import Layout from '../../layouts/Layout';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { MdOutlineAddBox, MdDeleteOutline } from 'react-icons/md';
import Paginate from '../../components/Paginate';
import { FaSearch, FaEdit, FaCalendarAlt, FaUserTie } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { IoIosArrowBack } from "react-icons/io";

const BRAND = '#035dad';
const inputCls = 'form-control shadow-none rounded-3';
const btnBrand = { backgroundColor: BRAND, color: '#fff', border: 'none' };

const Contracts = () => {
    const [contracts, setContracts] = useState([]);
    const [staff, setStaff] = useState([]);
    const [editContract, setEditContract] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [pagination, setPagination] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const location = useLocation();

    const getContracts = (page = 1, searchValue = '') => {
        let url = `/admin/contracts?page=${page}`;
        if (searchValue && searchValue.trim() !== '') {
            url += `&search=${encodeURIComponent(searchValue.trim())}`;
        }
        api.get(url)
            .then(res => {
                setContracts(res.data.data);
                setPagination(res.data);
            })
            .catch(() => toast.error('Failed to fetch contracts.'));
    };

    const getStaff = () => {
        api.get('/admin/staff')
            .then(res => setStaff(res.data.data || res.data))
            .catch(() => toast.error('Failed to fetch staff.'));
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const page = params.get('page') || 1;
        const urlSearch = params.get('search') || '';
        getContracts(page, urlSearch);
        getStaff();
        setSearch(urlSearch);
    }, [location.search]);


    const createContract = (e) => {
        e.preventDefault();
        setSubmitting(true);
        const data = {
            employee_id: document.getElementById('employee_id').value,
            start_date: document.getElementById('start_date').value,
            end_date: document.getElementById('end_date').value,
            status: document.getElementById('status').value,
            company_id: 1
        };

        api.post('/admin/create_contract', data)
            .then(res => {
                toast.success(res.data.message);
                getContracts();
                e.target.reset();
                setSubmitting(false);
            })
            .catch(err => {
                toast.error(err.response?.data?.message || 'Error.');
                setSubmitting(false);
            });
    };

    const checkEditContract = (id) => {
        api.get(`/admin/edit_contract/${id}`)
            .then(res => setEditContract(res.data))
            .catch(() => toast.error('No info found.'));
    };

    const updateContract = (e) => {
        e.preventDefault();
        setSubmitting(true);
        const data = {
            cid: document.getElementById('cid').value,
            employee_id: document.getElementById('employee_id_edit').value,
            start_date: document.getElementById('start_date_edit').value,
            end_date: document.getElementById('end_date_edit').value,
            status: document.getElementById('status_edit').value
        };

        api.post('/admin/update_contract', data)
            .then(res => {
                toast.success(res.data.message);
                setEditContract(null);
                getContracts();
                setSubmitting(false);
            })
            .catch(() => setSubmitting(false));
    };

    const handleDelete = () => {
        api.get(`/admin/delete_contract/${deleteId}`)
            .then(res => {
                toast.success(res.data.message);
                getContracts();
                setDeleteId(null);
            })
            .catch(() => {
                toast.error('Delete failed');
                setDeleteId(null);
            });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const value = e.target.search.value.trim();
        const params = new URLSearchParams(location.search);
        params.set('search', value);
        params.set('page', 1);
        window.history.pushState({}, '', `?${params.toString()}`);
        getContracts(1, value);
    };

    const statusBadge = (status) => {
        const isActive = status?.toLowerCase() === 'active';
        return (
            <span style={{
                padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                background: isActive ? '#10b98120' : '#ef444420',
                color: isActive ? '#10b981' : '#ef4444'
            }}>
                {status}
            </span>
        );
    };

    /* ── EDIT VIEW ─────────────────────────────────────── */
    if (editContract) return (
        <Layout>
            <button onClick={() => setEditContract(null)} className='btn btn-transparent border-0 p-0 d-flex align-items-center fw-semibold mb-3'>
                <IoIosArrowBack className='me-2' /> Turn back
            </button>
            <div className="card rounded-4 border-0 shadow-sm">
                <div className="card-header py-3 px-4" style={{ background: BRAND + '10' }}>
                    <span className='fw-semibold' style={{ color: BRAND }}>Update Contract <strong>#ID:{editContract.cid}</strong></span>
                </div>
                <div className="card-body p-4">
                    <form onSubmit={updateContract}>
                        <input type="hidden" id="cid" value={editContract.cid} />
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label small fw-semibold">Employee</label>
                                <select id="employee_id_edit" defaultValue={editContract.employee_id} className={inputCls}>
                                    {staff.map(s => <option key={s.sid} value={s.sid}>{s.name} {s.surname}</option>)}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-semibold">Start Date</label>
                                <input type="date" id="start_date_edit" defaultValue={editContract.start_date} className={inputCls} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-semibold">End Date</label>
                                <input type="date" id="end_date_edit" defaultValue={editContract.end_date} className={inputCls} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-semibold">Status</label>
                                <select id="status_edit" defaultValue={editContract.status} className={inputCls}>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="col-12 mt-4">
                                <button disabled={submitting} className="btn rounded-3 fw-semibold px-4" style={btnBrand}>
                                    {submitting ? 'Updating...' : 'Update Contract'}
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
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 rounded-4 px-4 py-4 mb-4" style={{ background: BRAND + '1a' }}>
                <div>
                    <p className="mb-1 fw-semibold text-uppercase" style={{ fontSize: '0.68rem', color: BRAND, letterSpacing: '1px' }}>HR Management</p>
                    <h4 className='fw-bold mb-1'>Contracts Overview</h4>
                    <small className='text-muted'>Manage and track employee contracts.</small>
                </div>
                <button className="btn rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2" style={btnBrand} onClick={() => document.getElementById('create-form')?.scrollIntoView({ behavior: 'smooth' })}>
                    <MdOutlineAddBox size={18} /> New Contract
                </button>
            </div>

            {/* Create Form */}
            <div id="create-form" className="card rounded-4 border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3 mb-3">
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: BRAND + '18', color: BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FaCalendarAlt />
                        </div>
                        <p className="fw-semibold mb-0">Register new Contract</p>
                    </div>
                    <form onSubmit={createContract}>
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label small fw-semibold">Employee</label>
                                <select id="employee_id" className={inputCls} required>
                                    <option value="">Select employee</option>
                                    {staff.map(s => <option key={s.sid} value={s.sid}>{s.name} {s.surname}</option>)}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-semibold">Start Date</label>
                                <input type="date" id="start_date" className={inputCls} required />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-semibold">End Date</label>
                                <input type="date" id="end_date" className={inputCls} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-semibold">Status</label>
                                <select id="status" className={inputCls}>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="col-12 mt-3">
                                <button disabled={submitting} className="btn rounded-3 fw-semibold" style={btnBrand}>
                                    {submitting ? 'Creating...' : 'Create Contract'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* List */}
            <div className="card rounded-4 border-0 shadow-sm">
                <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h6 className='fw-bold mb-0'>Contracts List</h6>
                        <form onSubmit={handleSearch} style={{ minWidth: '250px' }}>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0 rounded-start-3"><FaSearch className='text-muted' size={13} /></span>
                                <input type="search" name="search" defaultValue={search} className="form-control border-start-0 shadow-none rounded-end-3" placeholder="Search..." />
                            </div>
                        </form>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="text-uppercase" style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                                <tr>
                                    <th>#</th>
                                    <th>Employee</th>
                                    <th>Period</th>
                                    <th>Status</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contracts.map(c => (
                                    <tr key={c.cid}>
                                        <td className='text-muted small'>#{c.cid}</td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className='rounded-circle bg-light d-flex align-items-center justify-content-center' style={{ width: 30, height: 30 }}><FaUserTie size={12} /></div>
                                                <span className='fw-semibold'>{c.employee ? `${c.employee.name} ${c.employee.surname}` : `ID: ${c.employee_id}`}</span>
                                            </div>
                                        </td>
                                        <td><small className='text-muted'>{c.start_date} <span className='mx-1'>→</span> {c.end_date || 'Present'}</small></td>
                                        <td>{statusBadge(c.status)}</td>
                                        <td className="text-end">
                                            <button onClick={() => checkEditContract(c.cid)} className="btn btn-sm me-1" style={{ color: BRAND, background: BRAND + '12' }}><FaEdit /></button>
                                            <button onClick={() => setDeleteId(c.cid)} className="btn btn-sm" style={{ color: '#ef4444', background: '#ef444412' }}><MdDeleteOutline size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Paginate data={pagination} />
                </div>
            </div>

            {/* Delete Modal Confirmation Style */}
            {deleteId && (
                <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4 px-3" style={{ zIndex: 1050, width: '100%', maxWidth: '500px' }}>
                    <div className="bg-white shadow-lg rounded-4 p-3 border">
                        <div className="d-flex justify-content-between">
                            <div>
                                <strong>Confirm Deletion</strong>
                                <p className="mb-0 small text-muted">Delete contract <strong>#ID: {deleteId}</strong>?</p>
                            </div>
                            <button className="btn-close" onClick={() => setDeleteId(null)} />
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
};

export default Contracts;