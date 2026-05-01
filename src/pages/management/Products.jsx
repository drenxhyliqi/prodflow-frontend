import React, { useEffect, useState } from 'react'
import Layout from '../../layouts/Layout'
import api from '../../api/axios'
import { toast } from 'react-toastify'
import { MdOutlineAddBox } from 'react-icons/md'
import Paginate from '../../components/Paginate'
import { FaSearch, FaEdit } from 'react-icons/fa'
import { useLocation } from 'react-router-dom'
import { IoIosArrowBack } from 'react-icons/io'
import { MdDeleteOutline } from 'react-icons/md'

const Products = () => {
    const [rows, setRows] = useState([])
    const [editRow, setEditRow] = useState(null)
    const [deleteId, setDeleteId] = useState(null)
    const [pagination, setPagination] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [search, setSearch] = useState('')
    const location = useLocation()

    function fetchProducts(page = 1, searchValue = '') {
        let url = `/admin/products?page=${page}`
        if (searchValue && searchValue.trim() !== '') {
            url += `&search=${encodeURIComponent(searchValue.trim())}`
        }

        api.get(url)
            .then((response) => {
                setRows(response.data.data || [])
                setPagination(response.data || {})
            })
            .catch(() => toast.error('Failed to fetch products.'))
    }

    function createProduct(e) {
        e.preventDefault()
        setSubmitting(true)

        const product = document.getElementById('product').value
        const unit = document.getElementById('unit').value
        const price = document.getElementById('price').value

        api.post('/admin/create_product', { product, unit, price })
            .then(() => {
                toast.success('Product created successfully.')
                fetchProducts()
                clearFields()
                setSubmitting(false)
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || 'Failed to create product.')
                setSubmitting(false)
            })
    }

    const handleSearch = (e) => {
        e.preventDefault()
        const value = e.target.search.value.trim()
        const params = new URLSearchParams(location.search)

        if (value) params.set('search', value)
        else params.delete('search')

        params.set('page', 1)
        window.history.pushState({}, '', `?${params.toString()}`)
        fetchProducts(1, value)
    }

    function checkEditProduct(id) {
        api.get(`/admin/edit_product/${id}`)
            .then((response) => setEditRow(response.data))
            .catch((err) => toast.error(err?.response?.data?.message || 'No information found.'))
    }

    function updateProduct(e) {
        e.preventDefault()
        setSubmitting(true)

        const pid = document.getElementById('pid').value
        const product = document.getElementById('product').value
        const unit = document.getElementById('unit').value
        const price = document.getElementById('price').value

        api.post('/admin/update_product', { pid, product, unit, price })
            .then(() => {
                toast.success('Product updated successfully.')
                setSubmitting(false)
                setEditRow(null)
                fetchProducts()
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || 'Failed to update product.')
                setSubmitting(false)
            })
    }

    function handleDelete() {
        api.get(`/admin/delete_product/${deleteId}`)
            .then(() => {
                toast.success('Product deleted successfully.')
                fetchProducts()
                setDeleteId(null)
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || 'Failed to delete product.')
                setDeleteId(null)
            })
    }

    function clearFields() {
        document.getElementById('product').value = ''
        document.getElementById('unit').value = ''
        document.getElementById('price').value = ''
    }

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const page = params.get('page') || 1
        const urlSearch = params.get('search') || ''
        setSearch(urlSearch)
        fetchProducts(page, urlSearch)
    }, [location.search])

    return (
        <Layout>
            {!editRow && (
                <>
                    <h4 className="fw-bold">Products</h4>
                    <small className="d-inline-block opacity-75">Manage products</small>
                </>
            )}

            {editRow && (
                <button
                    type="button"
                    onClick={() => setEditRow(null)}
                    className="btn btn-transparent border-0 p-0 d-flex align-items-center fw-semibold"
                >
                    <IoIosArrowBack className="me-2" />
                    Turn back
                </button>
            )}

            {editRow && (
                <div className="card rounded-4 mt-3">
                    <div className="card-header rounded-4">
                        <span className="fw-semibold">
                            Update Product <strong>#ID:{editRow.pid}</strong>
                        </span>
                    </div>
                    <div className="card-body">
                        <form method="post" onSubmit={updateProduct}>
                            <input type="hidden" id="pid" name="pid" value={editRow.pid} required />
                            <div className="row g-3">
                                <div className="col-12 col-md-6 col-lg-4">
                                    <label htmlFor="product" className="form-label">Product name</label>
                                    <input type="text" defaultValue={editRow.product} className="form-control rounded-4 shadow-none" id="product" placeholder="Enter product name" required />
                                </div>
                                <div className="col-12 col-md-6 col-lg-4">
                                    <label htmlFor="unit" className="form-label">Unit</label>
                                    <input type="text" defaultValue={editRow.unit} className="form-control rounded-4 shadow-none" id="unit" placeholder="Enter unit" required />
                                </div>
                                <div className="col-12 col-md-6 col-lg-4">
                                    <label htmlFor="price" className="form-label">Price</label>
                                    <input type="number" step="0.01" min="0" defaultValue={editRow.price} className="form-control rounded-4 shadow-none" id="price" placeholder="Enter price" required />
                                </div>
                                <div className="col-12">
                                    {submitting ? (
                                        <button type="button" className="btn btn-success rounded-4" disabled>Updating...</button>
                                    ) : (
                                        <button type="submit" className="btn btn-success rounded-4 d-flex align-items-center gap-1">
                                            <FaEdit /> Update Product
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {!editRow && (
                <>
                    <div className="card rounded-4 mt-3">
                        <div className="card-header rounded-4">
                            <span className="fw-semibold">Register new Product</span>
                        </div>
                        <div className="card-body">
                            <form method="post" onSubmit={createProduct}>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="product" className="form-label">Product name</label>
                                        <input type="text" className="form-control rounded-4 shadow-none" id="product" placeholder="Enter product name" required />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="unit" className="form-label">Unit</label>
                                        <input type="text" className="form-control rounded-4 shadow-none" id="unit" placeholder="Enter unit" required />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="price" className="form-label">Price</label>
                                        <input type="number" step="0.01" min="0" className="form-control rounded-4 shadow-none" id="price" placeholder="Enter price" required />
                                    </div>
                                    <div className="col-12">
                                        {submitting ? (
                                            <button type="button" className="btn btn-success rounded-4" disabled>Creating...</button>
                                        ) : (
                                            <button type="submit" className="btn btn-success rounded-4 d-flex align-items-center gap-1">
                                                <MdOutlineAddBox /> Create Product
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="card rounded-4 my-4">
                        <div className="card-header rounded-4">
                            <span className="fw-semibold">Products List</span>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <form onSubmit={handleSearch}>
                                    <div className="input-group mb-3">
                                        <input
                                            type="search"
                                            name="search"
                                            defaultValue={search}
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
                                            <th className="text-nowrap" scope="col">#</th>
                                            <th className="text-nowrap" scope="col">Product</th>
                                            <th className="text-nowrap" scope="col">Unit</th>
                                            <th className="text-nowrap" scope="col">Price</th>
                                            <th className="text-end text-nowrap" scope="col">Operations</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="text-center">No data to show...</td>
                                            </tr>
                                        ) : (
                                            rows.map((row) => (
                                                <tr key={row.pid}>
                                                    <td className="text-nowrap">{row.pid}</td>
                                                    <td className="text-nowrap">{row.product}</td>
                                                    <td className="text-nowrap">{row.unit}</td>
                                                    <td className="text-nowrap">{row.price}</td>
                                                    <td className="text-end text-nowrap">
                                                        <button type="button" onClick={() => checkEditProduct(row.pid)} className="btn btn-success btn-sm shadow-sm me-2">
                                                            <FaEdit size={20} />
                                                        </button>
                                                        <button type="button" onClick={() => setDeleteId(row.pid)} className="btn btn-danger btn-sm shadow-sm">
                                                            <MdDeleteOutline size={20} />
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

                    {deleteId && (
                        <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4 px-3" style={{ zIndex: 1050, width: '100%', maxWidth: '500px' }}>
                            <div className="bg-white shadow-lg rounded-4 p-3 border">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>Confirm deletion</strong>
                                        <p className="mb-0 small text-muted">
                                            Delete product <strong>#ID: {deleteId}</strong>?
                                        </p>
                                    </div>
                                    <button type="button" className="btn-close ms-2 shadow-none" onClick={() => setDeleteId(null)} />
                                </div>
                                <div className="d-flex justify-content-end mt-3">
                                    <button type="button" className="btn btn-light me-2" onClick={() => setDeleteId(null)}>Cancel</button>
                                    <button type="button" className="btn btn-danger" onClick={handleDelete}>Confirm</button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </Layout>
    )
}

export default Products