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

const Materials = () => {
    const [materials, setMaterials] = useState([]);
    const [editMaterial, setEditMaterial] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [pagination, setPagination] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const location = useLocation();

    // Create Material
    function createMaterial(e) {
        e.preventDefault();
        setSubmitting(true);
        const material = document.getElementById('material').value;
        const unit = document.getElementById('unit').value;
        api.post('/admin/create_material', { material, unit })
            .then(response => {
                toast.success(response.data.message);
                getMaterials();
                clearFields();
                setSubmitting(false);
            })
            .catch(error => {
                toast.error(error.response?.data?.message || 'Failed to create material.');
                setSubmitting(false);
            });
    }

    // Read Materials
    function getMaterials(page = 1, searchValue = '') {
        let url = `/admin/materials?page=${page}`;
        if (searchValue && searchValue.trim() !== '') {
            url += `&search=${encodeURIComponent(searchValue.trim())}`;
        }
        api.get(url)
            .then(response => {
                setMaterials(response.data.data);
                setPagination(response.data);
            })
            .catch(() => {
                toast.error('Failed to fetch materials.');
            });
    }

    // Search Materials
    const handleSearch = (e) => {
        e.preventDefault();
        const value = e.target.search.value.trim();
        const params = new URLSearchParams(location.search);
        params.set('search', value);
        params.set('page', 1);
        window.history.pushState({}, '', `?${params.toString()}`);
        getMaterials(1, value);
    };

    // Edit Material
    function checkEditMaterial(id) {
        api.get(`/admin/edit_material/${id}`)
            .then(response => {
                setEditMaterial(response.data);
            })
            .catch(error => {
                toast.error(error.response?.data?.message || 'No information found.');
                setSubmitting(false);
            });
    }

    // Update Material
    function updateMaterial(e) {
        e.preventDefault();
        setSubmitting(true);
        const mid = document.getElementById('mid').value;
        const material = document.getElementById('material').value;
        const unit = document.getElementById('unit').value;
        api.post('/admin/update_material', { mid, material, unit })
            .then(response => {
                toast.success(response.data.message);
                setSubmitting(false);
                setEditMaterial(null)
                getMaterials();
            })
            .catch(error => {
                toast.error(error.response?.data?.message || 'Failed to update material.');
                setSubmitting(false);
            });
    }

    // Delete Material
    function handleDelete(){
        api.get(`/admin/delete_material/${deleteId}`)
            .then(response => {
                toast.success(response.data.message);
                getMaterials();
                setDeleteId(null);
            })
            .catch(error => {
                toast.error(error.response?.data?.message || 'Failed to delete material.');
                setDeleteId(null);
            });
    }

    // Clear Fields
    function clearFields() {
        document.getElementById('material').value = '';
        document.getElementById('unit').value = '';
    }

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const page = params.get('page') || 1;
        const urlSearch = params.get('search') || '';
        getMaterials(page, urlSearch);
        setSearch(urlSearch);
    }, [location.search]);

    return (
        <Layout>
            {!editMaterial && (
                <>
                    <h4 className='fw-bold'>Materials</h4>
                    <small className='d-inline-block opacity-75'>Manage registered materials</small>
                </>
            )}

            {editMaterial && (
                <>
                    <button onClick={() => setEditMaterial(null)} className='btn btn-transparent border-0 p-0 d-flex align-items-center fw-semibold'><IoIosArrowBack className='me-2'/>Turn back</button>
                </>
            )}

            {/* Edit Material */}
            {editMaterial && (
                <>
                    <div className="card rounded-4 mt-3">
                        <div className="card-header rounded-4">
                            <span className='fw-semibold'>Update Material <strong>#ID:{editMaterial.mid}</strong></span>
                        </div>
                        <div className="card-body">
                            <form method='post' onSubmit={updateMaterial}>
                                <input type="hidden" id='mid' name='mid' value={editMaterial.mid} required/>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6 col-lg-6">
                                        <label htmlFor="material" className="form-label">Material</label>
                                        <input type="text" defaultValue={editMaterial.material} className="form-control rounded-4 shadow-none" id="material" placeholder="Enter material name" />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-6">
                                        <label htmlFor="unit" className="form-label">Unit</label>
                                        <input type="text" defaultValue={editMaterial.unit} className="form-control rounded-4 shadow-none" id="unit" placeholder="Enter unit" />
                                    </div>
                                    
                                    <div className="col-12">
                                        {submitting ? (
                                            <button type='button' className="btn btn-success rounded-4 d-flex align-items-center gap-1" disabled><FaEdit /> Updating...</button>
                                        ) : (
                                            <button type='submit' className="btn btn-success rounded-4 d-flex align-items-center gap-1"><FaEdit /> Update Material</button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {/* Create Material */}
            {!editMaterial && (
                <>
                    <div className="card rounded-4 mt-3">
                        <div className="card-header rounded-4">
                            <span className='fw-semibold'>Register new Material</span>
                        </div>
                        <div className="card-body">
                            <form method='post' onSubmit={createMaterial}>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6 col-lg-6">
                                        <label htmlFor="material" className="form-label">Material</label>
                                        <input type="text" className="form-control rounded-4 shadow-none" id="material" placeholder="Enter material name" />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-6">
                                        <label htmlFor="unit" className="form-label">Unit</label>
                                        <input type="text" className="form-control rounded-4 shadow-none" id="unit" placeholder="Enter unit" />
                                    </div>
                                    
                                    <div className="col-12">
                                        {submitting ? (
                                            <button type='button' className="btn btn-success rounded-4 d-flex align-items-center gap-1" disabled><MdOutlineAddBox /> Creating...</button>
                                        ) : (
                                            <button type='submit' className="btn btn-success rounded-4 d-flex align-items-center gap-1"><MdOutlineAddBox /> Create Material</button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Materials List */}
                    <div className="card rounded-4 my-4">
                        <div className="card-header rounded-4">
                            <span className='fw-semibold'>Materials List</span>
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
                                            <th className='text-nowrap' scope="col">Material</th>
                                            <th className='text-nowrap' scope="col">Unit</th>
                                            <th className='text-end text-nowrap' scope="col">Operations</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {materials.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="text-center">No data to show...</td>
                                            </tr>
                                        ) : (
                                            materials.map((m, index) => (
                                                <tr key={m.mid}>
                                                    <td className='text-nowrap'>{m.mid}</td>
                                                    <td className='text-nowrap'>{m.material}</td>
                                                    <td className='text-nowrap'>{m.unit}</td>
                                                    <td className='text-end text-nowrap'>
                                                        <button onClick={() => checkEditMaterial(m.mid)} className="btn btn-success btn-sm shadow-sm me-2"><FaEdit size={20} /></button>
                                                        <button onClick={() => setDeleteId(m.mid)} className="btn btn-danger btn-sm shadow-sm"><MdDeleteOutline size={20} /></button>
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

                    {/* Delete Material */}
                    {deleteId && (
                        <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4 px-3" style={{ zIndex: 1050, width: '100%', maxWidth: '500px' }}>
                            <div className="bg-white shadow-lg rounded-4 p-3 border">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>Confirm deletion</strong>
                                        <p className="mb-0 small text-muted">Are you sure you want to delete this item with <strong>#ID: {deleteId}</strong>?</p>
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

export default Materials

