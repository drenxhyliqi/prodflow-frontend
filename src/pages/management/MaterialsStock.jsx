import React, { useEffect, useState } from 'react'
import Layout from '../../layouts/Layout'
import api from '../../api/axios'
import { toast } from 'react-toastify'
import { MdOutlineAddBox, MdDeleteOutline, MdOutlineInventory2 } from 'react-icons/md'
import Paginate from '../../components/Paginate'
import { FaSearch, FaEdit } from 'react-icons/fa'
import { useLocation } from 'react-router-dom'
import { IoIosArrowBack } from 'react-icons/io'

const BRAND = '#035dad'
const inputCls = 'form-control shadow-none rounded-3'
const selectCls = 'form-select shadow-none rounded-3'
const btnBrand = { backgroundColor: BRAND, color: '#fff', border: 'none' }

const todayISO = () => new Date().toISOString().slice(0, 10)

const warehouseLabel = (w) => w?.warehouse ?? w?.name ?? ''

const MaterialsStock = () => {
    const [rows, setRows] = useState([])
    const [materialOptions, setMaterialOptions] = useState([])
    const [warehouseOptions, setWarehouseOptions] = useState([])
    const [editRow, setEditRow] = useState(null)
    const [deleteId, setDeleteId] = useState(null)
    const [pagination, setPagination] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [search, setSearch] = useState('')
    const location = useLocation()

    function loadDropdowns() {
        api.get('/admin/materials?page=1')
            .then((res) => setMaterialOptions(res.data.data || []))
            .catch(() => setMaterialOptions([]))

        api.get('/admin/warehouses?page=1')
            .then((res) => setWarehouseOptions(res.data.data || []))
            .catch(() => setWarehouseOptions([]))
    }

    function fetchMaterialsStock(page = 1, searchValue = '') {
        let url = `/admin/materials_stock?page=${page}`
        if (searchValue && searchValue.trim() !== '') {
            url += `&search=${encodeURIComponent(searchValue.trim())}`
        }

        api.get(url)
            .then((response) => {
                setRows(response.data.data || [])
                setPagination(response.data || {})
            })
            .catch(() => toast.error('Failed to fetch materials stock.'))
    }

    function createMaterialsStock(e) {
        e.preventDefault()
        setSubmitting(true)

        const material_id = document.getElementById('material_id').value
        const type = document.getElementById('type').value
        const qty = document.getElementById('qty').value
        const date = document.getElementById('date').value
        const warehouse_id = document.getElementById('warehouse_id').value

        api.post('/admin/create_materials_stock', {
            material_id: Number(material_id),
            type,
            qty,
            date,
            warehouse_id: Number(warehouse_id),
        })
            .then(() => {
                toast.success('Materials stock registered successfully.')
                fetchMaterialsStock()
                clearFields()
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || 'Failed to create materials stock record.')
            })
            .finally(() => {
                setSubmitting(false)
            })
    }

    const handleSearch = (e) => {
        e.preventDefault()
        const value = e.target.search.value.trim()
        const params = new URLSearchParams(location.search)
        params.set('search', value)
        params.set('page', 1)
        window.history.pushState({}, '', `?${params.toString()}`)
        fetchMaterialsStock(1, value)
    }

    function checkEditMaterialsStock(id) {
        api.get(`/admin/edit_materials_stock/${id}`)
            .then((response) => {
                const row = response.data
                setEditRow(row)

                api.get('/admin/materials?page=1').then((r) => {
                    let list = r.data.data || []
                    if (!list.some((m) => Number(m.mid) === Number(row.material_id))) {
                        list = [...list, { mid: row.material_id, material: row.material }]
                    }
                    setMaterialOptions(list)
                })

                api.get('/admin/warehouses?page=1').then((r) => {
                    let list = r.data.data || []
                    if (!list.some((w) => Number(w.wid) === Number(row.warehouse_id))) {
                        list = [
                            ...list,
                            {
                                wid: row.warehouse_id,
                                warehouse: row.warehouse,
                                name: row.warehouse,
                            },
                        ]
                    }
                    setWarehouseOptions(list)
                })
            })
            .catch(() => {
                toast.error('No information found.')
            })
    }

    function updateMaterialsStock(e) {
        e.preventDefault()
        setSubmitting(true)

        const msid = document.getElementById('msid').value
        const material_id = document.getElementById('material_id').value
        const type = document.getElementById('type').value
        const qty = document.getElementById('qty').value
        const date = document.getElementById('date').value
        const warehouse_id = document.getElementById('warehouse_id').value

        api.post('/admin/update_materials_stock', {
            msid,
            material_id: Number(material_id),
            type,
            qty,
            date,
            warehouse_id: Number(warehouse_id),
        })
            .then(() => {
                toast.success('Materials stock updated successfully.')
                setEditRow(null)
                fetchMaterialsStock()
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || 'Failed to update materials stock.')
            })
            .finally(() => {
                setSubmitting(false)
            })
    }

    function handleDelete() {
        api.get(`/admin/delete_materials_stock/${deleteId}`)
            .then(() => {
                toast.success('Materials stock deleted successfully.')
                fetchMaterialsStock()
                setDeleteId(null)
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || 'Failed to delete materials stock.')
                setDeleteId(null)
            })
    }

    function clearFields() {
        const mid = document.getElementById('material_id')
        const wid = document.getElementById('warehouse_id')
        if (mid) mid.value = ''
        if (wid) wid.value = ''
        document.getElementById('type').value = ''
        document.getElementById('qty').value = ''
        document.getElementById('date').value = todayISO()
    }

    useEffect(() => {
        loadDropdowns()
    }, [])

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const page = params.get('page') || 1
        const urlSearch = params.get('search') || ''
        setSearch(urlSearch)
        fetchMaterialsStock(page, urlSearch)
    }, [location.search])

    /* ── EDIT MODE ─────────────────────────────────────── */
    if (editRow) {
        return (
            <Layout>
                <button
                    type="button"
                    onClick={() => setEditRow(null)}
                    className="btn btn-transparent border-0 p-0 d-flex align-items-center fw-semibold"
                >
                    <IoIosArrowBack className="me-2" />
                    Turn back
                </button>

                <div className="card rounded-4 mt-3 border-0 shadow-sm">
                    <div className="card-header rounded-top-4 border-0 py-3 px-4" style={{ background: BRAND + '10' }}>
                        <span className="fw-semibold" style={{ color: BRAND }}>
                            Update Materials Stock <strong>#ID:{editRow.msid}</strong>
                        </span>
                    </div>
                    <div className="card-body px-4 pb-4">
                        <form onSubmit={updateMaterialsStock}>
                            <input type="hidden" id="msid" value={editRow.msid} />
                            <div className="row g-3">
                                <div className="col-12 col-md-6 col-lg-4">
                                    <label className="form-label fw-semibold small">Material</label>
                                    <select
                                        id="material_id"
                                        className={selectCls}
                                        defaultValue={String(editRow.material_id)}
                                        required
                                    >
                                        {materialOptions.map((m) => (
                                            <option key={m.mid} value={String(m.mid)}>
                                                {m.material}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-12 col-md-6 col-lg-4">
                                    <label className="form-label fw-semibold small">Type</label>
                                    <select id="type" className={selectCls} defaultValue={String(editRow.type || 'IN')} required>
                                        <option value="IN">IN</option>
                                        <option value="OUT">OUT</option>
                                    </select>
                                </div>
                                <div className="col-12 col-md-6 col-lg-4">
                                    <label className="form-label fw-semibold small">Quantity</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        defaultValue={editRow.qty}
                                        className={inputCls}
                                        id="qty"
                                        placeholder="Enter quantity"
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-6 col-lg-6">
                                    <label className="form-label fw-semibold small">Warehouse</label>
                                    <select
                                        id="warehouse_id"
                                        className={selectCls}
                                        defaultValue={String(editRow.warehouse_id)}
                                        required
                                    >
                                        {warehouseOptions.map((w) => (
                                            <option key={w.wid} value={String(w.wid)}>
                                                {warehouseLabel(w)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-12 col-md-6 col-lg-6">
                                    <label className="form-label fw-semibold small">Date</label>
                                    <input
                                        type="date"
                                        defaultValue={String(editRow.date || '').slice(0, 10)}
                                        className={inputCls}
                                        id="date"
                                        required
                                    />
                                </div>
                                <div className="col-12">
                                    <button
                                        type={submitting ? 'button' : 'submit'}
                                        disabled={submitting}
                                        className="btn rounded-3 d-flex align-items-center gap-2 fw-semibold"
                                        style={btnBrand}
                                    >
                                        <FaEdit /> {submitting ? 'Updating...' : 'Update Materials Stock'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </Layout>
        )
    }

    /* ── MAIN VIEW ─────────────────────────────────────── */
    return (
        <Layout>
            <div
                className="d-flex justify-content-between align-items-center flex-wrap gap-3 rounded-4 px-4 py-4 mb-4"
                style={{ background: BRAND + '1a' }}
            >
                <div>
                    <p
                        className="mb-1 fw-semibold text-uppercase"
                        style={{ fontSize: '0.68rem', letterSpacing: '0.1em', color: BRAND }}
                    >
                        Stock
                    </p>
                    <h4 className="fw-bold mb-1">Materials Stock Overview</h4>
                    <small className="text-muted">Manage materials stock movements and warehouse assignments.</small>
                </div>
                <button
                    type="button"
                    className="btn rounded-pill d-flex align-items-center gap-2 fw-semibold px-4 py-2"
                    style={btnBrand}
                    onClick={() =>
                        document.getElementById('create-form')?.scrollIntoView({ behavior: 'smooth' })
                    }
                >
                    <MdOutlineAddBox size={18} /> New Record
                </button>
            </div>

            <div id="create-form" className="card rounded-4 border-0 shadow-sm mb-4">
                <div className="card-body px-4 pt-4 pb-3">
                    <div className="d-flex align-items-center gap-3 mb-3">
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background: BRAND + '18',
                                color: BRAND,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 18,
                            }}
                        >
                            <MdOutlineInventory2 />
                        </div>
                        <div>
                            <p className="fw-semibold mb-0">Register new Materials Stock</p>
                            <small className="text-muted">Select material, warehouse, type and quantity</small>
                        </div>
                    </div>

                    <form onSubmit={createMaterialsStock}>
                        <div className="row g-3 pb-2">
                            <div className="col-12 col-md-6 col-lg-4">
                                <label className="form-label fw-semibold small">Material</label>
                                <select id="material_id" className={selectCls} required defaultValue="">
                                    <option value="" disabled>
                                        Select Material
                                    </option>
                                    {materialOptions.map((m) => (
                                        <option key={m.mid} value={String(m.mid)}>
                                            {m.material}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-12 col-md-6 col-lg-4">
                                <label className="form-label fw-semibold small">Type</label>
                                <select id="type" className={selectCls} required defaultValue="">
                                    <option value="" disabled>
                                        Select Type
                                    </option>
                                    <option value="IN">IN</option>
                                    <option value="OUT">OUT</option>
                                </select>
                            </div>
                            <div className="col-12 col-md-6 col-lg-4">
                                <label className="form-label fw-semibold small">Quantity</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className={inputCls}
                                    id="qty"
                                    placeholder="Enter quantity"
                                    required
                                />
                            </div>
                            <div className="col-12 col-md-6 col-lg-6">
                                <label className="form-label fw-semibold small">Warehouse</label>
                                <select id="warehouse_id" className={selectCls} required defaultValue="">
                                    <option value="" disabled>
                                        Select Warehouse
                                    </option>
                                    {warehouseOptions.map((w) => (
                                        <option key={w.wid} value={String(w.wid)}>
                                            {warehouseLabel(w)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-12 col-md-6 col-lg-6">
                                <label className="form-label fw-semibold small">Date</label>
                                <input
                                    type="date"
                                    className={inputCls}
                                    id="date"
                                    defaultValue={todayISO()}
                                    required
                                />
                            </div>
                            <div className="col-12">
                                <button
                                    type={submitting ? 'button' : 'submit'}
                                    disabled={submitting}
                                    className="btn rounded-3 d-flex align-items-center gap-2 fw-semibold"
                                    style={btnBrand}
                                >
                                    <MdOutlineAddBox size={18} />
                                    {submitting ? 'Creating...' : 'Create Materials Stock'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <div className="card rounded-4 border-0 shadow-sm mb-4">
                <div className="card-body px-4 pt-4">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                        <div>
                            <p className="fw-semibold mb-0">Materials Stock List</p>
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
                                    placeholder="Search materials stock..."
                                    style={{ fontSize: '0.875rem' }}
                                />
                            </div>
                        </form>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead>
                                <tr
                                    className="text-uppercase"
                                    style={{ fontSize: '0.7rem', letterSpacing: '0.06em', color: '#6b7280' }}
                                >
                                    <th className="text-nowrap fw-semibold">#</th>
                                    <th className="text-nowrap fw-semibold">Material</th>
                                    <th className="text-nowrap fw-semibold">Type</th>
                                    <th className="text-nowrap fw-semibold">Quantity</th>
                                    <th className="text-nowrap fw-semibold">Warehouse</th>
                                    <th className="text-nowrap fw-semibold">Date</th>
                                    <th className="text-end text-nowrap fw-semibold">Operations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted py-4">
                                            No data to show...
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row) => (
                                        <tr key={row.msid}>
                                            <td className="text-nowrap text-muted small">#{row.msid}</td>
                                            <td className="text-nowrap fw-semibold">{row.material}</td>
                                            <td className="text-nowrap text-muted">{row.type}</td>
                                            <td className="text-nowrap">{row.qty}</td>
                                            <td className="text-nowrap text-muted">{row.warehouse}</td>
                                            <td className="text-nowrap text-muted small">{row.date}</td>
                                            <td className="text-end text-nowrap">
                                                <button
                                                    type="button"
                                                    onClick={() => checkEditMaterialsStock(row.msid)}
                                                    className="btn btn-sm me-1"
                                                    style={{ color: BRAND, background: BRAND + '12' }}
                                                >
                                                    <FaEdit size={15} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteId(row.msid)}
                                                    className="btn btn-sm"
                                                    style={{ color: '#ef4444', background: '#ef444412' }}
                                                >
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
                                    Are you sure you want to delete materials stock record{' '}
                                    <strong>#ID: {deleteId}</strong>?
                                </p>
                            </div>
                            <button
                                type="button"
                                className="btn-close ms-2 shadow-none"
                                onClick={() => setDeleteId(null)}
                            />
                        </div>
                        <div className="d-flex justify-content-end mt-3 gap-2">
                            <button type="button" className="btn btn-light rounded-3" onClick={() => setDeleteId(null)}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-danger rounded-3" onClick={handleDelete}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    )
}

export default MaterialsStock
