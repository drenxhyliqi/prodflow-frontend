import { useEffect, useMemo, useState } from 'react';
import Layout from '../../../layouts/Layout';
import api from '../../../api/axios';
import { toast } from 'react-toastify';
import { MdOutlineAddBox } from 'react-icons/md';
import Paginate from '../../../components/Paginate';
import { FaSearch, FaTrash, FaSave } from 'react-icons/fa';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { IoIosArrowBack } from 'react-icons/io';

const BRAND    = '#035dad'
const inputCls = 'form-control shadow-none rounded-3'
const btnBrand = { backgroundColor: BRAND, color: '#fff', border: 'none' }

const fmtMoney = n => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const EditSales = () => {
    const { sale_number } = useParams();
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [clientName, setClientName] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [pagination, setPagination] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [loadingSale, setLoadingSale] = useState(true);
    const [search, setSearch] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const clientIsSelected = selectedClient !== '' || clientName.trim() !== '';

    // Total Price
    const saleTotal = useMemo(() => {
        return selectedProducts.reduce((sum, item) => sum + Number(item.total_price || 0), 0);
    }, [selectedProducts]);

    // Get Clients
    function getClients() {
        api.get('/admin/allClients')
            .then(response => setClients(response.data || []))
            .catch(() => toast.error('Failed to fetch clients.'));
    }

    // Get Products
    function getProducts(page = 1, searchValue = '') {
        let url = `/admin/products?page=${page}`;
        if (searchValue.trim() !== '') url += `&search=${encodeURIComponent(searchValue.trim())}`;
        api.get(url)
            .then(response => {
                setProducts(response.data.data || []);
                setPagination(response.data);
            })
            .catch(() => toast.error('Failed to fetch products.'));
    }

    // Get Sale
    function getSale() {
        setLoadingSale(true);
        api.get(`/admin/edit_sale/${sale_number}`)
            .then(response => {
                const res = response.data;
                const saleProducts =
                    Array.isArray(res) ? res :
                    Array.isArray(res.sale) ? res.sale :
                    Array.isArray(res.data) ? res.data :
                    Array.isArray(res.products) ? res.products :
                    res.product_id ? [res] : [];
                const firstRow = saleProducts[0] || res;
                setSelectedClient(firstRow?.client || '');
                setClientName('');
                const formattedProducts = saleProducts.map((item, index) => {
                    const id = item.product_id || item.products_id || item.pid;
                    return {
                        row_id: item.id || `${id}-${index}`,
                        product_id: Number(id),
                        product: item.product || item.product_name || item.name || `Product #${id}`,
                        qty: Number(item.qty || 1),
                        price: Number(item.price || 0),
                        total_price: Number(item.total_price || (Number(item.qty || 1) * Number(item.price || 0)))
                    };
                });
                setSelectedProducts(formattedProducts);
            })
            .catch(error => {
                console.log(error);
                toast.error('Failed to fetch sale informations.');
            })
            .finally(() => setLoadingSale(false));
    }

    // Search Products
    function handleSearch() {
        const params = new URLSearchParams();
        params.set('page', 1);
        if (search.trim() !== '') params.set('search', search.trim());
        navigate(`?${params.toString()}`);
    }

    // Select Product
    function handleProductCheck(e, product) {
        const product_id = Number(product.pid || product.id);
        if (e.target.checked) {
            setSelectedProducts(prev => {
                const exists = prev.some(item => Number(item.product_id) === product_id);
                if (exists) return prev;
                return [...prev, {
                    row_id: `new-${product_id}-${Date.now()}`,
                    product_id,
                    product: product.product,
                    qty: 1,
                    price: Number(product.price || 0),
                    total_price: Number(product.price || 0)
                }];
            });
        } else {
            setSelectedProducts(prev => prev.filter(item => Number(item.product_id) !== product_id));
        }
    }

    // QTY Change
    function handleQtyChange(row_id, qty) {
        setSelectedProducts(prev =>
            prev.map(item => {
                if (item.row_id === row_id) {
                    const newQty = Number(qty || 0);
                    const price = Number(item.price || 0);
                    return { ...item, qty, total_price: (newQty * price).toFixed(2) };
                }
                return item;
            })
        );
    }

    // Total Change
    function handleTotalChange(row_id, total_price) {
        setSelectedProducts(prev =>
            prev.map(item => item.row_id === row_id ? { ...item, total_price } : item)
        );
    }

    // Remove Product
    function removeProduct(row_id) {
        setSelectedProducts(prev => prev.filter(item => item.row_id !== row_id));
    }

    // Update Sale
    function updateSale(e) {
        e.preventDefault();
        setSubmitting(true);
        const productsData = selectedProducts.map(item => {
            const product_id = Number(item.product_id);
            if (isNaN(product_id) || product_id <= 0) {
                throw new Error(`Invalid product ID for ${item.product || 'Unknown'}`);
            }
            return {
                product_id,
                qty: Number(item.qty) || 1,
                price: Number(item.price) || 0,
                total_price: Number(item.total_price) || 0
            };
        });
        const payload = {
            client: clientName.trim() || selectedClient,
            total_price: Number(saleTotal),
            products: productsData
        };
        console.log('Sending payload:', payload);
        api.post(`/admin/update_sale/${sale_number}`, payload)
            .then(response => {
                toast.success(response.data.message || 'Sale updated successfully.');
                navigate('/sales');
            })
            .catch(error => {
                console.log('Error response:', error.response?.data);
                toast.error(error.response?.data?.message || 'Failed to update sale.');
            })
            .finally(() => setSubmitting(false));
    }

    useEffect(() => {
        getClients();
        getSale();
    }, [sale_number]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const page = params.get('page') || 1;
        const urlSearch = params.get('search') || '';
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
                    <h4 className="fw-bold mb-1">Edit Sale #{sale_number}</h4>
                    <small className="text-muted">Edit client, products, quantity and totals.</small>
                </div>
            </div>

            {loadingSale ? (
                <div className="card rounded-4 border-0 shadow-sm">
                    <div className="card-body text-center text-muted py-5">Loading sale...</div>
                </div>
            ) : (
                <form method="post" onSubmit={updateSale}>
                    {/* Client Card */}
                    <div className="card rounded-4 border-0 shadow-sm mb-4">
                        <div className="card-header rounded-top-4 border-0 py-3 px-4" style={{ background: BRAND + '10' }}>
                            <span className="fw-semibold" style={{ color: BRAND }}>Edit Client</span>
                        </div>
                        <div className="card-body px-4 pb-4">
                            <div className="row g-3">
                                <div className="col-12 col-md-6 col-lg-4">
                                    <label className="form-label fw-semibold small">Select Client</label>
                                    <select
                                        id="clientSelect"
                                        className="form-select shadow-none rounded-3"
                                        value={selectedClient}
                                        onChange={(e) => { setSelectedClient(e.target.value); setClientName(''); }}
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
                                        onChange={(e) => { setClientName(e.target.value); setSelectedClient(''); }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {clientIsSelected && (
                        <>
                            {/* Selected Products */}
                            <div className="card rounded-4 border-0 shadow-sm mb-4">
                                <div className="card-header rounded-top-4 border-0 py-3 px-4 d-flex justify-content-between align-items-center" style={{ background: BRAND + '10' }}>
                                    <span className="fw-semibold" style={{ color: BRAND }}>Selected Products</span>
                                    <span className="fw-bold" style={{ color: BRAND }}>Total: {fmtMoney(saleTotal)} €</span>
                                </div>
                                <div className="card-body px-4 pb-4">
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle">
                                            <thead>
                                                <tr className="text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.06em', color: '#6b7280' }}>
                                                    <th className="fw-semibold">Product</th>
                                                    <th className="fw-semibold text-end text-nowrap" style={{ width: 140 }}>Price (€)</th>
                                                    <th className="fw-semibold text-end text-nowrap" style={{ width: 130 }}>QTY</th>
                                                    <th className="fw-semibold text-end text-nowrap" style={{ width: 140 }}>Total (€)</th>
                                                    <th className="fw-semibold text-center text-nowrap" style={{ width: 90 }}>Remove</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedProducts.length === 0 ? (
                                                    <tr><td colSpan="5" className="text-center text-muted py-4">No products selected</td></tr>
                                                ) : (
                                                    selectedProducts.map((item, index) => (
                                                        <tr key={index}>
                                                            <td className="fw-semibold">{item.product || `Product #${item.product_id}`}</td>
                                                            <td className="text-end text-muted">{fmtMoney(item.price)} €</td>
                                                            <td>
                                                                <input
                                                                    type="number" min="1"
                                                                    className={inputCls + ' text-end'}
                                                                    value={item.qty}
                                                                    onChange={(e) => handleQtyChange(item.row_id, e.target.value)}
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number" min="0" step="0.01"
                                                                    className={inputCls + ' text-end'}
                                                                    value={item.total_price}
                                                                    onChange={(e) => handleTotalChange(item.row_id, e.target.value)}
                                                                />
                                                            </td>
                                                            <td className="text-center">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm"
                                                                    style={{ color: '#ef4444', background: '#ef444412' }}
                                                                    onClick={() => removeProduct(item.row_id)}
                                                                >
                                                                    <FaTrash size={13} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="d-flex justify-content-end mt-3">
                                        <button
                                            type="submit"
                                            className="btn rounded-3 d-flex align-items-center gap-2 fw-semibold px-4"
                                            style={btnBrand}
                                            disabled={submitting}
                                        >
                                            <FaSave size={14} />
                                            {submitting ? 'Updating...' : 'Update Sale'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Add More Products */}
                            <div className="card rounded-4 border-0 shadow-sm mb-4">
                                <div className="card-header rounded-top-4 border-0 py-3 px-4 d-flex justify-content-between align-items-center" style={{ background: BRAND + '10' }}>
                                    <span className="fw-semibold" style={{ color: BRAND }}>Add More Products</span>
                                    <div className="input-group" style={{ maxWidth: 260 }}>
                                        <span className="input-group-text bg-white border-end-0 rounded-start-3">
                                            <FaSearch className="text-muted" size={12} />
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
                                            <FaSearch size={11} />
                                        </button>
                                    </div>
                                </div>
                                <div className="card-body px-4 pb-4">
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle">
                                            <thead>
                                                <tr className="text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.06em', color: '#6b7280' }}>
                                                    <th className="fw-semibold" style={{ width: 60 }}>Select</th>
                                                    <th className="fw-semibold">Product</th>
                                                    <th className="fw-semibold">Price</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {products.length === 0 ? (
                                                    <tr><td colSpan="3" className="text-center text-muted py-4">No products found...</td></tr>
                                                ) : (
                                                    products.map((p, index) => {
                                                        const product_id = Number(p.pid || p.id);
                                                        const isSelected = selectedProducts.some(item => Number(item.product_id) === product_id);
                                                        return (
                                                            <tr key={product_id || index} style={{ background: isSelected ? BRAND + '06' : undefined }}>
                                                                <td>
                                                                    <input
                                                                        type="checkbox"
                                                                        className="form-check-input shadow-none"
                                                                        checked={isSelected}
                                                                        onChange={(e) => handleProductCheck(e, { ...p, pid: product_id })}
                                                                    />
                                                                </td>
                                                                <td className="fw-semibold">{p.product}</td>
                                                                <td className="text-muted">{fmtMoney(p.price || 0)} €</td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Paginate data={pagination} />
                                </div>
                            </div>
                        </>
                    )}
                </form>
            )}
        </Layout>
    );
};

export default EditSales;
