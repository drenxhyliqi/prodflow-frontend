import React, { useEffect, useState } from 'react';
import Layout from '../../layouts/Layout';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { MdOutlineAddBox, MdDeleteOutline } from 'react-icons/md';
import Paginate from '../../components/Paginate';
import { FaSearch, FaEdit } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { LiaFileInvoiceDollarSolid } from 'react-icons/lia';

const Sales = () => {
    const [sales, setSales] = useState([]);
    const [deleteId, setDeleteId] = useState(null);
    const [pagination, setPagination] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const location = useLocation();

    // Read Sales
    function getSales(page = 1, searchValue = '') {
        let url = `/admin/sales?page=${page}`;
        if (searchValue && searchValue.trim() !== '') {
            url += `&search=${encodeURIComponent(searchValue.trim())}`;
        }
        api.get(url)
            .then(response => {
                setSales(response.data.data || []);
                setPagination(response.data);
            })
            .catch(() => {
                toast.error('Failed to fetch sales.');
            });
    }

    // Delete Sale
    function handleDelete() {
        api.get(`/admin/delete_sale/${deleteId}`)
            .then(response => {
                toast.success(response.data.message);
                getSales();
                setDeleteId(null);
            })
            .catch(error => {
                toast.error(error.response?.data?.message || 'Failed to delete sale.');
                setDeleteId(null);
            });
    }

    // Search Sales
    const handleSearch = (e) => {
        e.preventDefault();
        const value = e.target.search.value.trim();
        const params = new URLSearchParams(location.search);
        params.set('search', value);
        params.set('page', 1);
        window.history.pushState({}, '', `?${params.toString()}`);
        getSales(1, value);
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const page = params.get('page') || 1;
        const urlSearch = params.get('search') || '';
        getSales(page, urlSearch);
        setSearch(urlSearch);
    }, [location.search]);

    return (
        <Layout>
            <div className="row align-items-center">
                <div className="col-8 col-md-9 col-lg-6">
                    <h4 className="fw-bold">Sales</h4>
                    <small className="d-inline-block opacity-75">
                        Manage registered sales by company
                    </small>
                </div>
                <div className="col-4 col-md-3 col-lg-6 text-end">
                    <Link to='/create-sales' className='btn btn-primary rounded-4 d-inline-flex align-items-center'><MdOutlineAddBox className='me-1' size={20}/> Create Sale</Link>
                </div>
            </div>

            {/* Sales List */}
            <div className="card rounded-4 my-4">
                <div className="card-header rounded-4">
                    <span className="fw-semibold">Sales List</span>
                </div>
                <div className="card-body">
                    <div className="mb-3">
                        <form onSubmit={handleSearch}>
                            <div className="input-group mb-3">
                                <input type="search" name="search" defaultValue={search} className="form-control rounded-start-4 shadow-none" placeholder="Search..."/>
                                <button className="btn btn-primary rounded-end-4" type="submit"><FaSearch /></button>
                            </div>
                        </form>
                    </div>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th className="text-nowrap">#</th>
                                    <th className="text-nowrap">Client</th>
                                    <th className="text-nowrap">Date</th>
                                    <th className="text-end text-nowrap">Operations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center">
                                            No data to show...
                                        </td>
                                    </tr>
                                ) : (
                                    sales.map((sale) => (
                                        <tr key={sale.sale_number}>
                                            <td className="text-nowrap">{sale.sale_number}</td>
                                            <td className="text-nowrap">{sale.client}</td>
                                            <td className="text-nowrap">
                                                {sale.date
                                                    ? new Date(sale.date).toLocaleDateString('en-GB', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                    })
                                                : '-'}
                                            </td>
                                            <td className="text-end text-nowrap">
                                                <Link to={`/invoice/${sale.sale_number}`} className="btn btn-primary btn-sm shadow-sm me-2"><LiaFileInvoiceDollarSolid size={20} /></Link>
                                                <button onClick={() => checkEditCompany(company.cid)} className="btn btn-success btn-sm shadow-sm me-2"><FaEdit size={20} /></button>
                                                <button type="button" onClick={() => setDeleteId(sale.sale_number)} className="btn btn-danger btn-sm shadow-sm"><MdDeleteOutline size={20} /></button>
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

            {/* Delete Sale */}
            {deleteId && (
                <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4 px-3" style={{ zIndex: 1050, width: '100%', maxWidth: '500px' }}>
                    <div className="bg-white shadow-lg rounded-4 p-3 border">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>Confirm deletion</strong>
                                <p className="mb-0 small text-muted">Are you sure you want to delete this company with <strong>#ID: {deleteId}</strong>?</p>
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
        </Layout>
    );
};

export default Sales;