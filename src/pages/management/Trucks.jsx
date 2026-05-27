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
import { FaTruckFast } from 'react-icons/fa6';
import { TbTruckReturn } from 'react-icons/tb';

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
            .catch(() => {
                toast.error('Failed to fetch trucks.');
            });
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
            .then(response => {
                setEditTruck(response.data);
            })
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
                setEditTruck(null)
                getTrucks();
            })
            .catch(error => {
                toast.error(error.response.data.message || 'Failed to update truck.');
                setSubmitting(false);
            });
    }

    // Delete Truck
    function handleDelete(){
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

    return (
        <Layout>
            {!editTruck && (
                <>
                    <h4 className='fw-bold'>Trucks</h4>
                    <small className='d-inline-block opacity-75'>Manage registered trucks by company</small>
                </>
            )}

            {editTruck && (
                <>
                    <button onClick={() => setEditTruck(null)} className='btn btn-transparent border-0 p-0 d-flex align-items-center fw-semibold'><IoIosArrowBack className='me-2'/>Turn back</button>
                </>
            )}

            {/* Edit Truck */}
            {editTruck && (
                <>
                    <div className="card rounded-4 mt-3">
                        <div className="card-header rounded-4">
                            <span className='fw-semibold'>Update Truck <strong>#ID:{editTruck.tid}</strong></span>
                        </div>
                        <div className="card-body">
                            <form method='post' onSubmit={updateTruck}>
                                <input type="hidden" id='tid' name='tid' value={editTruck.tid} required/>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="truck" className="form-label">Truck Name</label>
                                        <input type="text" defaultValue={editTruck.truck} className="form-control rounded-4 shadow-none" id="truck" placeholder="Enter truck name" />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="license_plate" className="form-label">License Plate</label>
                                        <input type="text" defaultValue={editTruck.license_plate} className="form-control rounded-4 shadow-none" id="license_plate" placeholder="Enter license plate" />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="capacity" className="form-label">Capacity</label>
                                        <input type="text" defaultValue={editTruck.capacity} className="form-control rounded-4 shadow-none" id="capacity" placeholder="Enter capacity" />
                                    </div>
                                    <div className="col-12">
                                        {submitting ? (
                                            <button type='button' className="btn btn-success rounded-4 d-flex align-items-center gap-1" disabled><FaEdit /> Updating...</button>
                                        ) : (
                                            <button type='submit' className="btn btn-success rounded-4 d-flex align-items-center gap-1"><FaEdit /> Update Truck</button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {/* Create Truck */}
            {!editTruck && (
                <>
                    <div className="card rounded-4 mt-3">
                        <div className="card-header rounded-4">
                            <span className='fw-semibold'>Register new Truck</span>
                        </div>
                        <div className="card-body">
                            <form method='post' onSubmit={createTruck}>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="truck" className="form-label">Truck Name</label>
                                        <input type="text" className="form-control rounded-4 shadow-none" id="truck" placeholder="Enter truck name" />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="license_plate" className="form-label">License Plate</label>
                                        <input type="text" className="form-control rounded-4 shadow-none" id="license_plate" placeholder="Enter license plate" />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="capacity" className="form-label">Capacity</label>
                                        <input type="text" className="form-control rounded-4 shadow-none" id="capacity" placeholder="Enter capacity" />
                                    </div>
                                    <div className="col-12">
                                        {submitting ? (
                                            <button type='button' className="btn btn-success rounded-4 d-flex align-items-center gap-1" disabled><MdOutlineAddBox /> Creating...</button>
                                        ) : (
                                            <button type='submit' className="btn btn-success rounded-4 d-flex align-items-center gap-1"><MdOutlineAddBox /> Create Truck</button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Trucks List */}
                    <div className="card rounded-4 my-4">
                        <div className="card-header rounded-4">
                            <span className='fw-semibold'>Trucks List</span>
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
                                            <th className='text-nowrap' scope="col">Truck</th>
                                            <th className='text-nowrap' scope="col">License Plate</th>
                                            <th className='text-nowrap' scope="col">Capacity</th>
                                            <th className='text-nowrap' scope="col">Status</th>
                                            <th className='text-end text-nowrap' scope="col">Operations</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {trucks.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center">No data to show...</td>
                                            </tr>
                                        ) : (
                                            trucks.map((truck, index) => (
                                                <tr key={truck.tid}>
                                                    <td className='text-nowrap'>{truck.tid}</td>
                                                    <td className='text-nowrap'>{truck.truck}</td>
                                                    <td className='text-nowrap'>{truck.license_plate}</td>
                                                    <td className='text-nowrap'>{truck.capacity}</td>
                                                    <td className='text-nowrap'>{truck.status}</td>
                                                    <td className='text-end text-nowrap'>
                                                        <button onClick={() => checkEditTruck(truck.tid)} className="btn btn-success btn-sm shadow-sm me-2"><FaEdit size={20} /></button>
                                                        <button onClick={() => setDeleteId(truck.tid)} className="btn btn-danger btn-sm shadow-sm me-2"><MdDeleteOutline size={20} /></button>
                                                        <button onClick={() => changeStatus(truck.tid)}
                                                            className={`btn btn-sm shadow-sm ${
                                                                truck.status === "Free" ? "btn-dark" : "btn-danger"
                                                            }`}
                                                        >
                                                            {truck.status === "Free" ? (
                                                                <FaTruckFast size={20} />
                                                            ) : (
                                                                <TbTruckReturn size={20} />
                                                            )}
                                                        </button>
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

                    {/* Delete Truck */}
                    {deleteId && (
                        <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4 px-3" style={{ zIndex: 1050, width: '100%', maxWidth: '500px' }}>
                            <div className="bg-white shadow-lg rounded-4 p-3 border">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>Confirm deletion</strong>
                                        <p className="mb-0 small text-muted">Are you sure you want to delete this truck with <strong>#ID: {deleteId}</strong>?</p>
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

export default Trucks