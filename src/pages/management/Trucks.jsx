import { useEffect, useState } from 'react'
import Layout from '../../layouts/Layout'
import api from '../../api/axios'
import { toast } from 'react-toastify';
import { MdOutlineAddBox, MdDeleteOutline } from 'react-icons/md';
import Paginate from '../../components/Paginate';
import { FaSearch, FaEdit } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { IoIosArrowBack } from "react-icons/io";
import { FaTruckFast } from 'react-icons/fa6';
import { TbTruckReturn } from 'react-icons/tb';

const BRAND    = '#035dad'
const inputCls = 'form-control shadow-none rounded-3'
const btnBrand = { backgroundColor: BRAND, color: '#fff', border: 'none' }

const truckStatusCfg = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'free') return { backgroundColor: '#d1fae5', color: '#065f46' };
    return { backgroundColor: '#fef3c7', color: '#92400e' };
}

const Trucks = () => {
    const [trucks, setTrucks] = useState([]);
    const [editTruck, setEditTruck] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [pagination, setPagination] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const location = useLocation();

    // Create Truck
    function createTruck(e) {
        e.preventDefault();
        setSubmitting(true);
        const truck = document.getElementById('truck').value;
        const license_plate = document.getElementById('license_plate').value;
        const capacity = document.getElementById('capacity').value;
        api.post('/admin/create_truck', { truck, license_plate, capacity })
            .then(response => {
                toast.success(response.data.message);
                getTrucks();
                clearFields();
                setSubmitting(false);
            })
            .catch(error => {
                toast.error(error.response.data.message || 'Failed to create truck.');
                setSubmitting(false);
            });
    }

    // Read Trucks
    function getTrucks(page = 1, searchValue = '') {
        let url = `/admin/trucks?page=${page}`;
        if (searchValue && searchValue.trim() !== '') {
            url += `&search=${encodeURIComponent(searchValue.trim())}`;
        }
        api.get(url)
            .then(response => {
                setTrucks(response.data.data);
                setPagination(response.data);
            })
            .catch(() => toast.error('Failed to fetch trucks.'));
    }

    // Search Trucks
    const handleSearch = (e) => {
        e.preventDefault();
        const value = e.target.search.value.trim();
        const params = new URLSearchParams(location.search);
        params.set('search', value);
        params.set('page', 1);
        window.history.pushState({}, '', `?${params.toString()}`);
        getTrucks(1, value);
    };

    // Edit Truck
    function checkEditTruck(id) {
        api.get(`/admin/edit_truck/${id}`)
            .then(response => setEditTruck(response.data))
            .catch(error => {
                toast.error(error.response.data.message || 'No information found.');
                setSubmitting(false);
            });
    }

    // Update Truck
    function updateTruck(e) {
        e.preventDefault();
        setSubmitting(true);
        const tid = document.getElementById('tid').value;
        const truck = document.getElementById('truck').value;
        const license_plate = document.getElementById('license_plate').value;
        const capacity = document.getElementById('capacity').value;
        api.post('/admin/update_truck', { tid, truck, license_plate, capacity })
            .then(response => {
                toast.success(response.data.message);
                setSubmitting(false);
                setEditTruck(null);
                getTrucks();
            })
            .catch(error => {
                toast.error(error.response.data.message || 'Failed to update truck.');
                setSubmitting(false);
            });
    }

    // Delete Truck
    function handleDelete() {
        api.get(`/admin/delete_truck/${deleteId}`)
            .then(response => {
                toast.success(response.data.message);
                getTrucks();
                setDeleteId(null);
            })
            .catch(error => {
                toast.error(error.response.data.message || 'Failed to delete truck.');
                setDeleteId(null);
            });
    }

    // Change Truck Status
    function changeStatus(id) {
        api.get(`/admin/change_truck_status/${id}`)
            .then(response => {
                toast.success(response.data.message);
                getTrucks();
            })
            .catch(error => {
                toast.error(error.response.data.message || 'Failed to change truck status.');
            });
    }

    // Clear Fields
    function clearFields() {
        document.getElementById('truck').value = '';
        document.getElementById('license_plate').value = '';
        document.getElementById('capacity').value = '';
    }

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const page = params.get('page') || 1;
        const urlSearch = params.get('search') || '';
        getTrucks(page, urlSearch);
        setSearch(urlSearch);
    }, [location.search]);

    /* ── EDIT MODE ─────────────────────────────────────── */
    if (editTruck) return (
        <Layout>
            <button
                onClick={() => setEditTruck(null)}
                className="btn btn-transparent border-0 p-0 d-flex align-items-center fw-semibold"
            >
                <IoIosArrowBack className="me-2" />Turn back
            </button>

            <div className="card rounded-4 mt-3 border-0 shadow-sm">
                <div className="card-header rounded-top-4 border-0 py-3 px-4" style={{ background: BRAND + '10' }}>
                    <span className="fw-semibold" style={{ color: BRAND }}>
                        Update Truck <strong>#ID:{editTruck.tid}</strong>
                    </span>
                </div>
                <div className="card-body px-4 pb-4">
                    <form method="post" onSubmit={updateTruck}>
                        <input type="hidden" id="tid" name="tid" value={editTruck.tid} required />
                        <div className="row g-3">
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Truck Name</label>
                                <input type="text" defaultValue={editTruck.truck} className={inputCls} id="truck" placeholder="Enter truck name" />
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">License Plate</label>
                                <input type="text" defaultValue={editTruck.license_plate} className={inputCls} id="license_plate" placeholder="Enter license plate" />
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Capacity</label>
                                <input type="text" defaultValue={editTruck.capacity} className={inputCls} id="capacity" placeholder="Enter capacity" />
                            </div>
                            <div className="col-12 col-md-4 d-flex align-items-end">
                                <button
                                    type={submitting ? 'button' : 'submit'}
                                    disabled={submitting}
                                    className="btn w-100 rounded-3 d-flex align-items-center justify-content-center gap-2 fw-semibold"
                                    style={btnBrand}
                                >
                                    <FaEdit size={13} /> {submitting ? 'Updating...' : 'Update Truck'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    )

    /* ── MAIN VIEW ─────────────────────────────────────── */
    return (
        <Layout>
            {/* Header */}
            <div
                className="hero-banner d-flex justify-content-between align-items-center flex-wrap gap-3 px-4 py-4 mb-4"
            >
                <div>
                    <p className="mb-1 fw-semibold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.1em', color: BRAND }}>Logistics</p>
                    <h4 className="fw-bold mb-1">Trucks Overview</h4>
                    <small className="text-muted">Manage fleet vehicles and their availability status.</small>
                </div>
                <button
                    className="btn rounded-pill d-flex align-items-center gap-2 fw-semibold px-4 py-2"
                    style={btnBrand}
                    onClick={() => document.getElementById('create-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                    <MdOutlineAddBox size={18} /> New Truck
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
                            <MdOutlineAddBox />
                        </div>
                        <div>
                            <p className="fw-semibold mb-0">Register new Truck</p>
                            <small className="text-muted">Fill in the details to add a new vehicle</small>
                        </div>
                    </div>

                    <form method="post" onSubmit={createTruck}>
                        <div className="row g-3 pb-2">
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Truck Name</label>
                                <input type="text" className={inputCls} id="truck" placeholder="Enter truck name" />
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">License Plate</label>
                                <input type="text" className={inputCls} id="license_plate" placeholder="Enter license plate" />
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Capacity</label>
                                <input type="text" className={inputCls} id="capacity" placeholder="Enter capacity" />
                            </div>
                            <div className="col-12 col-md-4 d-flex align-items-end">
                                <button
                                    type={submitting ? 'button' : 'submit'}
                                    disabled={submitting}
                                    className="btn w-100 rounded-3 d-flex align-items-center justify-content-center gap-2 fw-semibold"
                                    style={btnBrand}
                                >
                                    <MdOutlineAddBox size={18} />
                                    {submitting ? 'Creating...' : 'Create Truck'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Trucks List */}
            <div className="card rounded-4 border-0 shadow-sm mb-4">
                <div className="card-body px-4 pt-4">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                        <div>
                            <p className="fw-semibold mb-0">Trucks List</p>
                            <small className="text-muted">{pagination.total || 0} entries</small>
                        </div>
                        <form onSubmit={handleSearch} style={{ minWidth: 220 }}>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0 rounded-start-3">
                                    <FaSearch className="text-muted" size={13} />
                                </span>
                                <input
                                    type="search"
                                    name="search"
                                    defaultValue={search}
                                    className="form-control border-start-0 shadow-none rounded-end-3"
                                    placeholder="Search trucks..."
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
                                    <th className="text-nowrap fw-semibold">Truck</th>
                                    <th className="text-nowrap fw-semibold">License Plate</th>
                                    <th className="text-nowrap fw-semibold">Capacity</th>
                                    <th className="text-nowrap fw-semibold">Status</th>
                                    <th className="text-end text-nowrap fw-semibold">Operations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trucks.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center text-muted py-4">No data to show...</td></tr>
                                ) : (
                                    trucks.map((truck) => (
                                        <tr key={truck.tid}>
                                            <td className="text-nowrap text-muted small">#{truck.tid}</td>
                                            <td className="text-nowrap fw-semibold">{truck.truck}</td>
                                            <td className="text-nowrap text-muted">{truck.license_plate}</td>
                                            <td className="text-nowrap text-muted">{truck.capacity}</td>
                                            <td className="text-nowrap">
                                                <span className="badge rounded-pill px-3 py-1" style={{ fontSize: '0.72rem', ...truckStatusCfg(truck.status) }}>
                                                    {truck.status || '—'}
                                                </span>
                                            </td>
                                            <td className="text-end text-nowrap">
                                                <button
                                                    onClick={() => checkEditTruck(truck.tid)}
                                                    className="btn btn-sm me-1"
                                                    style={{ color: BRAND, background: BRAND + '12' }}
                                                    title="Edit"
                                                >
                                                    <FaEdit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteId(truck.tid)}
                                                    className="btn btn-sm me-1"
                                                    style={{ color: '#ef4444', background: '#ef444412' }}
                                                    title="Delete"
                                                >
                                                    <MdDeleteOutline size={17} />
                                                </button>
                                                <button
                                                    onClick={() => changeStatus(truck.tid)}
                                                    className="btn btn-sm"
                                                    style={
                                                        truck.status === 'Free'
                                                            ? { color: '#0369a1', background: '#e0f2fe' }
                                                            : { color: '#b45309', background: '#fef3c7' }
                                                    }
                                                    title={truck.status === 'Free' ? 'Dispatch truck' : 'Return truck'}
                                                >
                                                    {truck.status === 'Free'
                                                        ? <FaTruckFast size={15} />
                                                        : <TbTruckReturn size={16} />
                                                    }
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
                                <p className="mb-0 small text-muted">Are you sure you want to delete truck <strong>#ID: {deleteId}</strong>?</p>
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
    )
}

export default Trucks
