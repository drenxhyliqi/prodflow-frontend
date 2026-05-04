import React, { useEffect, useState } from 'react';
import Layout from '../../layouts/Layout';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { MdOutlineAddBox } from 'react-icons/md';
import Paginate from '../../components/Paginate';
import { FaSearch } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IoIosArrowBack } from 'react-icons/io';

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
            .then(response => {
                setClients(response.data || []);
            })
            .catch(() => {
                toast.error('Failed to fetch clients.');
            });
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
            .catch(() => {
                toast.error('Failed to fetch products.');
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

    // Product Selection
    function handleProductCheck(e, product) {
        const products_id = product.pid || product.id;
        if (e.target.checked) {
            setSelectedProducts(prev => [
                ...prev,
                {
                    products_id: products_id,
                    qty: 1
                }
            ]);
        } else {
            setSelectedProducts(prev =>
                prev.filter(item => item.products_id !== products_id)
            );
        }
    }

    // Products QTY
    function handleQtyChange(product, qty) {
        const products_id = product.pid || product.id;
        setSelectedProducts(prev =>
            prev.map(item =>
                item.products_id === products_id
                    ? { ...item, qty: Number(qty) }
                    : item
            )
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
        .catch(error => {
            toast.error(error.response?.data?.message || 'Failed to create sale.');
        })
        .finally(() => {
            setSubmitting(false);
        });
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
            <h4 className="fw-bold">Create New Sale</h4>
            <small className="d-inline-block opacity-75">Manage new sales by company</small>
            <Link to='/sales' className='btn btn-transparent border-0 p-0 d-flex align-items-center fw-semibold mt-3'><IoIosArrowBack className='me-2'/>Turn back</Link>

            {/* Create Sale */}
            <form method="post" onSubmit={createSale}>
                <div className="card rounded-4 mt-3">
                    <div className="card-header rounded-4">
                        <span className="fw-semibold">Choose Client</span>
                    </div>

                    {/* Select Client */}
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-12 col-md-6 col-lg-4">
                                <label htmlFor="clientSelect" className="form-label">Select Client</label>
                                <select id="clientSelect" className="form-control rounded-4 shadow-none" value={selectedClient}
                                    onChange={(e) => {
                                        setSelectedClient(e.target.value);
                                        setClientName('');
                                        setSelectedProducts([]);
                                    }}
                                >
                                    <option value="">{clients.length === 0 ? '-- 0 Client --' : '-- Select Client --'}</option>
                                    {clients.map((c, index) => (
                                        <option key={c.id || index} value={c.client}>
                                            {c.client}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-12 col-md-6 col-lg-4">
                                <label htmlFor="clientName" className="form-label">Or Client Name</label>
                                <input type="text" className="form-control rounded-4 shadow-none" id="clientName" placeholder="Enter client name" value={clientName}
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

                {/* Select Products */}
                {clientIsSelected && (
                    <div className="card rounded-4 mt-3">
                        <div className="card-header rounded-4">
                            <span className="fw-semibold">Choose Products For Sale</span>
                        </div>
                        <div className="card-body">
                            <div className="input-group mb-3">
                                <input type="search" value={search} 
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSearch();
                                        }
                                    }}
                                    className="form-control rounded-start-4 shadow-none"
                                    placeholder="Search product..."
                                />
                                <button className="btn btn-primary rounded-end-4" type="button" onClick={handleSearch}><FaSearch /></button>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-bordered table-hover align-middle">
                                    <thead>
                                        <tr>
                                            <th className="text-nowrap" style={{ width: '100px' }}>Select</th>
                                            <th className="text-nowrap">Product</th>
                                            <th className="text-nowrap">Price</th>
                                            <th className="text-nowrap text-end" style={{ width: '150px' }}>QTY</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="text-center">
                                                    0 Products
                                                </td>
                                            </tr>
                                        ) : (
                                            products.map((p, index) => {
                                                const products_id = p.pid || p.id;
                                                const isSelected = selectedProducts.some(
                                                    item => item.products_id === products_id
                                                );
                                                const selectedProduct = selectedProducts.find(
                                                    item => item.products_id === products_id
                                                );
                                                return (
                                                    <tr key={products_id || index}>
                                                        <td className="text-nowrap">
                                                            <input type="checkbox" className="form-check-input" checked={isSelected} onChange={(e) => handleProductCheck(e, p)}/>
                                                        </td>
                                                        <td className="text-nowrap">{p.product}</td>
                                                        <td className="text-nowrap">{p.price} €</td>
                                                        <td className="text-nowrap">
                                                            <input type="number" min="1" className="form-control rounded-4 shadow-none text-end" placeholder="QTY" disabled={!isSelected}
                                                                value={selectedProduct?.qty || ''}
                                                                onChange={(e) => handleQtyChange(p, e.target.value)}
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="col-12 mb-3">
                                <button type="submit" className="btn btn-success rounded-4 d-flex align-items-center gap-1" disabled={submitting}>
                                    <MdOutlineAddBox />
                                    {submitting ? 'Creating...' : 'Create Sale'}
                                </button>
                            </div>

                            <Paginate data={pagination} />
                        </div>
                    </div>
                )}
            </form>
        </Layout>
    );
};

export default CreateSales;