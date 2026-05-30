import { useEffect, useState } from 'react'
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

const EMPTY_FORM = { warehouse: '', location: '', capacity: '' };

function capacityColor(pct) {
    if (pct < 60) return { bar: '#10b981', glow: 'rgba(16,185,129,0.3)',  track: '#d1fae5', text: '#059669' };
    if (pct < 85) return { bar: '#f59e0b', glow: 'rgba(245,158,11,0.3)', track: '#fef3c7', text: '#d97706' };
    return             { bar: '#ef4444', glow: 'rgba(239,68,68,0.3)',   track: '#fee2e2', text: '#dc2626' };
}

function CapacityBar({ used, total }) {
    const [hover, setHover] = useState(false);

    if (total == null || total === '' || Number(total) <= 0) {
        return <span className="text-muted" style={{ fontSize: '0.78rem' }}>—</span>;
    }

    const usedNum  = Math.max(0, Number(used)  || 0);
    const totalNum = Number(total);
    const pct      = Math.min(100, Math.round((usedNum / totalNum) * 100));
    const c        = capacityColor(pct);

    return (
        <div
            style={{ minWidth: 180, position: 'relative', cursor: 'default' }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {/* Tooltip */}
            {hover && (
                <div style={{
                    position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#0f172a', color: 'white', borderRadius: 8,
                    padding: '6px 12px', fontSize: '0.74rem', whiteSpace: 'nowrap',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.18)', zIndex: 100,
                    pointerEvents: 'none',
                }}>
                    {usedNum.toLocaleString('en-US')} / {totalNum.toLocaleString('en-US')} units used
                    <div style={{
                        position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                        borderWidth: '5px', borderStyle: 'solid',
                        borderColor: '#0f172a transparent transparent transparent',
                    }} />
                </div>
            )}

            {/* Labels */}
            <div className="d-flex justify-content-between align-items-center mb-1">
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: c.text, lineHeight: 1 }}>
                    {pct}%
                </span>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', lineHeight: 1 }}>
                    {usedNum.toLocaleString('en-US')} / {totalNum.toLocaleString('en-US')}
                </span>
            </div>

            {/* Progress track */}
            <div style={{ height: 7, background: c.track, borderRadius: 10, overflow: 'hidden' }}>
                <div style={{
                    height: '100%', width: `${pct}%`,
                    background: c.bar, borderRadius: 10,
                    boxShadow: pct > 0 ? `0 0 8px ${c.glow}` : 'none',
                    transition: 'width 0.65s cubic-bezier(0.4,0,0.2,1)',
                }} />
            </div>
        </div>
    );
}

const Warehouses = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [usageMap, setUsageMap]     = useState({});
    const [editWarehouse, setEditWarehouse] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [pagination, setPagination] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [newForm, setNewForm] = useState(EMPTY_FORM);
    const [editForm, setEditForm] = useState(EMPTY_FORM);
    const location = useLocation();

    useEffect(() => {
        if (editWarehouse) {
            setEditForm({
                warehouse: editWarehouse.warehouse || '',
                location: editWarehouse.location || '',
                capacity: editWarehouse.capacity ?? '',
            });
        }
    }, [editWarehouse]);

    function createWarehouse(e) {
        e.preventDefault();
        setSubmitting(true);
        api.post('/admin/create_warehouse', {
            warehouse: newForm.warehouse,
            location: newForm.location,
            capacity: newForm.capacity !== '' ? Number(newForm.capacity) : null,
        })
            .then(response => {
                toast.success(response.data.message);
                getWarehouses();
                setNewForm(EMPTY_FORM);
                setSubmitting(false);
            })
            .catch(error => {
                toast.error(error.response?.data?.message || 'Failed to create warehouse.');
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
                toast.error(error.response?.data?.message || 'No information found.');
            });
    }

    function updateWarehouse(e) {
        e.preventDefault();
        setSubmitting(true);
        api.post('/admin/update_warehouse', {
            wid: editWarehouse.wid,
            warehouse: editForm.warehouse,
            location: editForm.location,
            capacity: editForm.capacity !== '' ? Number(editForm.capacity) : null,
        })
            .then(response => {
                toast.success(response.data.message);
                setSubmitting(false);
                setEditWarehouse(null);
                getWarehouses();
            })
            .catch(error => {
                toast.error(error.response?.data?.message || 'Failed to update warehouse.');
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
                toast.error(error.response?.data?.message || 'Failed to delete warehouse.');
                setDeleteId(null);
            });
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
                        <div className="row g-3">
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Warehouse Name</label>
                                <input
                                    type="text"
                                    className={inputCls}
                                    placeholder="Enter warehouse name"
                                    value={editForm.warehouse}
                                    onChange={e => setEditForm(f => ({ ...f, warehouse: e.target.value }))}
                                />
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Location</label>
                                <input
                                    type="text"
                                    className={inputCls}
                                    placeholder="Enter location"
                                    value={editForm.location}
                                    onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
                                />
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Capacity <span className="text-muted fw-normal">(optional)</span></label>
                                <input
                                    type="number"
                                    min="0"
                                    className={inputCls}
                                    placeholder="Enter capacity (units)"
                                    value={editForm.capacity}
                                    onChange={e => setEditForm(f => ({ ...f, capacity: e.target.value }))}
                                />
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
                className="hero-banner d-flex justify-content-between align-items-center flex-wrap gap-3 px-4 py-4 mb-4"
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
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Warehouse Name</label>
                                <input
                                    type="text"
                                    className={inputCls}
                                    placeholder="Enter warehouse name"
                                    value={newForm.warehouse}
                                    onChange={e => setNewForm(f => ({ ...f, warehouse: e.target.value }))}
                                />
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Location</label>
                                <input
                                    type="text"
                                    className={inputCls}
                                    placeholder="Enter location"
                                    value={newForm.location}
                                    onChange={e => setNewForm(f => ({ ...f, location: e.target.value }))}
                                />
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Capacity <span className="text-muted fw-normal">(optional)</span></label>
                                <input
                                    type="number"
                                    min="0"
                                    className={inputCls}
                                    placeholder="Enter capacity (units)"
                                    value={newForm.capacity}
                                    onChange={e => setNewForm(f => ({ ...f, capacity: e.target.value }))}
                                />
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
                                    <th className="text-nowrap fw-semibold">Capacity</th>
                                    <th className="text-nowrap fw-semibold">Capacity Usage</th>
                                    <th className="text-end text-nowrap fw-semibold">Operations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {warehouses.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center text-muted py-4">No data to show...</td></tr>
                                ) : (
                                    warehouses.map(wh => (
                                        <tr key={wh.wid}>
                                            <td className="text-nowrap text-muted small">#{wh.wid}</td>
                                            <td className="text-nowrap fw-semibold">{wh.warehouse}</td>
                                            <td className="text-nowrap text-muted">{wh.location}</td>
                                            <td className="text-nowrap text-muted">
                                                {wh.capacity != null && wh.capacity !== ''
                                                    ? `${Number(wh.capacity).toLocaleString('en-US')} units`
                                                    : '—'}
                                            </td>
                                            <td style={{ minWidth: 200 }}>
                                                <CapacityBar
                                                    used={wh.used_capacity ?? wh.stock_count ?? wh.current_stock}
                                                    total={wh.capacity}
                                                />
                                            </td>
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
