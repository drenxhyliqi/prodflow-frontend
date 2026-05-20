import React, { useEffect, useState } from 'react';
import Layout from '../../layouts/Layout';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { MdOutlineAddBox, MdDeleteOutline, MdPayments } from 'react-icons/md';
import Paginate from '../../components/Paginate';
import { FaSearch, FaEdit, FaUserTie } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { IoIosArrowBack } from "react-icons/io";

const BRAND = '#035dad';
const inputCls = 'form-control shadow-none rounded-3';
const btnBrand = { backgroundColor: BRAND, color: '#fff', border: 'none' };

const Salaries = () => {
    const [salaries, setSalaries] = useState([]);
    const [staff, setStaff] = useState([]);
    const [editSalary, setEditSalary] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [pagination, setPagination] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const location = useLocation();

    const getSalaries = (page = 1, searchValue = '') => {
        let url = `/admin/salaries?page=${page}`;
        if (searchValue) url += `&search=${encodeURIComponent(searchValue)}`;
        
        api.get(url)
            .then(res => {
                setSalaries(res.data.data);
                setPagination(res.data);
            })
            .catch(() => toast.error('Failed to fetch salaries.'));
    };

    const getStaff = () => {
        api.get('/admin/staff')
            .then(res => setStaff(res.data.data || res.data))
            .catch(() => toast.error('Failed to fetch staff list.'));
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const page = params.get('page') || 1;
        const urlSearch = params.get('search') || '';
        getSalaries(page, urlSearch);
        getStaff();
        setSearch(urlSearch);
    }, [location.search]);

    const handleCreate = (e) => {
        e.preventDefault();
        setSubmitting(true);
        const data = {
            employee_id: e.target.employee_id.value,
            salary: e.target.salary.value,
            comment: e.target.comment.value
        };

        api.post('/admin/create_salary', data)
            .then(res => {
                toast.success(res.data.message);
                getSalaries();
                e.target.reset();
            })
            .catch(err => toast.error(err.response?.data?.message || 'Error'))
            .finally(() => setSubmitting(false));
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        setSubmitting(true);
        const data = {
            sid: editSalary.sid,
            employee_id: e.target.employee_id.value,
            salary: e.target.salary.value,
            comment: e.target.comment.value
        };

        api.post('/admin/update_salary', data)
            .then(res => {
                toast.success(res.data.message);
                setEditSalary(null);
                getSalaries();
            })
            .catch(() => toast.error('Update failed'))
            .finally(() => setSubmitting(false));
    };

    const handleDelete = () => {
        api.get(`/admin/delete_salary/${deleteId}`)
            .then(res => {
                toast.success(res.data.message);
                getSalaries();
                setDeleteId(null);
            })
            .catch(() => toast.error('Delete failed'));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const value = e.target.search.value.trim();
        const params = new URLSearchParams(location.search);
        params.set('search', value);
        params.set('page', 1);
        window.history.pushState({}, '', `?${params.toString()}`);
        getSalaries(1, value);
    };

    if (editSalary) return (
        <Layout>
            <button onClick={() => setEditSalary(null)} className='btn border-0 p-0 d-flex align-items-center fw-semibold mb-3'>
                <IoIosArrowBack className='me-2' /> Turn back
            </button>
            <div className="card rounded-4 border-0 shadow-sm">
                <div className="card-header py-3 px-4" style={{ background: BRAND + '10' }}>
                    <span className='fw-semibold' style={{ color: BRAND }}>Edit Salary Record <strong>#ID:{editSalary.sid}</strong></span>
                </div>
                <div className="card-body p-4">
                    <form onSubmit={handleUpdate}>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label small fw-semibold">Employee</label>
                                <select name="employee_id" defaultValue={editSalary.employee_id} className={inputCls} required>
                                    {staff.map(s => <option key={s.sid} value={s.sid}>{s.name} {s.surname}</option>)}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-semibold">Amount (€)</label>
                                <input type="number" step="0.01" name="salary" defaultValue={editSalary.salary} className={inputCls} required />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-semibold">Comment</label>
                                <input type="text" name="comment" defaultValue={editSalary.comment} className={inputCls} />
                            </div>
                            <div className="col-12 mt-4">
                                <button disabled={submitting} className="btn rounded-3 px-4 fw-semibold" style={btnBrand}>
                                    {submitting ? 'Updating...' : 'Update Salary'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 rounded-4 px-4 py-4 mb-4" style={{ background: BRAND + '1a' }}>
                <div>
                    <p className="mb-1 fw-semibold text-uppercase" style={{ fontSize: '0.68rem', color: BRAND, letterSpacing: '1px' }}>Finance Management</p>
                    <h4 className='fw-bold mb-1'>Salaries Overview</h4>
                    <small className='text-muted'>Track and manage employee payments.</small>
                </div>
                <button 
                    className="btn rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2" 
                    style={btnBrand}
                    onClick={() => document.getElementById('add-salary-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                    <MdOutlineAddBox size={18} /> New Entry
                </button>
            </div>

            <div id="add-salary-form" className="card rounded-4 border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3 mb-3">
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: BRAND + '18', color: BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MdPayments />
                        </div>
                        <p className="fw-semibold mb-0">Add Salary Record</p>
                    </div>
                    <form onSubmit={handleCreate}>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label small fw-semibold">Employee</label>
                                <select name="employee_id" className={inputCls} required>
                                    <option value="">Select Employee</option>
                                    {staff.map(s => <option key={s.sid} value={s.sid}>{s.name} {s.surname}</option>)}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-semibold">Salary Amount (€)</label>
                                <input type="number" step="0.01" name="salary" placeholder="0.00" className={inputCls} required />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-semibold">Comment</label>
                                <input type="text" name="comment" placeholder="E.g. Bonus, Monthly Salary..." className={inputCls} />
                            </div>
                            <div className="col-12 mt-3">
                                <button disabled={submitting} className="btn rounded-3 fw-semibold" style={btnBrand}>
                                    {submitting ? 'Registering...' : 'Register Salary'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <div className="card rounded-4 border-0 shadow-sm">
                <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h6 className='fw-bold mb-0'>Payment History ({pagination.total || 0})</h6>
                        <form onSubmit={handleSearch} style={{ minWidth: '250px' }}>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0 rounded-start-3"><FaSearch className='text-muted' size={13} /></span>
                                <input type="search" name="search" defaultValue={search} className="form-control border-start-0 shadow-none rounded-end-3" placeholder="Search records..." />
                            </div>
                        </form>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="text-uppercase" style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                                <tr>
                                    <th>#</th>
                                    <th>Employee</th>
                                    <th>Amount</th>
                                    <th>Comment</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salaries.length > 0 ? salaries.map(s => (
                                    <tr key={s.sid}>
                                        <td className="text-muted small">#{s.sid}</td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className='rounded-circle bg-light d-flex align-items-center justify-content-center' style={{ width: 30, height: 30 }}><FaUserTie size={12} /></div>
                                                <span className='fw-semibold'>{s.employee_name} {s.employee_surname}</span>
                                            </div>
                                        </td>
                                        <td><span className='fw-bold text-success'>€{s.salary}</span></td>
                                        <td><small className='text-muted'>{s.comment || '-'}</small></td>
                                        <td className="text-end">
                                            <button onClick={() => setEditSalary(s)} className="btn btn-sm me-1" style={{ color: BRAND, background: BRAND + '12' }}><FaEdit /></button>
                                            <button onClick={() => setDeleteId(s.sid)} className="btn btn-sm" style={{ color: '#ef4444', background: '#ef444412' }}><MdDeleteOutline size={18} /></button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" className="text-center py-4 text-muted small">No records found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Paginate data={pagination} />
                </div>
            </div>

            {deleteId && (
                <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4 px-3" style={{ zIndex: 1050, width: '100%', maxWidth: '400px' }}>
                    <div className="bg-white shadow-lg rounded-4 p-3 border">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <strong className="d-block small">Confirm Deletion</strong>
                                <p className="mb-0 extra-small text-muted">Delete record #ID: {deleteId}?</p>
                            </div>
                            <button className="btn-close small" onClick={() => setDeleteId(null)} />
                        </div>
                        <div className="d-flex justify-content-end mt-3 gap-2">
                            <button className="btn btn-sm btn-light rounded-2" onClick={() => setDeleteId(null)}>Cancel</button>
                            <button className="btn btn-sm btn-danger rounded-2" onClick={handleDelete}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Salaries;