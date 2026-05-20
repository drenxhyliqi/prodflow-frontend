import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../../layouts/Layout';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { MdOutlineAddBox } from 'react-icons/md';
import Paginate from '../../components/Paginate';
import { FaSearch, FaTrash } from 'react-icons/fa';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { IoIosArrowBack } from 'react-icons/io';

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
        return selectedProducts.reduce((sum, item) => {
            return sum + Number(item.total_price || 0);
        }, 0);
    }, [selectedProducts]);

    // Get Clients
    function getClients() {
        api.get('/admin/allClients')
            .then(response => {
                setClients(response.data || []);
            })
            .catch(() => {
                toast.error('Failed to fetch clients.');
            });
    }

    // Get Products
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
            .catch(() => {
                toast.error('Failed to fetch products.');
            });
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
                    res.product_id ? [res] :
                    [];
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
            .finally(() => {
                setLoadingSale(false);
            });
    }

    // Search Products
    function handleSearch() {
        const params = new URLSearchParams();
        params.set('page', 1);
        if (search.trim() !== '') {
            params.set('search', search.trim());
        }
        navigate(`?${params.toString()}`);
    }

    // Select Product
    function handleProductCheck(e, product) {
        const product_id = Number(product.pid || product.id);
        if (e.target.checked) {
            setSelectedProducts(prev => {
                const exists = prev.some(item => Number(item.product_id) === product_id);
                if (exists) return prev;
                return [
                    ...prev,
                    {
                        row_id: `new-${product_id}-${Date.now()}`,
                        product_id,
                        product: product.product,
                        qty: 1,
                        price: Number(product.price || 0),
                        total_price: Number(product.price || 0)
                    }
                ];
            });
        } else {
            setSelectedProducts(prev =>
                prev.filter(item => Number(item.product_id) !== product_id)
            );
        }
    }

    // QTY Change
    function handleQtyChange(row_id, qty) {
        setSelectedProducts(prev =>
            prev.map(item => {
                if (item.row_id === row_id) {
                    const newQty = Number(qty || 0);
                    const price = Number(item.price || 0);
                    return {
                        ...item,
                        qty: qty,
                        total_price: (newQty * price).toFixed(2)
                    };
                }
                return item;
            })
        );
    }

    // Total Change
    function handleTotalChange(row_id, total_price) {
        setSelectedProducts(prev =>
            prev.map(item =>
                item.row_id === row_id
                    ? { ...item, total_price }
                    : item
            )
        );
    }

    // Remove Product
    function removeProduct(row_id) {
        setSelectedProducts(prev =>
            prev.filter(item => item.row_id !== row_id)
        );
    }

    // Update Sale
    function updateSale(e) {
        e.preventDefault();
        setSubmitting(true);

        // Validate that all products have valid product_id
        const productsData = selectedProducts.map(item => {
            const product_id = Number(item.product_id);
            if (isNaN(product_id) || product_id <= 0) {
                throw new Error(`Invalid product ID for ${item.product || 'Unknown'}`);
            }
            return {
                product_id: product_id,
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
        .finally(() => {
            setSubmitting(false);
        });
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
            <h4 className="fw-bold">Edit Sale #{sale_number}</h4>
            <small className="d-inline-block opacity-75">Edit sale products, quantity and total</small>
            <Link to="/sales" className="btn btn-transparent border-0 p-0 d-flex align-items-center fw-semibold mt-3"><IoIosArrowBack className="me-2" />Turn back</Link>

            {loadingSale ? (
                <div className="card rounded-4 mt-3">
                    <div className="card-body text-center">
                        Loading sale...
                    </div>
                </div>
            ) : (
                <form method="post" onSubmit={updateSale}>
                    <div className="card rounded-4 mt-3">
                        <div className="card-header rounded-4">
                            <span className="fw-semibold">Edit Client</span>
                        </div>
                        <div className="card-body">

                            {/* Select Client */}
                            <div className="row g-3">
                                <div className="col-12 col-md-6 col-lg-4">
                                    <label htmlFor="clientSelect" className="form-label">Select Client</label>
                                    <select id="clientSelect" className="form-control rounded-4 shadow-none"
                                        value={selectedClient}
                                        onChange={(e) => {
                                            setSelectedClient(e.target.value);
                                            setClientName('');
                                        }}
                                    >
                                        <option value="">
                                            {clients.length === 0 ? '-- 0 Client --' : '-- Select Client --'}
                                        </option>
                                        {clients.map((c, index) => (
                                            <option key={c.id || index} value={c.client}>
                                                {c.client}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-12 col-md-6 col-lg-4">
                                    <label htmlFor="clientName" className="form-label">Or Client Name</label>
                                    <input type="text" className="form-control rounded-4 shadow-none" id="clientName" placeholder="Enter client name"
                                        value={clientName}
                                        onChange={(e) => {
                                            setClientName(e.target.value);
                                            setSelectedClient('');
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Select Products */}
                    {clientIsSelected && (
                        <>
                            <div className="card rounded-4 mt-3">
                                <div className="card-header rounded-4 d-flex justify-content-between align-items-center">
                                    <span className="fw-semibold">Selected Products</span>
                                    <span className="fw-bold">Total: {saleTotal.toFixed(2)} €</span>
                                </div>
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-hover align-middle">
                                            <thead>
                                                <tr>
                                                    <th>Product</th>
                                                    <th className="text-nowrap text-end" style={{ width: '150px' }}>Price(€)</th>
                                                    <th className="text-nowrap text-end" style={{ width: '150px' }}>QTY</th>
                                                    <th className="text-nowrap text-end" style={{ width: '150px' }}>Total(€)</th>
                                                    <th className="text-nowrap text-center" style={{ width: '100px' }}>Remove</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedProducts.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="text-center">0 Selected Products</td>
                                                    </tr>
                                                ) : (
                                                    selectedProducts.map((item, index) => (
                                                        <tr key={index}>
                                                            <td>{item.product || `Product #${item.product_id}`}</td>
                                                            <td className="text-end">{item.price}€</td>
                                                            <td>
                                                                <input type="number" min="1" className="form-control rounded-4 shadow-none text-end" value={item.qty} onChange={(e) => handleQtyChange(item.row_id, e.target.value)}/>
                                                            </td>
                                                            <td>
                                                                <input type="number" min="0" step="0.01" className="form-control rounded-4 shadow-none text-end" value={item.total_price} onChange={(e) => handleTotalChange(item.row_id, e.target.value)}/>
                                                            </td>
                                                            <td className="text-center">
                                                                <button type="button" className="btn btn-danger btn-sm rounded-4" onClick={() => removeProduct(item.row_id)}><FaTrash /></button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <button type="submit" className="btn btn-success rounded-4 d-flex align-items-center gap-1" disabled={submitting}>
                                        <MdOutlineAddBox /> {submitting ? 'Updating...' : 'Update Sale'}
                                    </button>
                                </div>
                            </div>

                            {/* Add More Products */}
                            <div className="card rounded-4 mt-3">
                                <div className="card-header rounded-4">
                                    <span className="fw-semibold">Add More Products</span>
                                </div>
                                <div className="card-body">
                                    <div className="input-group mb-3">
                                        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleSearch();
                                                }
                                            }} className="form-control rounded-start-4 shadow-none" placeholder="Search product..."
                                        />
                                        <button className="btn btn-primary rounded-end-4" type="button" onClick={handleSearch}><FaSearch /></button>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-hover align-middle">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: '100px' }}>Select</th>
                                                    <th>Product</th>
                                                    <th>Price</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {products.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="3" className="text-center">0 Products</td>
                                                    </tr>
                                                ) : (
                                                    products.map((p, index) => {
                                                        const product_id = Number(p.pid || p.id);
                                                        const isSelected = selectedProducts.some(
                                                            item => Number(item.product_id) === product_id
                                                        );
                                                        return (
                                                            <tr key={product_id || index}>
                                                                <td>
                                                                    <input type="checkbox" className="form-check-input" checked={isSelected} onChange={(e) => handleProductCheck(e, {
                                                                            ...p,
                                                                            pid: product_id
                                                                        })}
                                                                    />
                                                                </td>
                                                                <td>{p.product}</td>
                                                                <td>{Number(p.price || 0).toFixed(2)} €</td>
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