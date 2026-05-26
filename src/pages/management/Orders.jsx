import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../../layouts/Layout';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { MdDeleteOutline } from 'react-icons/md';
import Paginate from '../../components/Paginate';
import { FaSearch, FaEdit, FaTimes, FaSave, FaExchangeAlt } from 'react-icons/fa';

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
            .catch(() => {
                toast.error('Failed to fetch orders.');
            });
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
            .then((response) => {
                setClients(response.data || []);
            })
            .catch(() => {
                toast.error('Failed to fetch clients.');
            });
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
        setForm((prev) => ({
            ...prev,
            client: e.target.value
        }));
    }

    function toggleProduct(productId, checked) {
        setForm((prev) => {
            if (checked) {
                return {
                    ...prev,
                    products_id: [...prev.products_id, { products_id: Number(productId), qty: 1 }]
                };
            }

            return {
                ...prev,
                products_id: prev.products_id.filter(
                    (item) => Number(item.products_id) !== Number(productId)
                )
            };
        });
    }

    function handleQtyChange(productId, qty) {
        setForm((prev) => ({
            ...prev,
            products_id: prev.products_id.map((item) =>
                Number(item.products_id) === Number(productId)
                    ? { ...item, qty: Number(qty) }
                    : item
            )
        }));
    }

    function isChecked(productId) {
        return form.products_id.some(
            (item) => Number(item.products_id) === Number(productId)
        );
    }

    function getSelectedQty(productId) {
        const found = form.products_id.find(
            (item) => Number(item.products_id) === Number(productId)
        );
        return found ? found.qty : 1;
    }

    function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);

        const payload = {
            client: form.client,
            products_id: form.products_id.map((item) => ({
                products_id: Number(item.products_id),
                qty: Number(item.qty)
            }))
        };

        const request = editingOrder
            ? api.post('/admin/update_order', {
                  order_number: form.order_number,
                  ...payload
              })
            : api.post('/admin/create_order', payload);

        request
            .then((response) => {
                toast.success(
                    response.data.message ||
                        (editingOrder
                            ? 'Order updated successfully.'
                            : 'Order created successfully.')
                );
                resetForm();
                getOrders(pagination.current_page || 1, search);
            })
            .catch((error) => {
                toast.error(error.response?.data?.message || 'Failed to save order.');
            })
            .finally(() => {
                setSubmitting(false);
            });
    }

    function handleEdit(orderNumber) {
        api.get(`/admin/edit_order/${orderNumber}`)
            .then((response) => {
                const data = response.data;

                setEditingOrder(orderNumber);
                setForm({
                    order_number: data.order_number,
                    client: data.client,
                    products_id: (data.items || []).map((item) => ({
                        products_id: Number(item.product_id),
                        qty: Number(item.qty)
                    }))
                });

                window.scrollTo({ top: 0, behavior: 'smooth' });
            })
            .catch(() => {
                toast.error('Failed to fetch order details.');
            });
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
            .finally(() => {
                setSubmitting(false);
            });
    }

    function handleConvert(orderNumber) {
        setSubmitting(true);
        api.post(`/admin/convert_order_to_sale/${orderNumber}`)
            .then((response) => {
                toast.success(response.data.message || 'Order converted successfully.');
                getOrders(pagination.current_page || 1, search);
            })
            .catch((error) => {
                toast.error(error.response?.data?.message || 'Failed to convert order.');
            })
            .finally(() => {
                setSubmitting(false);
            });
    }

    const selectedCount = useMemo(() => form.products_id.length, [form.products_id]);

    useEffect(() => {
        getOrders();
        getClients();
        getAllProducts();
    }, []);

    return (
        <Layout>
            <div className="row align-items-center mb-4">
                <div className="col-12">
                    <h4 className="fw-bold">Orders</h4>
                    <small className="d-inline-block opacity-75">
                        Create, edit and delete orders in one page
                    </small>
                </div>
            </div>

            <div className="card rounded-4 mb-4">
                <div className="card-header rounded-4 d-flex justify-content-between align-items-center">
                    <span className="fw-semibold">
                        {editingOrder ? `Edit Order - ${editingOrder}` : 'Create Order'}
                    </span>

                    {editingOrder && (
                        <button
                            type="button"
                            className="btn btn-light btn-sm rounded-4"
                            onClick={resetForm}
                        >
                            <FaTimes className="me-1" />
                            Cancel Edit
                        </button>
                    )}
                </div>

                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-12 col-md-6">
                                <label className="form-label">Client</label>
                                <select
                                    className="form-select rounded-4 shadow-none"
                                    value={form.client}
                                    onChange={handleClientChange}
                                    required
                                >
                                    <option value="">Select client</option>
                                    {clients.map((client) => (
                                        <option key={client.cid} value={client.client}>
                                            {client.client}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <label className="form-label mb-0">Products</label>
                                <span className="small text-muted">
                                    Selected: {selectedCount}
                                </span>
                            </div>

                            <div className="border rounded-4 p-3">
                                {products.length === 0 ? (
                                    <p className="mb-0 text-muted">No products found...</p>
                                ) : (
                                    <div className="row">
                                        {products.map((product) => {
                                            const checked = isChecked(product.pid);

                                            return (
                                                <div className="col-12 mb-3" key={product.pid}>
                                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 border rounded-4 p-3">
                                                        <div className="form-check mb-0">
                                                            <input
                                                                className="form-check-input shadow-none"
                                                                type="checkbox"
                                                                id={`product-${product.pid}`}
                                                                checked={checked}
                                                                onChange={(e) =>
                                                                    toggleProduct(
                                                                        product.pid,
                                                                        e.target.checked
                                                                    )
                                                                }
                                                            />
                                                            <label
                                                                className="form-check-label ms-2"
                                                                htmlFor={`product-${product.pid}`}
                                                            >
                                                                <strong>{product.product}</strong>
                                                                <span className="text-muted ms-2">
                                                                    ({product.unit}) - ${Number(product.price).toFixed(2)}
                                                                </span>
                                                            </label>
                                                        </div>

                                                        {checked && (
                                                            <div style={{ width: '120px' }}>
                                                                <label className="form-label mb-1">
                                                                    Qty
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    className="form-control rounded-4 shadow-none"
                                                                    value={getSelectedQty(product.pid)}
                                                                    onChange={(e) =>
                                                                        handleQtyChange(
                                                                            product.pid,
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    required
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
                                className="btn btn-primary rounded-4"
                                disabled={submitting || !form.client || form.products_id.length === 0}
                            >
                                {editingOrder ? (
                                    <>
                                        <FaSave className="me-2" />
                                        {submitting ? 'Updating...' : 'Update Order'}
                                    </>
                                ) : (
                                    <>
                                        <FaSave className="me-2" />
                                        {submitting ? 'Creating...' : 'Create Order'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="card rounded-4 my-4">
                <div className="card-header rounded-4">
                    <span className="fw-semibold">Orders List</span>
                </div>

                <div className="card-body">
                    <div className="mb-3">
                        <form onSubmit={handleSearch}>
                            <div className="input-group mb-3">
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="form-control rounded-start-4 shadow-none"
                                    placeholder="Search..."
                                />
                                <button className="btn btn-primary rounded-end-4" type="submit">
                                    <FaSearch />
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th className="text-nowrap">#</th>
                                    <th className="text-nowrap">Client</th>
                                    <th className="text-nowrap">Status</th>
                                    <th className="text-nowrap">Sale</th>
                                    <th className="text-nowrap">Date</th>
                                    <th className="text-nowrap">Total</th>
                                    <th className="text-end text-nowrap">Operations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center">
                                            No data to show...
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order.order_number}>
                                            <td className="text-nowrap">{order.order_number}</td>
                                            <td className="text-nowrap">{order.client}</td>
                                            <td className="text-nowrap">
                                                <span
                                                    className={`badge rounded-pill ${
                                                        order.status === 'completed'
                                                            ? 'bg-success'
                                                            : order.status === 'cancelled'
                                                            ? 'bg-danger'
                                                            : 'bg-warning text-dark'
                                                    }`}
                                                >
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="text-nowrap">{order.sale_number || '-'}</td>
                                            <td className="text-nowrap">
                                                {order.date
                                                    ? new Date(order.date).toLocaleDateString('en-GB', {
                                                          day: '2-digit',
                                                          month: '2-digit',
                                                          year: 'numeric'
                                                      })
                                                    : '-'}
                                            </td>
                                            <td className="text-nowrap">
                                                ${Number(order.grand_total || 0).toFixed(2)}
                                            </td>
                                            <td className="text-end text-nowrap">
                                                {order.status === 'pending' && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEdit(order.order_number)}
                                                            className="btn btn-success btn-sm shadow-sm me-2"
                                                        >
                                                            <FaEdit size={18} />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleConvert(order.order_number)}
                                                            className="btn btn-warning btn-sm shadow-sm me-2"
                                                            disabled={submitting}
                                                        >
                                                            <FaExchangeAlt size={16} />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => setDeleteId(order.order_number)}
                                                            className="btn btn-danger btn-sm shadow-sm"
                                                        >
                                                            <MdDeleteOutline size={20} />
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

            {deleteId && (
                <div
                    className="position-fixed bottom-0 start-50 translate-middle-x mb-4 px-3"
                    style={{ zIndex: 1050, width: '100%', maxWidth: '500px' }}
                >
                    <div className="bg-white shadow-lg rounded-4 p-3 border">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>Confirm deletion</strong>
                                <p className="mb-0 small text-muted">
                                    Are you sure you want to delete this order with <strong>#ID: {deleteId}</strong>?
                                </p>
                            </div>
                            <button
                                className="btn-close ms-2 shadow-none"
                                onClick={() => setDeleteId(null)}
                            ></button>
                        </div>

                        <div className="d-flex justify-content-end mt-3">
                            <button
                                className="btn btn-light me-2"
                                onClick={() => setDeleteId(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={handleDelete}
                                disabled={submitting}
                            >
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