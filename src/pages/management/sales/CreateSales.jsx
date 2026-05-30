import { useEffect, useState } from 'react';
import Layout from '../../../layouts/Layout';
import api from '../../../api/axios';
import { toast } from 'react-toastify';
import { MdOutlineAddBox } from 'react-icons/md';
import Paginate from '../../../components/Paginate';
import { FaSearch } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IoIosArrowBack } from 'react-icons/io';

const BRAND    = '#035dad'
const inputCls = 'form-control shadow-none rounded-3'
const btnBrand = { backgroundColor: BRAND, color: '#fff', border: 'none' }

const fmtMoney = n => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CreateSales = () => {
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [clientName, setClientName] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [pagination, setPagination] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const clientIsSelected = selectedClient !== '' || clientName.trim() !== '';

    // Read Clients
    function getClients() {
        api.get('/admin/allClients')
            .then(response => setClients(response.data || []))
            .catch(() => toast.error('Failed to fetch clients.'));
    }

    // Read Products
    function getProducts(page = 1, searchValue = '') {
        let url = `/admin/products?page=${page}`;
        if (searchValue.trim() !== '') {
            url += `&search=${encodeURIComponent(searchValue.trim())}`;
        }
        api.get(url)
            .then(response => {
                setProducts(response.data.data || []);
                setPagination(response.data);
            })
            .catch(() => toast.error('Failed to fetch products.'));
    }

    // Search Products
    function handleSearch() {
        const params = new URLSearchParams();
        params.set('page', 1);
        if (search.trim() !== '') params.set('search', search.trim());
        navigate(`?${params.toString()}`);
    }

    // Product Selection
    function handleProductCheck(e, product) {
        const products_id = product.pid || product.id;
        if (e.target.checked) {
            setSelectedProducts(prev => [...prev, { products_id, qty: 1 }]);
        } else {
            setSelectedProducts(prev => prev.filter(item => item.products_id !== products_id));
        }
    }

    // Products QTY
    function handleQtyChange(product, qty) {
        const products_id = product.pid || product.id;
        setSelectedProducts(prev =>
            prev.map(item => item.products_id === products_id ? { ...item, qty: Number(qty) } : item)
        );
    }

    // Create Sale
    function createSale(e) {
        e.preventDefault();
        setSubmitting(true);
        api.post('/admin/create_sale', {
            client: clientName.trim() || selectedClient,
            products_id: selectedProducts
        })
        .then(response => {
            toast.success(response.data.message || 'Sale created successfully.');
            clearFields();
        })
        .catch(error => toast.error(error.response?.data?.message || 'Failed to create sale.'))
        .finally(() => setSubmitting(false));
    }

    function clearFields() {
        setSelectedClient('');
        setClientName('');
        setSelectedProducts([]);
    }

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const page = params.get('page') || 1;
        const urlSearch = params.get('search') || '';
        getClients();
        getProducts(page, urlSearch);
        setSearch(urlSearch);
    }, [location.search]);

    return (
        <Layout>
            {/* Back button */}
            <Link to="/sales" className="btn btn-transparent border-0 p-0 d-flex align-items-center fw-semibold mb-3">
                <IoIosArrowBack className="me-2" />Turn back
            </Link>

            {/* Header */}
            <div
                className="hero-banner d-flex align-items-center flex-wrap gap-3 px-4 py-4 mb-4"
            >
                <div>
                    <p className="mb-1 fw-semibold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.1em', color: BRAND }}>Finance</p>
                    <h4 className="fw-bold mb-1">Create New Sale</h4>
                    <small className="text-muted">Select a client and products to register a new sale.</small>
                </div>
            </div>

            <form method="post" onSubmit={createSale}>
                {/* Client Selection */}
                <div className="card rounded-4 border-0 shadow-sm mb-4">
                    <div className="card-header rounded-top-4 border-0 py-3 px-4" style={{ background: BRAND + '10' }}>
                        <span className="fw-semibold" style={{ color: BRAND }}>Choose Client</span>
                    </div>
                    <div className="card-body px-4 pb-4">
                        <div className="row g-3">
                            <div className="col-12 col-md-6 col-lg-4">
                                <label className="form-label fw-semibold small">Select Client</label>
                                <select
                                    id="clientSelect"
                                    className="form-select shadow-none rounded-3"
                                    value={selectedClient}
                                    onChange={(e) => {
                                        setSelectedClient(e.target.value);
                                        setClientName('');
                                        setSelectedProducts([]);
                                    }}
                                >
                                    <option value="">{clients.length === 0 ? '— No clients —' : '— Select Client —'}</option>
                                    {clients.map((c, index) => (
                                        <option key={c.id || index} value={c.client}>{c.client}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-12 col-md-6 col-lg-4">
                                <label className="form-label fw-semibold small">Or enter name manually</label>
                                <input
                                    type="text"
                                    className={inputCls}
                                    id="clientName"
                                    placeholder="Enter client name"
                                    value={clientName}
                                    onChange={(e) => {
                                        setClientName(e.target.value);
                                        setSelectedClient('');
                                        setSelectedProducts([]);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Selection */}
                {clientIsSelected && (
                    <div className="card rounded-4 border-0 shadow-sm mb-4">
                        <div className="card-header rounded-top-4 border-0 py-3 px-4 d-flex justify-content-between align-items-center" style={{ background: BRAND + '10' }}>
                            <span className="fw-semibold" style={{ color: BRAND }}>Choose Products</span>
                            <span className="badge rounded-pill px-3 py-1" style={{ fontSize: '0.72rem', backgroundColor: BRAND + '18', color: BRAND }}>
                                {selectedProducts.length} selected
                            </span>
                        </div>
                        <div className="card-body px-4 pb-4">
                            {/* Search */}
                            <div className="d-flex justify-content-end mb-3">
                                <div className="input-group" style={{ maxWidth: 280 }}>
                                    <span className="input-group-text bg-white border-end-0 rounded-start-3">
                                        <FaSearch className="text-muted" size={13} />
                                    </span>
                                    <input
                                        type="search"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
                                        className="form-control border-start-0 shadow-none rounded-end-3"
                                        placeholder="Search product..."
                                        style={{ fontSize: '0.875rem' }}
                                    />
                                    <button className="btn btn-sm ms-2 rounded-3" type="button" onClick={handleSearch} style={btnBrand}>
                                        <FaSearch size={12} />
                                    </button>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead>
                                        <tr className="text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.06em', color: '#6b7280' }}>
                                            <th className="text-nowrap fw-semibold" style={{ width: 60 }}>Select</th>
                                            <th className="text-nowrap fw-semibold">Product</th>
                                            <th className="text-nowrap fw-semibold">Price</th>
                                            <th className="text-nowrap fw-semibold text-end" style={{ width: 140 }}>QTY</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.length === 0 ? (
                                            <tr><td colSpan="4" className="text-center text-muted py-4">No products found...</td></tr>
                                        ) : (
                                            products.map((p, index) => {
                                                const products_id = p.pid || p.id;
                                                const isSelected = selectedProducts.some(item => item.products_id === products_id);
                                                const selectedProduct = selectedProducts.find(item => item.products_id === products_id);
                                                return (
                                                    <tr key={products_id || index} style={{ background: isSelected ? BRAND + '06' : undefined }}>
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input shadow-none"
                                                                checked={isSelected}
                                                                onChange={(e) => handleProductCheck(e, p)}
                                                            />
                                                        </td>
                                                        <td className="text-nowrap fw-semibold">{p.product}</td>
                                                        <td className="text-nowrap text-muted">{fmtMoney(p.price)} €</td>
                                                        <td className="text-nowrap text-end" style={{ width: 140 }}>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                className={inputCls + ' text-end'}
                                                                placeholder="QTY"
                                                                disabled={!isSelected}
                                                                value={selectedProduct?.qty || ''}
                                                                onChange={(e) => handleQtyChange(p, e.target.value)}
                                                                style={{ width: 100 }}
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="d-flex justify-content-between align-items-center mt-3">
                                <Paginate data={pagination} />
                                <button
                                    type="submit"
                                    className="btn rounded-3 d-flex align-items-center gap-2 fw-semibold px-4"
                                    style={btnBrand}
                                    disabled={submitting || selectedProducts.length === 0}
                                >
                                    <MdOutlineAddBox size={18} />
                                    {submitting ? 'Creating...' : 'Create Sale'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </Layout>
    );
};

export default CreateSales;
