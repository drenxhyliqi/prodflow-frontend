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

const todayISO = () => new Date().toISOString().slice(0, 10)

const MaterialsStock = () => {
    const [rows, setRows] = useState([])
    const [materialOptions, setMaterialOptions] = useState([])
    const [warehouseOptions, setWarehouseOptions] = useState([])
    const [companyOptions, setCompanyOptions] = useState([])
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

        api.get('/admin/companies?page=1')
            .then((res) => setCompanyOptions(res.data.data || []))
            .catch(() => setCompanyOptions([]))
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
        const company_id = document.getElementById('company_id').value

        api.post('/admin/create_materials_stock', {
            material_id: Number(material_id),
            type,
            qty,
            date,
            warehouse_id: Number(warehouse_id),
            company_id: Number(company_id),
        })
            .then(() => {
                toast.success('Materials stock registered successfully.')
                fetchMaterialsStock()
                clearFields()
                setSubmitting(false)
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || 'Failed to create materials stock record.')
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
        fetchMaterialsStock(1, value)
    }

    function checkEditMaterialsStock(id) {
        api.get(`/admin/edit_materials_stock/${id}`)
            .then((response) => {
                const row = response.data
                setEditRow(row)

                // Ensure options include the selected ones if not already
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
                        list = [...list, { wid: row.warehouse_id, name: row.warehouse }]
                    }
                    setWarehouseOptions(list)
                })

                api.get('/admin/companies?page=1').then((r) => {
                    let list = r.data.data || []
                    if (!list.some((c) => Number(c.cid) === Number(row.company_id))) {
                        list = [...list, { cid: row.company_id, name: row.company }]
                    }
                    setCompanyOptions(list)
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
        const company_id = document.getElementById('company_id').value

        api.post('/admin/update_materials_stock', {
            msid,
            material_id: Number(material_id),
            type,
            qty,
            date,
            warehouse_id: Number(warehouse_id),
            company_id: Number(company_id),
        })
            .then(() => {
                toast.success('Materials stock updated successfully.')
                setSubmitting(false)
                setEditRow(null)
                fetchMaterialsStock()
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || 'Failed to update materials stock.')
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

    return (
        <Layout>
            {!editRow && (
                <>
                    <h4 className="fw-bold">Materials Stock</h4>
                    <small className="d-inline-block opacity-75">Manage materials stock records</small>
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
                            Update Materials Stock <strong>#ID:{editRow.msid}</strong>
                        </span>
                    </div>
                    <div className="card-body">
                        <form method="post" onSubmit={updateMaterialsStock}>
                            <input type="hidden" id="msid" name="msid" value={editRow.msid} required />
                            <div className="row g-3">
                                <div className="col-12 col-md-6 col-lg-4">
                                    <label htmlFor="material_id" className="form-label">Material</label>
                                    <select
                                        id="material_id"
                                        className="form-select rounded-4 shadow-none"
                                        defaultValue={String(editRow.material_id)}
                                        required
                                    >
                                        {materialOptions.map((m) => (
                                            <option key={m.mid} value={String(m.mid)}>{m.material}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-12 col-md-6 col-lg-4">
                                    <label htmlFor="type" className="form-label">Type</label>
                                    <input
                                        type="text"
                                        defaultValue={editRow.type}
                                        className="form-control rounded-4 shadow-none"
                                        id="type"
                                        placeholder="Enter type"
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-6 col-lg-4">
                                    <label htmlFor="qty" className="form-label">Quantity</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        defaultValue={editRow.qty}
                                        className="form-control rounded-4 shadow-none"
                                        id="qty"
                                        placeholder="Enter quantity"
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-6 col-lg-4">
                                    <label htmlFor="date" className="form-label">Date</label>
                                    <input
                                        type="date"
                                        defaultValue={String(editRow.date || '').slice(0, 10)}
                                        className="form-control rounded-4 shadow-none"
                                        id="date"
                                        placeholder="Select date"
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-6 col-lg-4">
                                    <label htmlFor="warehouse_id" className="form-label">Warehouse</label>
                                    <select
                                        id="warehouse_id"
                                        className="form-select rounded-4 shadow-none"
                                        defaultValue={String(editRow.warehouse_id)}
                                        required
                                    >
                                        {warehouseOptions.map((w) => (
                                            <option key={w.wid} value={String(w.wid)}>{w.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-12 col-md-6 col-lg-4">
                                    <label htmlFor="company_id" className="form-label">Company</label>
                                    <select
                                        id="company_id"
                                        className="form-select rounded-4 shadow-none"
                                        defaultValue={String(editRow.company_id)}
                                        required
                                    >
                                        {companyOptions.map((c) => (
                                            <option key={c.cid} value={String(c.cid)}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-12">
                                    {submitting ? (
                                        <button type="button" className="btn btn-success rounded-4" disabled>
                                            Updating...
                                        </button>
                                    ) : (
                                        <button type="submit" className="btn btn-success rounded-4 d-flex align-items-center gap-1">
                                            <FaEdit /> Update Materials Stock
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
                            <span className="fw-semibold">Register new Materials Stock</span>
                        </div>
                        <div className="card-body">
                            <form method="post" onSubmit={createMaterialsStock}>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="material_id" className="form-label">Material</label>
                                        <select id="material_id" className="form-select rounded-4 shadow-none" required>
                                            <option value="">— Select —</option>
                                            {materialOptions.map((m) => (
                                                <option key={m.mid} value={String(m.mid)}>{m.material}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="type" className="form-label">Type</label>
                                        <input type="text" className="form-control rounded-4 shadow-none" id="type" placeholder="Enter type" required />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="qty" className="form-label">Quantity</label>
                                        <input type="number" step="0.01" min="0" className="form-control rounded-4 shadow-none" id="qty" placeholder="Enter quantity" required />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="date" className="form-label">Date</label>
                                        <input type="date" className="form-control rounded-4 shadow-none" id="date" defaultValue={todayISO()} placeholder="Select date" required />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="warehouse_id" className="form-label">Warehouse</label>
                                        <select id="warehouse_id" className="form-select rounded-4 shadow-none" required>
                                            <option value="">— Select —</option>
                                            {warehouseOptions.map((w) => (
                                                <option key={w.wid} value={String(w.wid)}>{w.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="company_id" className="form-label">Company</label>
                                        <select id="company_id" className="form-select rounded-4 shadow-none" required>
                                            <option value="">— Select —</option>
                                            {companyOptions.map((c) => (
                                                <option key={c.cid} value={String(c.cid)}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-12">
                                        {submitting ? (
                                            <button type="button" className="btn btn-success rounded-4" disabled>
                                                Creating...
                                            </button>
                                        ) : (
                                            <button type="submit" className="btn btn-success rounded-4 d-flex align-items-center gap-1">
                                                <MdOutlineAddBox /> Create Materials Stock
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="card rounded-4 my-4">
                        <div className="card-header rounded-4">
                            <span className="fw-semibold">Materials Stock List</span>
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
                                            <th className="text-nowrap" scope="col">Material</th>
                                            <th className="text-nowrap" scope="col">Type</th>
                                            <th className="text-nowrap" scope="col">Quantity</th>
                                            <th className="text-nowrap" scope="col">Date</th>
                                            <th className="text-nowrap" scope="col">Warehouse</th>
                                            <th className="text-nowrap" scope="col">Company</th>
                                            <th className="text-end text-nowrap" scope="col">Operations</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="text-center">
                                                    No data to show...
                                                </td>
                                            </tr>
                                        ) : (
                                            rows.map((row) => (
                                                <tr key={row.msid}>
                                                    <td className="text-nowrap">{row.msid}</td>
                                                    <td className="text-nowrap">{row.material}</td>
                                                    <td className="text-nowrap">{row.type}</td>
                                                    <td className="text-nowrap">{row.qty}</td>
                                                    <td className="text-nowrap">{row.date}</td>
                                                    <td className="text-nowrap">{row.warehouse}</td>
                                                    <td className="text-nowrap">{row.company}</td>
                                                    <td className="text-end text-nowrap">
                                                        <button
                                                            type="button"
                                                            onClick={() => checkEditMaterialsStock(row.msid)}
                                                            className="btn btn-success btn-sm shadow-sm me-2"
                                                        >
                                                            <FaEdit size={20} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeleteId(row.msid)}
                                                            className="btn btn-danger btn-sm shadow-sm"
                                                        >
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
                        <div
                            className="position-fixed bottom-0 start-50 translate-middle-x mb-4 px-3"
                            style={{ zIndex: 1050, width: '100%', maxWidth: '500px' }}
                        >
                            <div className="bg-white shadow-lg rounded-4 p-3 border">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>Confirm deletion</strong>
                                        <p className="mb-0 small text-muted">
                                            Delete materials stock record <strong>#ID: {deleteId}</strong>?
                                        </p>
                                    </div>
                                    <button type="button" className="btn-close ms-2 shadow-none" onClick={() => setDeleteId(null)} />
                                </div>
                                <div className="d-flex justify-content-end mt-3">
                                    <button type="button" className="btn btn-light me-2" onClick={() => setDeleteId(null)}>
                                        Cancel
                                    </button>
                                    <button type="button" className="btn btn-danger" onClick={handleDelete}>
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </Layout>
    )
}

export default MaterialsStock
