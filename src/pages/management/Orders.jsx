import { useEffect, useMemo, useState } from 'react';
import Layout from '../../layouts/Layout';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { MdDeleteOutline, MdOutlineAddBox } from 'react-icons/md';
import Paginate from '../../components/Paginate';
import { FaSearch, FaEdit, FaTimes, FaSave, FaExchangeAlt } from 'react-icons/fa';

const BRAND    = '#035dad'
const inputCls = 'form-control shadow-none rounded-3'
const btnBrand = { backgroundColor: BRAND, color: '#fff', border: 'none' }

const statusCfg = (status) => {
    if (status === 'completed') return { backgroundColor: '#d1fae5', color: '#065f46' }
    if (status === 'cancelled') return { backgroundColor: '#fee2e2', color: '#991b1b' }
    return { backgroundColor: '#fef9c3', color: '#854d0e' }
}

const Orders = () => {
    const emptyForm = {
        order_number: '',
        client: '',
        products_id: []
    };

    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({});
    const [search, setSearch] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [editingOrder, setEditingOrder] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [products, setProducts] = useState([]);
    const [clients, setClients] = useState([]);

    function getOrders(page = 1, searchValue = '') {
        let url = `/admin/orders?page=${page}`;
        if (searchValue && searchValue.trim() !== '') {
            url += `&search=${encodeURIComponent(searchValue.trim())}`;
        }
        api.get(url)
            .then((response) => {
                setOrders(response.data.data || []);
                setPagination(response.data);
            })
            .catch(() => toast.error('Failed to fetch orders.'));
    }

    async function getAllProducts() {
        try {
            let currentPage = 1;
            let lastPage = 1;
            let allProducts = [];
            do {
                const response = await api.get(`/admin/products?page=${currentPage}`);
                const payload = response.data;
                allProducts = [...allProducts, ...(payload.data || [])];
                lastPage = payload.last_page || 1;
                currentPage += 1;
            } while (currentPage <= lastPage);
            setProducts(allProducts);
        } catch {
            toast.error('Failed to fetch products.');
        }
    }

    function getClients() {
        api.get('/admin/allClients')
            .then((response) => setClients(response.data || []))
            .catch(() => toast.error('Failed to fetch clients.'));
    }

    function resetForm() {
        setEditingOrder(null);
        setForm(emptyForm);
    }

    function handleSearch(e) {
        e.preventDefault();
        getOrders(1, search);
    }

    function handleClientChange(e) {
        setForm((prev) => ({ ...prev, client: e.target.value }));
    }

    function toggleProduct(productId, checked) {
        setForm((prev) => {
            if (checked) {
                return { ...prev, products_id: [...prev.products_id, { products_id: Number(productId), qty: 1 }] };
            }
            return { ...prev, products_id: prev.products_id.filter((item) => Number(item.products_id) !== Number(productId)) };
        });
    }

    function handleQtyChange(productId, qty) {
        setForm((prev) => ({
            ...prev,
            products_id: prev.products_id.map((item) =>
                Number(item.products_id) === Number(productId) ? { ...item, qty: Number(qty) } : item
            )
        }));
    }

    function isChecked(productId) {
        return form.products_id.some((item) => Number(item.products_id) === Number(productId));
    }

    function getSelectedQty(productId) {
        const found = form.products_id.find((item) => Number(item.products_id) === Number(productId));
        return found ? found.qty : 1;
    }

    function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        const payload = {
            client: form.client,
            products_id: form.products_id.map((item) => ({ products_id: Number(item.products_id), qty: Number(item.qty) }))
        };
        const request = editingOrder
            ? api.post('/admin/update_order', { order_number: form.order_number, ...payload })
            : api.post('/admin/create_order', payload);
        request
            .then((response) => {
                toast.success(response.data.message || (editingOrder ? 'Order updated successfully.' : 'Order created successfully.'));
                resetForm();
                getOrders(pagination.current_page || 1, search);
            })
            .catch((error) => toast.error(error.response?.data?.message || 'Failed to save order.'))
            .finally(() => setSubmitting(false));
    }

    function handleEdit(orderNumber) {
        api.get(`/admin/edit_order/${orderNumber}`)
            .then((response) => {
                const data = response.data;
                setEditingOrder(orderNumber);
                setForm({
                    order_number: data.order_number,
                    client: data.client,
                    products_id: (data.items || []).map((item) => ({ products_id: Number(item.product_id), qty: Number(item.qty) }))
                });
                window.scrollTo({ top: 0, behavior: 'smooth' });
            })
            .catch(() => toast.error('Failed to fetch order details.'));
    }

    function handleDelete() {
        if (!deleteId) return;
        setSubmitting(true);
        api.get(`/admin/delete_order/${deleteId}`)
            .then((response) => {
                toast.success(response.data.message || 'Order deleted successfully.');
                setDeleteId(null);
                getOrders(pagination.current_page || 1, search);
            })
            .catch((error) => {
                toast.error(error.response?.data?.message || 'Failed to delete order.');
                setDeleteId(null);
            })
            .finally(() => setSubmitting(false));
    }

    function handleConvert(orderNumber) {
        setSubmitting(true);
        api.post(`/admin/convert_order_to_sale/${orderNumber}`)
            .then((response) => {
                toast.success(response.data.message || 'Order converted successfully.');
                getOrders(pagination.current_page || 1, search);
            })
            .catch((error) => toast.error(error.response?.data?.message || 'Failed to convert order.'))
            .finally(() => setSubmitting(false));
    }

    const selectedCount = useMemo(() => form.products_id.length, [form.products_id]);

    useEffect(() => {
        getOrders();
        getClients();
        getAllProducts();
    }, []);

    return (
        <Layout>
            {/* Header */}
            <div
                className="hero-banner d-flex justify-content-between align-items-center flex-wrap gap-3 px-4 py-4 mb-4"
            >
                <div>
                    <p className="mb-1 fw-semibold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.1em', color: BRAND }}>Sales</p>
                    <h4 className="fw-bold mb-1">Orders Overview</h4>
                    <small className="text-muted">Create, edit and manage orders in one place.</small>
                </div>
                <button
                    className="btn rounded-pill d-flex align-items-center gap-2 fw-semibold px-4 py-2"
                    style={btnBrand}
                    onClick={() => document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                    <MdOutlineAddBox size={18} /> New Order
                </button>
            </div>

            {/* Create / Edit Form */}
            <div id="order-form" className="card rounded-4 border-0 shadow-sm mb-4">
                <div className="card-body px-4 pt-4 pb-3">
                    {/* Form header */}
                    <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                        <div className="d-flex align-items-center gap-3">
                            <div style={{
                                width: 36, height: 36, borderRadius: 10,
                                background: BRAND + '18', color: BRAND,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                            }}>
                                <MdOutlineAddBox />
                            </div>
                            <div>
                                <p className="fw-semibold mb-0">
                                    {editingOrder ? `Edit Order #${editingOrder}` : 'Create new Order'}
                                </p>
                                <small className="text-muted">
                                    {editingOrder ? 'Modify the order details below' : 'Fill in the details to place a new order'}
                                </small>
                            </div>
                        </div>
                        {editingOrder && (
                            <button
                                type="button"
                                className="btn btn-light btn-sm rounded-3 d-flex align-items-center gap-1"
                                onClick={resetForm}
                            >
                                <FaTimes size={12} /> Cancel Edit
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-12 col-md-6">
                                <label className="form-label fw-semibold small">Client</label>
                                <select
                                    className="form-select shadow-none rounded-3"
                                    value={form.client}
                                    onChange={handleClientChange}
                                    required
                                >
                                    <option value="">Select client</option>
                                    {clients.map((client) => (
                                        <option key={client.cid} value={client.client}>{client.client}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <label className="form-label fw-semibold small mb-0">Products</label>
                                <span className="badge rounded-pill px-3 py-1" style={{ fontSize: '0.72rem', backgroundColor: BRAND + '18', color: BRAND }}>
                                    {selectedCount} selected
                                </span>
                            </div>

                            <div className="border rounded-3 p-3" style={{ borderColor: '#e5e7eb' }}>
                                {products.length === 0 ? (
                                    <p className="mb-0 text-muted small">No products found...</p>
                                ) : (
                                    <div className="row g-2">
                                        {products.map((product) => {
                                            const checked = isChecked(product.pid);
                                            return (
                                                <div className="col-12" key={product.pid}>
                                                    <div
                                                        className="d-flex align-items-center justify-content-between flex-wrap gap-3 rounded-3 px-3 py-2"
                                                        style={{
                                                            border: `1px solid ${checked ? BRAND + '40' : '#f1f5f9'}`,
                                                            background: checked ? BRAND + '08' : '#fafafa',
                                                            transition: 'all 0.15s',
                                                        }}
                                                    >
                                                        <div className="form-check mb-0">
                                                            <input
                                                                className="form-check-input shadow-none"
                                                                type="checkbox"
                                                                id={`product-${product.pid}`}
                                                                checked={checked}
                                                                onChange={(e) => toggleProduct(product.pid, e.target.checked)}
                                                            />
                                                            <label className="form-check-label ms-2" htmlFor={`product-${product.pid}`}>
                                                                <span className="fw-semibold" style={{ fontSize: '0.875rem' }}>{product.product}</span>
                                                                <span className="text-muted ms-2" style={{ fontSize: '0.8rem' }}>
                                                                    {product.unit} — ${Number(product.price).toFixed(2)}
                                                                </span>
                                                            </label>
                                                        </div>
                                                        {checked && (
                                                            <div style={{ width: '110px' }}>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    className={inputCls}
                                                                    style={{ fontSize: '0.875rem' }}
                                                                    value={getSelectedQty(product.pid)}
                                                                    onChange={(e) => handleQtyChange(product.pid, e.target.value)}
                                                                    required
                                                                    placeholder="Qty"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="d-flex justify-content-end mt-4">
                            <button
                                type="submit"
                                className="btn rounded-3 d-flex align-items-center gap-2 fw-semibold px-4"
                                style={btnBrand}
                                disabled={submitting || !form.client || form.products_id.length === 0}
                            >
                                <FaSave size={14} />
                                {editingOrder
                                    ? (submitting ? 'Updating...' : 'Update Order')
                                    : (submitting ? 'Creating...' : 'Create Order')
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Orders List */}
            <div className="card rounded-4 border-0 shadow-sm mb-4">
                <div className="card-body px-4 pt-4">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                        <div>
                            <p className="fw-semibold mb-0">Orders List</p>
                            <small className="text-muted">{pagination.total || 0} entries</small>
                        </div>
                        <form onSubmit={handleSearch} style={{ minWidth: 220 }}>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0 rounded-start-3">
                                    <FaSearch className="text-muted" size={13} />
                                </span>
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="form-control border-start-0 shadow-none rounded-end-3"
                                    placeholder="Search orders..."
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
                                    <th className="text-nowrap fw-semibold">Status</th>
                                    <th className="text-nowrap fw-semibold">Sale</th>
                                    <th className="text-nowrap fw-semibold">Date</th>
                                    <th className="text-nowrap fw-semibold">Total</th>
                                    <th className="text-end text-nowrap fw-semibold">Operations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 ? (
                                    <tr><td colSpan="7" className="text-center text-muted py-4">No data to show...</td></tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order.order_number}>
                                            <td className="text-nowrap text-muted small">#{order.order_number}</td>
                                            <td className="text-nowrap fw-semibold">{order.client}</td>
                                            <td className="text-nowrap">
                                                <span className="badge rounded-pill px-3 py-1" style={{ fontSize: '0.72rem', ...statusCfg(order.status) }}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="text-nowrap text-muted">{order.sale_number || '—'}</td>
                                            <td className="text-nowrap text-muted">
                                                {order.date
                                                    ? new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                                    : '—'}
                                            </td>
                                            <td className="text-nowrap fw-semibold">
                                                ${Number(order.grand_total || 0).toFixed(2)}
                                            </td>
                                            <td className="text-end text-nowrap">
                                                {order.status === 'pending' && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEdit(order.order_number)}
                                                            className="btn btn-sm me-1"
                                                            style={{ color: BRAND, background: BRAND + '12' }}
                                                        >
                                                            <FaEdit size={14} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleConvert(order.order_number)}
                                                            className="btn btn-sm me-1"
                                                            style={{ color: '#d97706', background: '#fef3c712' }}
                                                            disabled={submitting}
                                                            title="Convert to sale"
                                                        >
                                                            <FaExchangeAlt size={13} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeleteId(order.order_number)}
                                                            className="btn btn-sm"
                                                            style={{ color: '#ef4444', background: '#ef444412' }}
                                                        >
                                                            <MdDeleteOutline size={17} />
                                                        </button>
                                                    </>
                                                )}
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
                                <p className="mb-0 small text-muted">Are you sure you want to delete order <strong>#ID: {deleteId}</strong>?</p>
                            </div>
                            <button className="btn-close ms-2 shadow-none" onClick={() => setDeleteId(null)} />
                        </div>
                        <div className="d-flex justify-content-end mt-3 gap-2">
                            <button className="btn btn-light rounded-3" onClick={() => setDeleteId(null)}>Cancel</button>
                            <button className="btn btn-danger rounded-3" onClick={handleDelete} disabled={submitting}>
                                {submitting ? 'Deleting...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Orders;
