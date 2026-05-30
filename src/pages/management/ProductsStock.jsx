import { useEffect, useState } from 'react'
import Layout from '../../layouts/Layout'
import api from '../../api/axios'
import { toast } from 'react-toastify';
import Paginate from '../../components/Paginate';
import { FaSearch } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { BsBoxSeam } from 'react-icons/bs';

const BRAND = '#035dad'

const stockCfg = (qty) => {
    const n = Number(qty);
    if (n < 0)  return { backgroundColor: '#fee2e2', color: '#991b1b' };
    if (n === 0) return { backgroundColor: '#f3f4f6', color: '#6b7280' };
    if (n <= 10) return { backgroundColor: '#fef9c3', color: '#854d0e' };
    return              { backgroundColor: '#d1fae5', color: '#065f46' };
}

const ProductsStock = () => {
    const [productsStock, setProductsStock] = useState([]);
    const [pagination, setPagination] = useState({});
    const [search, setSearch] = useState('');
    const location = useLocation();

    // Read Products Stock
    function getProductsStock(page = 1, searchValue = '') {
        let url = `/admin/products_stock?page=${page}`;
        if (searchValue && searchValue.trim() !== '') {
            url += `&search=${encodeURIComponent(searchValue.trim())}`;
        }
        api.get(url)
            .then(response => {
                setProductsStock(response.data.data);
                setPagination(response.data);
            })
            .catch(() => toast.error('Failed to fetch products stock.'));
    }

    // Search Products Stock
    const handleSearch = (e) => {
        e.preventDefault();
        const value = e.target.search.value.trim();
        const params = new URLSearchParams(location.search);
        params.set('search', value);
        params.set('page', 1);
        window.history.pushState({}, '', `?${params.toString()}`);
        getProductsStock(1, value);
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const page = params.get('page') || 1;
        const urlSearch = params.get('search') || '';
        getProductsStock(page, urlSearch);
        setSearch(urlSearch);
    }, [location.search]);

    return (
        <Layout>
            {/* Header */}
            <div
                className="hero-banner d-flex justify-content-between align-items-center flex-wrap gap-3 px-4 py-4 mb-4"
            >
                <div>
                    <p className="mb-1 fw-semibold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.1em', color: BRAND }}>Inventory</p>
                    <h4 className="fw-bold mb-1">Products Stock</h4>
                    <small className="text-muted">Monitor current stock levels for all products.</small>
                </div>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.16)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BsBoxSeam size={22} />
                </div>
            </div>

            {/* List Card */}
            <div className="card rounded-4 border-0 shadow-sm mb-4">
                <div className="card-body px-4 pt-4">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                        <div>
                            <p className="fw-semibold mb-0">Stock Overview</p>
                            <small className="text-muted">{pagination.total || 0} products</small>
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
                                    placeholder="Search products..."
                                    style={{ fontSize: '0.875rem' }}
                                />
                            </div>
                        </form>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead>
                                <tr className="text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.06em', color: '#6b7280' }}>
                                    <th className="fw-semibold text-nowrap">#</th>
                                    <th className="fw-semibold text-nowrap">Product</th>
                                    <th className="fw-semibold text-nowrap text-end">Unit</th>
                                    <th className="fw-semibold text-nowrap text-end">Current Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productsStock.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center text-muted py-4">No data to show...</td>
                                    </tr>
                                ) : (
                                    productsStock.map((product) => (
                                        <tr key={product.pid}>
                                            <td className="text-nowrap text-muted small">#{product.pid}</td>
                                            <td className="text-nowrap fw-semibold">{product.product}</td>
                                            <td className="text-nowrap text-end text-muted">{product.unit}</td>
                                            <td className="text-nowrap text-end">
                                                <span
                                                    className="badge rounded-pill px-3 py-1"
                                                    style={{ fontSize: '0.78rem', fontWeight: 700, ...stockCfg(product.product_stock) }}
                                                >
                                                    {product.product_stock}
                                                </span>
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
        </Layout>
    )
}

export default ProductsStock
