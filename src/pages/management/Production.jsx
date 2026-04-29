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

const Production = () => {
    const [rows, setRows] = useState([])
    const [productOptions, setProductOptions] = useState([])
    const [machineOptions, setMachineOptions] = useState([])
    const [editRow, setEditRow] = useState(null)
    const [deleteId, setDeleteId] = useState(null)
    const [pagination, setPagination] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [search, setSearch] = useState('')
    const location = useLocation()

    function loadDropdowns() {
        api.get('/admin/products?page=1')
            .then((res) => setProductOptions(res.data.data || []))
            .catch(() => setProductOptions([]))

        api.get('/admin/machines')
            .then((res) => setMachineOptions(Array.isArray(res.data.data) ? res.data.data : []))
            .catch(() => setMachineOptions([]))
    }

    function fetchProduction(page = 1, searchValue = '') {
        let url = `/admin/production?page=${page}`
        if (searchValue && searchValue.trim() !== '') {
            url += `&search=${encodeURIComponent(searchValue.trim())}`
        }

        api.get(url)
            .then((response) => {
                setRows(response.data.data || [])
                setPagination(response.data || {})
            })
            .catch(() => toast.error('Failed to fetch production.'))
    }

    function createProduction(e) {
        e.preventDefault()
        setSubmitting(true)

        const product_id = document.getElementById('product_id').value
        const machine_id = document.getElementById('machine_id').value
        const qty = document.getElementById('qty').value
        const date = document.getElementById('date').value

        api.post('/admin/create_production', {
            product_id: Number(product_id),
            machine_id: Number(machine_id),
            qty,
            date,
        })
            .then(() => {
                toast.success('Production registered successfully.')
                fetchProduction()
                document.getElementById('qty').value = ''
                document.getElementById('date').value = todayISO()
                setSubmitting(false)
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || 'Failed to create production record.')
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
        fetchProduction(1, value)
    }

    function checkEditProduction(id) {
        api.get(`/admin/edit_production/${id}`)
            .then((response) => {
                const row = response.data
                setEditRow(row)

                api.get('/admin/products?page=1').then((r) => {
                    let list = r.data.data || []
                    if (!list.some((p) => Number(p.pid) === Number(row.product_id))) {
                        list = [...list, { pid: row.product_id, product: row.product }]
                    }
                    setProductOptions(list)
                })

                api.get('/admin/machines').then((r) => {
                    let machines = Array.isArray(r.data.data) ? r.data.data : []
                    if (!machines.some((m) => Number(m.mid) === Number(row.machine_id))) {
                        machines = [...machines, { mid: row.machine_id, machine: row.machine, type: null }]
                    }
                    setMachineOptions(machines)
                })
            })
            .catch((err) => toast.error(err?.response?.data?.message || 'No information found.'))
    }

    function updateProduction(e) {
        e.preventDefault()
        setSubmitting(true)

        const pid = document.getElementById('pid').value
        const product_id = document.getElementById('product_id').value
        const machine_id = document.getElementById('machine_id').value
        const qty = document.getElementById('qty').value
        const date = document.getElementById('date').value

        api.post('/admin/update_production', {
            pid,
            product_id: Number(product_id),
            machine_id: Number(machine_id),
            qty,
            date,
        })
            .then(() => {
                toast.success('Production updated successfully.')
                setSubmitting(false)
                setEditRow(null)
                fetchProduction()
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || 'Failed to update production.')
                setSubmitting(false)
            })
    }

    function handleDelete() {
        api.get(`/admin/delete_production/${deleteId}`)
            .then(() => {
                toast.success('Production deleted successfully.')
                fetchProduction()
                setDeleteId(null)
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || 'Failed to delete production.')
                setDeleteId(null)
            })
    }

    useEffect(() => {
        loadDropdowns()
    }, [])

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const page = params.get('page') || 1
        const urlSearch = params.get('search') || ''
        setSearch(urlSearch)
        fetchProduction(page, urlSearch)
    }, [location.search])

    return (
        <Layout>
            {!editRow && (
                <>
                    <h4 className="fw-bold">Production</h4>
                    <small className="d-inline-block opacity-75">Record production</small>
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
                            Update Production <strong>#ID:{editRow.pid}</strong>
                        </span>
                    </div>
                    <div className="card-body">
                        <form method="post" onSubmit={updateProduction}>
                            <input type="hidden" id="pid" name="pid" value={editRow.pid} required />
                            <div className="row g-3">
                                <div className="col-12 col-md-6 col-lg-4">
                                    <label htmlFor="product_id" className="form-label">Product</label>
                                    <select
                                        id="product_id"
                                        className="form-select rounded-4 shadow-none"
                                        defaultValue={String(editRow.product_id)}
                                        required
                                    >
                                        {productOptions.map((p) => (
                                            <option key={p.pid} value={String(p.pid)}>{p.product}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-12 col-md-6 col-lg-4">
                                    <label htmlFor="machine_id" className="form-label">Machine</label>
                                    <select
                                        id="machine_id"
                                        className="form-select rounded-4 shadow-none"
                                        defaultValue={String(editRow.machine_id)}
                                        required
                                    >
                                        {machineOptions.map((m) => (
                                            <option key={m.mid} value={String(m.mid)}>
                                                {m.machine} {m.type ? `(${m.type})` : ''}
                                            </option>
                                        ))}
                                    </select>
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
                                <div className="col-12">
                                    {submitting ? (
                                        <button type="button" className="btn btn-success rounded-4" disabled>Updating...</button>
                                    ) : (
                                        <button type="submit" className="btn btn-success rounded-4 d-flex align-items-center gap-1">
                                            <FaEdit /> Update Production
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
                            <span className="fw-semibold">Register new Production</span>
                        </div>
                        <div className="card-body">
                            <form method="post" onSubmit={createProduction}>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="product_id" className="form-label">Product</label>
                                        <select id="product_id" className="form-select rounded-4 shadow-none" required>
                                            <option value="">— Select —</option>
                                            {productOptions.map((p) => (
                                                <option key={p.pid} value={String(p.pid)}>{p.product}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="machine_id" className="form-label">Machine</label>
                                        <select id="machine_id" className="form-select rounded-4 shadow-none" required>
                                            <option value="">— Select —</option>
                                            {machineOptions.map((m) => (
                                                <option key={m.mid} value={String(m.mid)}>
                                                    {m.machine} {m.type ? `(${m.type})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="qty" className="form-label">Quantity</label>
                                        <input type="number" step="0.01" min="0" className="form-control rounded-4 shadow-none" id="qty" placeholder="Enter quantity" required />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="date" className="form-label">Date</label>
                                        <input type="date" className="form-control rounded-4 shadow-none" id="date" defaultValue={todayISO()} placeholder="Select date" required />
                                    </div>
                                    <div className="col-12">
                                        {submitting ? (
                                            <button type="button" className="btn btn-success rounded-4" disabled>Saving...</button>
                                        ) : (
                                            <button type="submit" className="btn btn-success rounded-4 d-flex align-items-center gap-1">
                                                <MdOutlineAddBox /> Create Production
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="card rounded-4 my-4">
                        <div className="card-header rounded-4">
                            <span className="fw-semibold">Production List</span>
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
                                            <th className="text-nowrap" scope="col">Machine</th>
                                            <th className="text-nowrap" scope="col">Qty</th>
                                            <th className="text-nowrap" scope="col">Date</th>
                                            <th className="text-end text-nowrap" scope="col">Operations</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center">No data to show...</td>
                                            </tr>
                                        ) : (
                                            rows.map((row) => (
                                                <tr key={row.pid}>
                                                    <td className="text-nowrap">{row.pid}</td>
                                                    <td className="text-nowrap">{row.product}</td>
                                                    <td className="text-nowrap">{row.machine}</td>
                                                    <td className="text-nowrap">{row.qty}</td>
                                                    <td className="text-nowrap">{String(row.date || '').slice(0, 10)}</td>
                                                    <td className="text-end text-nowrap">
                                                        <button
                                                            type="button"
                                                            onClick={() => checkEditProduction(row.pid)}
                                                            className="btn btn-success btn-sm shadow-sm me-2"
                                                        >
                                                            <FaEdit size={20} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeleteId(row.pid)}
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
                        <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4 px-3" style={{ zIndex: 1050, width: '100%', maxWidth: '500px' }}>
                            <div className="bg-white shadow-lg rounded-4 p-3 border">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>Confirm deletion</strong>
                                        <p className="mb-0 small text-muted">
                                            Delete production <strong>#ID: {deleteId}</strong>?
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

export default Production