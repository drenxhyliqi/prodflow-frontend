import React, { useEffect, useState } from 'react'
import Layout from '../../layouts/Layout'
import api from '../../api/axios'
import { toast } from 'react-toastify'
import { MdOutlineAddBox, MdDeleteOutline } from 'react-icons/md'
import Paginate from '../../components/Paginate'
import { FaSearch, FaEdit } from 'react-icons/fa'
import { useLocation } from 'react-router-dom'
import { IoIosArrowBack } from 'react-icons/io'

const BRAND = '#035dad'
const inputCls = 'form-control shadow-none rounded-3'
const btnBrand = { backgroundColor: BRAND, color: '#fff', border: 'none' }

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

    /* ── EDIT MODE ─────────────────────────────────────── */
    if (editRow) return (
        <Layout>
            <button
                onClick={() => setEditRow(null)}
                className='btn btn-transparent border-0 p-0 d-flex align-items-center fw-semibold'
            >
                <IoIosArrowBack className='me-2' />Turn back
            </button>

            <div className="card rounded-4 mt-3 border-0 shadow-sm">
                <div className="card-header rounded-top-4 border-0 py-3 px-4" style={{ background: BRAND + '10' }}>
                    <span className='fw-semibold' style={{ color: BRAND }}>
                        Update Product <strong>#ID:{editRow.pid}</strong>
                    </span>
                </div>
                <div className="card-body px-4 pb-4">
                    <form onSubmit={updateProduct}>
                        <input type="hidden" id="pid" value={editRow.pid} />
                        <div className="row g-3">
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Product name</label>
                                <input type="text" defaultValue={editRow.product} className={inputCls} id="product" placeholder="Enter product name" required />
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Unit</label>
                                <input type="text" defaultValue={editRow.unit} className={inputCls} id="unit" placeholder="Enter unit" required />
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Price</label>
                                <input type="number" step="0.01" min="0" defaultValue={editRow.price} className={inputCls} id="price" placeholder="Enter price" required />
                            </div>
                            <div className="col-12 col-md-4 d-flex align-items-end">
                                <button
                                    type={submitting ? 'button' : 'submit'}
                                    disabled={submitting}
                                    className="btn w-100 rounded-3 d-flex align-items-center justify-content-center gap-2 fw-semibold"
                                    style={btnBrand}
                                >
                                    <FaEdit /> {submitting ? 'Updating...' : 'Update Product'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    )

    /* ── MAIN VIEW ─────────────────────────────────────── */
    return (
        <Layout>
            {/* Header */}
            <div
                className="d-flex justify-content-between align-items-center flex-wrap gap-3 rounded-4 px-4 py-4 mb-4"
                style={{ background: BRAND + '1a' }}
            >
                <div>
                    <p className="mb-1 fw-semibold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.1em', color: BRAND }}>Catalog</p>
                    <h4 className='fw-bold mb-1'>Products Overview</h4>
                    <small className='text-muted'>Manage and track all products across your company.</small>
                </div>
                <button
                    className="btn rounded-pill d-flex align-items-center gap-2 fw-semibold px-4 py-2"
                    style={btnBrand}
                    onClick={() => document.getElementById('create-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                    <MdOutlineAddBox size={18} /> New Product
                </button>
            </div>

            {/* Create Form */}
            <div id="create-form" className="card rounded-4 border-0 shadow-sm mb-4">
                <div className="card-body px-4 pt-4 pb-3">
                    <div className="d-flex align-items-center gap-3 mb-3">
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: BRAND + '18', color: BRAND,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                        }}>
                            <MdOutlineAddBox />
                        </div>
                        <div>
                            <p className="fw-semibold mb-0">Register new Product</p>
                            <small className="text-muted">Fill in the details to add a new product</small>
                        </div>
                    </div>

                    <form onSubmit={createProduct}>
                        <div className="row g-3 pb-2">
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Product name</label>
                                <input type="text" className={inputCls} id="product" placeholder="Enter product name" required />
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Unit</label>
                                <input type="text" className={inputCls} id="unit" placeholder="e.g. kg, pcs, m" />
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Price</label>
                                <input type="number" step="0.01" min="0" className={inputCls} id="price" placeholder="Enter price" required />
                            </div>
                            <div className="col-12 col-md-4 d-flex align-items-end">
                                <button
                                    type={submitting ? 'button' : 'submit'}
                                    disabled={submitting}
                                    className="btn w-100 rounded-3 d-flex align-items-center justify-content-center gap-2 fw-semibold"
                                    style={btnBrand}
                                >
                                    <MdOutlineAddBox size={18} />
                                    {submitting ? 'Creating...' : 'Create Product'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* List */}
            <div className="card rounded-4 border-0 shadow-sm mb-4">
                <div className="card-body px-4 pt-4">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                        <div>
                            <p className="fw-semibold mb-0">Products List</p>
                            <small className="text-muted">{pagination.total || 0} entries</small>
                        </div>
                        <form onSubmit={handleSearch} style={{ minWidth: 220 }}>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0 rounded-start-3">
                                    <FaSearch className="text-muted" size={13} />
                                </span>
                                <input
                                    type="search" name="search" defaultValue={search}
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
                                    <th className="text-nowrap fw-semibold">#</th>
                                    <th className="text-nowrap fw-semibold">Product</th>
                                    <th className="text-nowrap fw-semibold">Unit</th>
                                    <th className="text-nowrap fw-semibold">Price</th>
                                    <th className="text-end text-nowrap fw-semibold">Operations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center text-muted py-4">No data to show...</td></tr>
                                ) : (
                                    rows.map((row) => (
                                        <tr key={row.pid}>
                                            <td className="text-nowrap text-muted small">#{row.pid}</td>
                                            <td className="text-nowrap fw-semibold">{row.product}</td>
                                            <td className="text-nowrap text-muted">{row.unit}</td>
                                            <td className="text-nowrap">{row.price}</td>
                                            <td className="text-end text-nowrap">
                                                <button onClick={() => checkEditProduct(row.pid)} className="btn btn-sm me-1" style={{ color: BRAND, background: BRAND + '12' }}>
                                                    <FaEdit size={15} />
                                                </button>
                                                <button onClick={() => setDeleteId(row.pid)} className="btn btn-sm" style={{ color: '#ef4444', background: '#ef444412' }}>
                                                    <MdDeleteOutline size={18} />
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
                                <p className="mb-0 small text-muted">Are you sure you want to delete product <strong>#ID: {deleteId}</strong>?</p>
                            </div>
                            <button className="btn-close ms-2 shadow-none" onClick={() => setDeleteId(null)} />
                        </div>
                        <div className="d-flex justify-content-end mt-3 gap-2">
                            <button className="btn btn-light rounded-3" onClick={() => setDeleteId(null)}>Cancel</button>
                            <button className="btn btn-danger rounded-3" onClick={handleDelete}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    )
}

export default Products
