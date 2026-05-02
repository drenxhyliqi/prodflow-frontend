import React, { useEffect, useState } from 'react'
import Layout from '../../layouts/Layout'
import api from '../../api/axios'
import { toast } from 'react-toastify';
import { MdOutlineAddBox, MdDeleteOutline } from 'react-icons/md';
import Paginate from '../../components/Paginate';
import { FaEdit } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { IoIosArrowBack } from "react-icons/io";

const BRAND = '#035dad';
const inputCls = 'form-control shadow-none rounded-3';
const btnBrand = { backgroundColor: BRAND, color: '#fff', border: 'none' };

const Maintenances = () => {
    const [maintenances, setMaintenances] = useState([]);
    const [machines, setMachines] = useState([]); 
    const [editItem, setEditItem] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [pagination, setPagination] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const location = useLocation();

    function getMachines() {
        api.get(`/admin/machines`)
            .then(res => {
                const data = res.data.data || res.data;
                setMachines(data);
            })
            .catch(() => toast.error('Failed to load machines.'));
    }

    function getMaintenances(page = 1, searchValue = '') {
        let url = `/admin/maintenances?page=${page}`;
        if (searchValue && searchValue.trim() !== '') {
            url += `&search=${encodeURIComponent(searchValue.trim())}`;
        }
        api.get(url)
            .then(response => {
                setMaintenances(response.data.data || []);
                setPagination(response.data);
            })
            .catch(() => toast.error('Failed to fetch maintenance records.'));
    }

    function createMaintenance(e) {
        e.preventDefault();
        setSubmitting(true);
        
        const machine_id = document.getElementById('machine_id').value;
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;

        api.post('/admin/create_maintenance', { machine_id, date, description })
            .then(response => {
                toast.success(response.data.message);
                getMaintenances();
                clearFields();
                setSubmitting(false);
            })
            .catch(error => {
                toast.error(error.response?.data?.message || 'Failed to create record.');
                setSubmitting(false);
            });
    }

    const handleSearch = (e) => {
        e.preventDefault();
        const value = e.target.search.value.trim();
        const params = new URLSearchParams(location.search);
        params.set('search', value);
        params.set('page', 1);
        window.history.pushState({}, '', `?${params.toString()}`);
        getMaintenances(1, value);
    };

    function checkEditMaintenance(id) {
        api.get(`/admin/edit_maintenance/${id}`)
            .then(response => setEditItem(response.data))
            .catch(() => toast.error('No information found.'));
    }

    function updateMaintenance(e) {
        e.preventDefault();
        setSubmitting(true);
        const mid = document.getElementById('mid').value;
        const machine_id = document.getElementById('machine_id').value;
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;

        api.post('/admin/update_maintenance', { mid, machine_id, date, description })
            .then(response => {
                toast.success(response.data.message);
                setSubmitting(false);
                setEditItem(null);
                getMaintenances();
            })
            .catch(() => {
                toast.error('Failed to update record.');
                setSubmitting(false);
            });
    }

    function handleDelete() {
        api.get(`/admin/delete_maintenance/${deleteId}`)
            .then(() => {
                toast.success("Deleted successfully");
                getMaintenances();
                setDeleteId(null);
            })
            .catch(() => toast.error('Failed to delete.'));
    }

    function clearFields() {
        document.getElementById('machine_id').value = '';
        document.getElementById('date').value = '';
        document.getElementById('description').value = '';
    }

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const page = params.get('page') || 1;
        const urlSearch = params.get('search') || '';
        
        setSearch(urlSearch);
        getMaintenances(page, urlSearch);
        getMachines();
    }, [location.search]);

    //
    if (editItem) return (
        <Layout>
            <button onClick={() => setEditItem(null)} className='btn btn-transparent border-0 p-0 d-flex align-items-center fw-semibold'>
                <IoIosArrowBack className='me-2' />Turn back
            </button>
            <div className="card rounded-4 mt-3 border-0 shadow-sm">
                <div className="card-header rounded-top-4 border-0 py-3 px-4" style={{ background: BRAND + '10' }}>
                    <span className='fw-semibold' style={{ color: BRAND }}>
                        Update Maintenance <strong>#ID:{editItem.mid}</strong>
                    </span>
                </div>
                <div className="card-body px-4 pb-4">
                    <form onSubmit={updateMaintenance}>
                        <input type="hidden" id='mid' value={editItem.mid} />
                        <div className="row g-3">
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Machine</label>
                                <select defaultValue={editItem.machine_id} className={inputCls} id="machine_id" required>
                                    <option value="">Select Machine</option>
                                    {machines.map(m => <option key={m.mid} value={m.mid}>{m.machine}</option>)}
                                </select>
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Date</label>
                                <input type="date" defaultValue={editItem.date} className={inputCls} id="date" required />
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Description</label>
                                <input type="text" defaultValue={editItem.description} className={inputCls} id="description" required />
                            </div>
                            <div className="col-12">
                                <button type="submit" disabled={submitting} className="btn rounded-3 fw-semibold" style={btnBrand}>
                                    {submitting ? 'Updating...' : 'Update Maintenance'}
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
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 rounded-4 px-4 py-4 mb-4" style={{ background: BRAND + '1a' }}>
                <div>
                    <h4 className='fw-bold mb-1'>Maintenances Overview</h4>
                    <small className='text-muted'>Manage tracking for all machines.</small>
                </div>
            </div>

            {/* Create Form */}
            <div id="create-form" className="card rounded-4 border-0 shadow-sm mb-4">
                <div className="card-body px-4 pt-4 pb-3">
                    <p className="fw-semibold mb-3">Register new Maintenance</p>
                    <form onSubmit={createMaintenance}>
                        <div className="row g-3">
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Machine</label>
                                <select className={inputCls} id="machine_id" required>
                                    <option value="">Select Machine</option>
                                    {machines.map(m => <option key={m.mid} value={m.mid}>{m.machine}</option>)}
                                </select>
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Date</label>
                                <input type="date" className={inputCls} id="date" required />
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Description</label>
                                <input type="text" className={inputCls} id="description" placeholder="Service details..." required />
                            </div>
                            <div className="col-12">
                                <button type="submit" disabled={submitting} className="btn rounded-3 fw-semibold" style={btnBrand}>
                                    <MdOutlineAddBox size={18} className="me-1"/> Create Maintenance
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* List */}
            <div className="card rounded-4 border-0 shadow-sm mb-4">
                <div className="card-body px-4 pt-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <p className="fw-semibold mb-0">Maintenance Logs</p>
                        <form onSubmit={handleSearch}>
                            <input type="search" name="search" defaultValue={search} className={inputCls} placeholder="Search logs..." />
                        </form>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Machine</th>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th className="text-end">Operations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {maintenances.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-4">No records found.</td></tr>
                                ) : (
                                    maintenances.map(item => (
                                        <tr key={item.mid}>
                                            <td>#{item.mid}</td>
                                            <td>{item.machine_name}</td>
                                            <td>{item.date}</td>
                                            <td>{item.description}</td>
                                            <td className="text-end">
                                                <button onClick={() => checkEditMaintenance(item.mid)} className="btn btn-sm me-1" style={{ color: BRAND, background: BRAND + '12' }}><FaEdit /></button>
                                                <button onClick={() => setDeleteId(item.mid)} className="btn btn-sm" style={{ color: '#ef4444', background: '#ef444412' }}><MdDeleteOutline /></button>
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

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4 px-3" style={{ zIndex: 1050, width: '100%', maxWidth: '500px' }}>
                    <div className="bg-white shadow-lg rounded-4 p-3 border">
                        <div className="d-flex justify-content-between align-items-center">
                            <div><strong>Confirm deletion</strong><p className="mb-0 small text-muted">Delete record #ID: {deleteId}?</p></div>
                            <button className="btn-close shadow-none" onClick={() => setDeleteId(null)} />
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

export default Maintenances;