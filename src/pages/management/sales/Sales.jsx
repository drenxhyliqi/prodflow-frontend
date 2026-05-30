import { useEffect, useState } from 'react';
import Layout from '../../../layouts/Layout';
import api from '../../../api/axios';
import { toast } from 'react-toastify';
import { MdOutlineAddBox, MdDeleteOutline } from 'react-icons/md';
import Paginate from '../../../components/Paginate';
import { FaSearch, FaEdit } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { LiaFileInvoiceDollarSolid } from 'react-icons/lia';

const BRAND    = '#035dad'
const btnBrand = { backgroundColor: BRAND, color: '#fff', border: 'none' }

const Sales = () => {
    const [sales, setSales] = useState([]);
    const [deleteId, setDeleteId] = useState(null);
    const [pagination, setPagination] = useState({});
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
            .catch(() => toast.error('Failed to fetch sales.'));
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
            {/* Header */}
            <div
                className="hero-banner d-flex justify-content-between align-items-center flex-wrap gap-3 px-4 py-4 mb-4"
            >
                <div>
                    <p className="mb-1 fw-semibold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.1em', color: BRAND }}>Finance</p>
                    <h4 className="fw-bold mb-1">Sales Overview</h4>
                    <small className="text-muted">Manage registered sales by company.</small>
                </div>
                <Link
                    to="/createSale"
                    className="btn rounded-pill d-flex align-items-center gap-2 fw-semibold px-4 py-2"
                    style={btnBrand}
                >
                    <MdOutlineAddBox size={18} /> Create Sale
                </Link>
            </div>

            {/* Sales List */}
            <div className="card rounded-4 border-0 shadow-sm mb-4">
                <div className="card-body px-4 pt-4">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                        <div>
                            <p className="fw-semibold mb-0">Sales List</p>
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
                                    placeholder="Search sales..."
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
                                    <th className="text-nowrap fw-semibold">Client</th>
                                    <th className="text-nowrap fw-semibold">Date</th>
                                    <th className="text-end text-nowrap fw-semibold">Operations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center text-muted py-4">No data to show...</td>
                                    </tr>
                                ) : (
                                    sales.map((sale) => (
                                        <tr key={sale.sale_number}>
                                            <td className="text-nowrap text-muted small">#{sale.sale_number}</td>
                                            <td className="text-nowrap fw-semibold">{sale.client}</td>
                                            <td className="text-nowrap text-muted">
                                                {sale.date
                                                    ? new Date(sale.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                                    : '—'}
                                            </td>
                                            <td className="text-end text-nowrap">
                                                <Link
                                                    to={`/salesInvoice/${sale.sale_number}`}
                                                    className="btn btn-sm me-1"
                                                    style={{ color: '#7c3aed', background: '#7c3aed12' }}
                                                >
                                                    <LiaFileInvoiceDollarSolid size={17} />
                                                </Link>
                                                <Link
                                                    to={`/editSale/${sale.sale_number}`}
                                                    className="btn btn-sm me-1"
                                                    style={{ color: BRAND, background: BRAND + '12' }}
                                                >
                                                    <FaEdit size={14} />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteId(sale.sale_number)}
                                                    className="btn btn-sm"
                                                    style={{ color: '#ef4444', background: '#ef444412' }}
                                                >
                                                    <MdDeleteOutline size={17} />
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
                                <p className="mb-0 small text-muted">Are you sure you want to delete sale <strong>#ID: {deleteId}</strong>?</p>
                            </div>
                            <button className="btn-close ms-2 shadow-none" onClick={() => setDeleteId(null)} />
                        </div>
                        <div className="d-flex justify-content-end mt-3 gap-2">
                            <button className="btn btn-light rounded-3" onClick={() => setDeleteId(null)}>Cancel</button>
                            <button className="btn btn-danger rounded-3" onClick={handleDelete} disabled={submitting}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Sales;
