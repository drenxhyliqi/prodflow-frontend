import { useEffect, useState } from 'react'
import Layout from '../../layouts/Layout'
import api from '../../api/axios'
import { toast } from 'react-toastify';
import { MdOutlineAddBox, MdDeleteOutline } from 'react-icons/md';
import Paginate from '../../components/Paginate';
import { FaSearch, FaEdit, FaPlane, FaClock, FaCheck, FaTimes, FaUser } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { IoIosArrowBack } from "react-icons/io";

const BRAND = '#035dad';
const STATUS_OPTIONS = ['pending', 'approved', 'rejected'];

const statusBadge = (status) => {
    const map = {
        pending:  { color: '#f59e0b', label: 'Pending' },
        approved: { color: '#10b981', label: 'Approved' },
        rejected: { color: '#ef4444', label: 'Rejected' },
    };
    const s = map[status] || { color: '#6b7280', label: status ?? '-' };
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 999,
            background: s.color + '20', color: s.color,
            fontSize: '0.78rem', fontWeight: 600,
        }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color }} />
            {s.label}
        </span>
    );
};

const StatCard = ({ icon, label, value, sub }) => (
    <div className="col-12 col-sm-6 col-lg-3">
        <div className="card rounded-4 border-0 shadow-sm h-100">
            <div className="card-body d-flex justify-content-between align-items-start p-4">
                <div>
                    <p className="text-muted mb-1 fw-semibold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.06em' }}>{label}</p>
                    <h3 className="fw-bold mb-0">{value}</h3>
                    <p className="text-muted small mb-0 mt-1">{sub}</p>
                </div>
                <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: BRAND + '18',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: BRAND, fontSize: 18,
                }}>
                    {icon}
                </div>
            </div>
        </div>
    </div>
);

const inputCls = 'form-control shadow-none rounded-3';
const selectCls = 'form-select shadow-none rounded-3';

const Vacations = () => {
    const [rows, setRows]             = useState([]);
    const [editRow, setEditRow]       = useState(null);
    const [deleteId, setDeleteId]     = useState(null);
    const [pagination, setPagination] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch]         = useState('');
    const [staffList, setStaffList]   = useState([]);
    const [stats, setStats]           = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const location = useLocation();

    function fetchStaff() {
        api.get('/admin/staff')
            .then(r => setStaffList(r.data.data || []))
            .catch(() => {});
    }

    function fetchStats() {
        api.get('/admin/vacations')
            .then(r => {
                const all = r.data.data || [];
                setStats({
                    total:    r.data.total || all.length,
                    pending:  all.filter(x => x.status === 'pending').length,
                    approved: all.filter(x => x.status === 'approved').length,
                    rejected: all.filter(x => x.status === 'rejected').length,
                });
            })
            .catch(() => {});
    }

    function getRows(page = 1, searchValue = '') {
        let url = `/admin/vacations?page=${page}`;
        if (searchValue?.trim()) url += `&search=${encodeURIComponent(searchValue.trim())}`;
        api.get(url)
            .then(r => { setRows(r.data.data || []); setPagination(r.data); })
            .catch(() => toast.error('Failed to fetch vacations.'));
    }

    function createRow(e) {
        e.preventDefault();
        setSubmitting(true);
        const staff_id   = document.getElementById('staff_id').value;
        const start_date = document.getElementById('start_date').value;
        const end_date   = document.getElementById('end_date').value;
        const status     = document.getElementById('status').value;
        const reason     = document.getElementById('reason').value;
        api.post('/admin/create_vacation', { staff_id, start_date, end_date, status, reason })
            .then(r => {
                toast.success(r.data.message);
                getRows(); fetchStats(); clearFields();
                setSubmitting(false);
            })
            .catch(err => {
                toast.error(err.response?.data?.message || 'Failed to create vacation.');
                setSubmitting(false);
            });
    }

    function checkEdit(id) {
        api.get(`/admin/edit_vacation/${id}`)
            .then(r => setEditRow(r.data))
            .catch(err => toast.error(err.response?.data?.message || 'No information found.'));
    }

    function updateRow(e) {
        e.preventDefault();
        setSubmitting(true);
        const vid        = document.getElementById('vid').value;
        const staff_id   = document.getElementById('staff_id').value;
        const start_date = document.getElementById('start_date').value;
        const end_date   = document.getElementById('end_date').value;
        const status     = document.getElementById('status').value;
        const reason     = document.getElementById('reason').value;
        api.post('/admin/update_vacation', { vid, staff_id, start_date, end_date, status, reason })
            .then(r => {
                toast.success(r.data.message);
                setSubmitting(false); setEditRow(null);
                getRows(); fetchStats();
            })
            .catch(err => {
                toast.error(err.response?.data?.message || 'Failed to update vacation.');
                setSubmitting(false);
            });
    }

    function handleDelete() {
        api.get(`/admin/delete_vacation/${deleteId}`)
            .then(r => {
                toast.success(r.data.message);
                getRows(); fetchStats(); setDeleteId(null);
            })
            .catch(err => {
                toast.error(err.response?.data?.message || 'Failed to delete vacation.');
                setDeleteId(null);
            });
    }

    const handleSearch = (e) => {
        e.preventDefault();
        const value = e.target.search.value.trim();
        const params = new URLSearchParams(location.search);
        params.set('search', value); params.set('page', 1);
        window.history.pushState({}, '', `?${params.toString()}`);
        getRows(1, value);
    };

    function clearFields() {
        ['staff_id', 'start_date', 'end_date', 'status'].forEach(id => {
            document.getElementById(id).value = '';
        });
        document.getElementById('reason').value = '';
    }

    const formatDate = (val) => val
        ? new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })
        : '-';

    useEffect(() => {
        const params    = new URLSearchParams(location.search);
        const page      = params.get('page') || 1;
        const urlSearch = params.get('search') || '';
        getRows(page, urlSearch);
        setSearch(urlSearch);
        fetchStaff();
        fetchStats();
    }, [location.search]);

    useEffect(() => {
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const btnBrand = { backgroundColor: BRAND, color: '#fff', border: 'none' };

    /* ── EDIT MODE ─────────────────────────────────────── */
    if (editRow) return (
        <Layout>
            <button
                onClick={() => setEditRow(null)}
                className='btn btn-transparent border-0 p-0 d-flex align-items-center fw-semibold'
            >
                <IoIosArrowBack className='me-2' />Turn back
            </button>

            <div className="card rounded-4 mt-3 border-0 shadow-sm">
                <div className="card-header rounded-top-4 border-0 py-3 px-4" style={{ background: BRAND + '10' }}>
                    <span className='fw-semibold' style={{ color: BRAND }}>
                        Update Vacation <strong>#ID:{editRow.vid}</strong>
                    </span>
                </div>
                <div className="card-body px-4 pb-4">
                    <form onSubmit={updateRow}>
                        <input type="hidden" id='vid' value={editRow.vid} />
                        <div className="row g-3">
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Staff</label>
                                <select defaultValue={editRow.staff_id} className={selectCls} id="staff_id">
                                    <option value="">Select staff member</option>
                                    {staffList.map(s => (
                                        <option key={s.sid} value={s.sid}>{s.name} {s.surname}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Start Date</label>
                                <input type="date" defaultValue={editRow.start_date} className={inputCls} id="start_date" />
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">End Date</label>
                                <input type="date" defaultValue={editRow.end_date} className={inputCls} id="end_date" />
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Status</label>
                                <select defaultValue={editRow.status} className={selectCls} id="status">
                                    <option value="">Select status</option>
                                    {STATUS_OPTIONS.map(s => (
                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-12 col-md-8">
                                <label className="form-label fw-semibold small">Reason</label>
                                <textarea
                                    defaultValue={editRow.reason}
                                    className={inputCls} id="reason" rows="1"
                                    maxLength={100}
                                    placeholder="Explain the reason for this vacation request..."
                                />
                            </div>
                            <div className="col-12 d-flex justify-content-end">
                                <button
                                    type={submitting ? 'button' : 'submit'}
                                    disabled={submitting}
                                    className="btn rounded-3 d-flex align-items-center gap-2 fw-semibold px-4"
                                    style={btnBrand}
                                >
                                    <FaEdit /> {submitting ? 'Updating...' : 'Update Vacation'}
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
                style={{ background: '#035dad1a' }}
            >
                <div>
                    <p className="mb-1 fw-semibold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.1em', color: '#5a8a7a' }}>Human Resources</p>
                    <h4 className='fw-bold mb-1' style={{ color: '#1a2e2a' }}>Vacation Management</h4>
                    <small style={{ color: '#5a7a72' }}>Review, approve, and track staff time off in one place.</small>
                </div>
                <button
                    className="btn rounded-pill d-flex align-items-center gap-2 fw-semibold px-4 py-2"
                    style={btnBrand}
                    onClick={() => document.getElementById('create-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                    <MdOutlineAddBox size={18} /> New Vacation
                </button>
            </div>

            {/* Stats */}
            <div className="row g-3 mb-4">
                <StatCard icon={<FaPlane />} label="Total Requests" value={stats.total}    sub="All time" />
                <StatCard icon={<FaClock />} label="Pending"        value={stats.pending}  sub="Needs review" />
                <StatCard icon={<FaCheck />} label="Approved"       value={stats.approved} sub="This year" />
                <StatCard icon={<FaTimes />} label="Rejected"       value={stats.rejected} sub="Declined" />
            </div>

            {/* Create Form */}
            <div id="create-form" className="card rounded-4 border-0 shadow-sm mb-4">
                <div className="card-body px-4 pt-4 pb-3">
                    <div className="d-flex align-items-center gap-3 mb-4">
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: BRAND + '18', color: BRAND,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                        }}>
                            <MdOutlineAddBox />
                        </div>
                        <div>
                            <p className="fw-semibold mb-0">Register new Vacation</p>
                            <small className="text-muted">Fill in the details to submit a vacation request</small>
                        </div>
                    </div>

                    <form onSubmit={createRow}>
                        <div className="row g-3">
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Staff</label>
                                <select className={selectCls} id="staff_id">
                                    <option value="">Select staff member</option>
                                    {staffList.map(s => (
                                        <option key={s.sid} value={s.sid}>{s.name} {s.surname}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Start Date</label>
                                <input type="date" className={inputCls} id="start_date" />
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">End Date</label>
                                <input type="date" className={inputCls} id="end_date" />
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Status</label>
                                <select className={selectCls} id="status">
                                    <option value="">Select status</option>
                                    {STATUS_OPTIONS.map(s => (
                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-12 col-md-8">
                                <label className="form-label fw-semibold small">Reason</label>
                                <textarea
                                    className={inputCls} id="reason" rows="1"
                                    maxLength={100}
                                    placeholder="Explain the reason for this vacation request..."
                                />
                            </div>
                            <div className="col-12 d-flex justify-content-end">
                                <button
                                    type={submitting ? 'button' : 'submit'}
                                    disabled={submitting}
                                    className="btn rounded-3 d-flex align-items-center gap-2 fw-semibold px-4"
                                    style={btnBrand}
                                >
                                    <MdOutlineAddBox size={18} />
                                    {submitting ? 'Creating...' : 'Create Vacation'}
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
                        <div className="d-flex align-items-center gap-3">
                            <div style={{
                                width: 36, height: 36, borderRadius: 10,
                                background: BRAND + '18', color: BRAND,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                            }}>
                                <FaPlane />
                            </div>
                            <div>
                                <p className="fw-semibold mb-0">Vacations List</p>
                                <small className="text-muted">{pagination.total || 0} entries</small>
                            </div>
                        </div>
                        <form onSubmit={handleSearch} style={{ minWidth: 220 }}>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0 rounded-start-3">
                                    <FaSearch className="text-muted" size={13} />
                                </span>
                                <input
                                    type="search" name="search" defaultValue={search}
                                    className="form-control border-start-0 shadow-none rounded-end-3"
                                    placeholder="Search staff or reason..."
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
                                    <th className="text-nowrap fw-semibold">Staff Name</th>
                                    <th className="text-nowrap fw-semibold">Start Date</th>
                                    <th className="text-nowrap fw-semibold">End Date</th>
                                    <th className="text-nowrap fw-semibold">Reason</th>
                                    <th className="text-nowrap fw-semibold">Status</th>
                                    <th className="text-end text-nowrap fw-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted py-4">No data to show...</td>
                                    </tr>
                                ) : (
                                    rows.map(row => (
                                        <tr key={row.vid}>
                                            <td className="text-nowrap text-muted small">#{row.vid}</td>
                                            <td className="text-nowrap">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div style={{
                                                        width: 32, height: 32, borderRadius: '50%',
                                                        background: '#035dad', color: '#f9f9f9',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
                                                    }}>
                                                        <FaUser />
                                                    </div>
                                                    <span className="fw-semibold">{row.staff_name ?? '-'}</span>
                                                </div>
                                            </td>
                                            <td className="text-nowrap text-muted">{formatDate(row.start_date)}</td>
                                            <td className="text-nowrap text-muted">{formatDate(row.end_date)}</td>
                                            <td className="text-muted" style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {row.reason ?? '-'}
                                            </td>
                                            <td className="text-nowrap">{statusBadge(row.status)}</td>
                                            <td className="text-end text-nowrap">
                                                <button
                                                    onClick={() => checkEdit(row.vid)}
                                                    className="btn btn-sm me-1"
                                                    style={{ color: BRAND, background: BRAND + '12' }}
                                                >
                                                    <FaEdit size={15} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteId(row.vid)}
                                                    className="btn btn-sm"
                                                    style={{ color: '#ef4444', background: '#ef444412' }}
                                                >
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
                                <p className="mb-0 small text-muted">Are you sure you want to delete vacation <strong>#ID: {deleteId}</strong>?</p>
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
};

export default Vacations
