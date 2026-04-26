import React, { useEffect, useState } from 'react'
import Layout from '../../layouts/Layout'
import api from '../../api/axios'
import { toast } from 'react-toastify'
import { MdOutlineAddBox } from 'react-icons/md'
import Paginate from '../../components/Paginate'
import { FaSearch } from 'react-icons/fa'
import { useLocation } from 'react-router-dom'
import { FaEdit } from 'react-icons/fa'
import { IoIosArrowBack } from 'react-icons/io'
import { MdDeleteOutline } from 'react-icons/md'

const todayISO = () => new Date().toISOString().slice(0, 10)

const Production = () => {
    const [rows, setRows] = useState([])
    const [companies, setCompanies] = useState([])
    const [companyId, setCompanyId] = useState('')
    const [productOptions, setProductOptions] = useState([])
    const [machineOptions, setMachineOptions] = useState([])
    const [editRow, setEditRow] = useState(null)
    const [deleteId, setDeleteId] = useState(null)
    const [pagination, setPagination] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [search, setSearch] = useState('')
    const location = useLocation()

    function loadCompanies() {
        api.get('/admin/companies?page=1')
            .then((res) => setCompanies(res.data.data || []))
            .catch(() => toast.error('Failed to load companies.'))
    }

    function loadDropdowns(cid) {
        if (!cid) {
            setProductOptions([])
            setMachineOptions([])
            return
        }
        api.get(`/admin/products?company_id=${cid}&page=1`)
            .then((res) => setProductOptions(res.data.data || []))
            .catch(() => setProductOptions([]))
        api.get(`/admin/machines?company_id=${cid}`)
            .then((res) => setMachineOptions(Array.isArray(res.data) ? res.data : []))
            .catch(() => setMachineOptions([]))
    }

    function fetchProduction(cid, page = 1, searchValue = '') {
        if (!cid) {
            setRows([])
            setPagination({})
            return
        }
        let url = `/admin/production?company_id=${cid}&page=${page}`
        if (searchValue && searchValue.trim() !== '') {
            url += `&search=${encodeURIComponent(searchValue.trim())}`
        }
        api.get(url)
            .then((response) => {
                setRows(response.data.data)
                setPagination(response.data)
            })
            .catch(() => toast.error('Failed to fetch production.'))
    }

    function createProduction(e) {
        e.preventDefault()
        if (!companyId) {
            toast.error('Select a company first.')
            return
        }
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
            company_id: Number(companyId),
        })
            .then(() => {
                toast.success('Production registered successfully.')
                fetchProduction(companyId)
                document.getElementById('qty').value = ''
                document.getElementById('date').value = todayISO()
                setSubmitting(false)
            })
            .catch(() => {
                toast.error('Failed to create production record.')
                setSubmitting(false)
            })
    }

    const handleSearch = (e) => {
        e.preventDefault()
        const value = e.target.search.value.trim()
        const params = new URLSearchParams(location.search)
        params.set('search', value)
        params.set('page', 1)
        if (companyId) params.set('company_id', companyId)
        window.history.pushState({}, '', `?${params.toString()}`)
        fetchProduction(companyId || new URLSearchParams(location.search).get('company_id'), 1, value)
    }

    function checkEditProduction(id) {
        const cid = companyId || new URLSearchParams(location.search).get('company_id')
        api.get(`/admin/edit_production/${id}?company_id=${cid}`)
            .then((response) => {
                const row = response.data
                setEditRow(row)
                api.get(`/admin/products?company_id=${cid}&page=1`).then((r) => {
                    let list = r.data.data || []
                    if (!list.some((p) => Number(p.pid) === Number(row.product_id))) {
                        list = [...list, { pid: row.product_id, product: row.product }]
                    }
                    setProductOptions(list)
                })
                api.get(`/admin/machines?company_id=${cid}`).then((r) => {
                    let machines = Array.isArray(r.data) ? r.data : []
                    if (!machines.some((m) => Number(m.mid) === Number(row.machine_id))) {
                        machines = [...machines, { mid: row.machine_id, machine: row.machine, type: null }]
                    }
                    setMachineOptions(machines)
                })
            })
            .catch(() => toast.error('No information found.'))
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
            company_id: Number(companyId),
            product_id: Number(product_id),
            machine_id: Number(machine_id),
            qty,
            date,
        })
            .then(() => {
                toast.success('Production updated successfully.')
                setSubmitting(false)
                setEditRow(null)
                fetchProduction(companyId)
            })
            .catch(() => {
                toast.error('Failed to update production.')
                setSubmitting(false)
            })
    }

    function handleDelete() {
        api.get(`/admin/delete_production/${deleteId}?company_id=${companyId}`)
            .then(() => {
                toast.success('Production deleted successfully.')
                fetchProduction(companyId)
                setDeleteId(null)
            })
            .catch(() => {
                toast.error('Failed to delete production.')
                setDeleteId(null)
            })
    }

    const onCompanyChange = (e) => {
        const id = e.target.value
        setCompanyId(id)
        const params = new URLSearchParams(location.search)
        if (id) params.set('company_id', id)
        else params.delete('company_id')
        params.set('page', 1)
        window.history.pushState({}, '', `?${params.toString()}`)
        setSearch('')
    }

    useEffect(() => {
        loadCompanies()
    }, [])

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const page = params.get('page') || 1
        const urlSearch = params.get('search') || ''
        const cid = params.get('company_id') || ''
        setCompanyId(cid)
        setSearch(urlSearch)
        fetchProduction(cid, page, urlSearch)
        loadDropdowns(cid)
    }, [location.search])

    return (
        <Layout>
            {!editRow && (
                <>
                    <h4 className="fw-bold">Production</h4>
                    <small className="d-inline-block opacity-75">Record production by company</small>
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

            {!editRow && (
                <div className="card rounded-4 mt-3">
                    <div className="card-header rounded-4">
                        <span className="fw-semibold">Company</span>
                    </div>
                    <div className="card-body">
                        <label className="form-label" htmlFor="company_id">
                            Select company (required)
                        </label>
                        <select
                            id="company_id"
                            className="form-select rounded-4 shadow-none"
                            value={companyId}
                            onChange={onCompanyChange}
                        >
                            <option value="">— Choose —</option>
                            {companies.map((c) => (
                                <option key={c.cid} value={String(c.cid)}>
                                    {c.name} (#{c.cid})
                                </option>
                            ))}
                        </select>
                        <p className="small text-muted mb-0 mt-2">
                            Product and machine dropdowns use the first page of products (10 max) and all machines for this company.
                        </p>
                    </div>
                </div>
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
                                    <label htmlFor="product_id" className="form-label">
                                        Product
                                    </label>
                                    <select
                                        id="product_id"
                                        className="form-select rounded-4 shadow-none"
                                        defaultValue={String(editRow.product_id)}
                                        required
                                    >
                                        {productOptions.map((p) => (
                                            <option key={p.pid} value={String(p.pid)}>
                                                {p.product}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-12 col-md-6 col-lg-4">
                                    <label htmlFor="machine_id" className="form-label">
                                        Machine
                                    </label>
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
                                    <label htmlFor="qty" className="form-label">
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        defaultValue={editRow.qty}
                                        className="form-control rounded-4 shadow-none"
                                        id="qty"
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-6 col-lg-4">
                                    <label htmlFor="date" className="form-label">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        defaultValue={String(editRow.date || '').slice(0, 10)}
                                        className="form-control rounded-4 shadow-none"
                                        id="date"
                                        required
                                    />
                                </div>
                                <div className="col-12">
                                    {submitting ? (
                                        <button type="button" className="btn btn-success rounded-4" disabled>
                                            Updating...
                                        </button>
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
                                        <label htmlFor="product_id" className="form-label">
                                            Product
                                        </label>
                                        <select id="product_id" className="form-select rounded-4 shadow-none" required disabled={!companyId}>
                                            <option value="">— Select —</option>
                                            {productOptions.map((p) => (
                                                <option key={p.pid} value={String(p.pid)}>
                                                    {p.product}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="machine_id" className="form-label">
                                            Machine
                                        </label>
                                        <select id="machine_id" className="form-select rounded-4 shadow-none" required disabled={!companyId}>
                                            <option value="">— Select —</option>
                                            {machineOptions.map((m) => (
                                                <option key={m.mid} value={String(m.mid)}>
                                                    {m.machine} {m.type ? `(${m.type})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="qty" className="form-label">
                                            Quantity
                                        </label>
                                        <input type="number" step="0.01" min="0" className="form-control rounded-4 shadow-none" id="qty" required />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="date" className="form-label">
                                            Date
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control rounded-4 shadow-none"
                                            id="date"
                                            defaultValue={todayISO()}
                                            required
                                        />
                                    </div>
                                    <div className="col-12">
                                        {submitting ? (
                                            <button type="button" className="btn btn-success rounded-4" disabled>
                                                Saving...
                                            </button>
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
                                            disabled={!companyId}
                                        />
                                        <button className="btn btn-primary rounded-end-4" type="submit" disabled={!companyId}>
                                            <FaSearch />
                                        </button>
                                    </div>
                                </form>
                            </div>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th className="text-nowrap" scope="col">
                                                #
                                            </th>
                                            <th className="text-nowrap" scope="col">
                                                Product
                                            </th>
                                            <th className="text-nowrap" scope="col">
                                                Machine
                                            </th>
                                            <th className="text-nowrap" scope="col">
                                                Qty
                                            </th>
                                            <th className="text-nowrap" scope="col">
                                                Date
                                            </th>
                                            <th className="text-end text-nowrap" scope="col">
                                                Operations
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {!companyId ? (
                                            <tr>
                                                <td colSpan="6" className="text-center">
                                                    Select a company to load production.
                                                </td>
                                            </tr>
                                        ) : rows.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center">
                                                    No data to show...
                                                </td>
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
                            {companyId ? <Paginate data={pagination} /> : null}
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
                                            Delete production <strong>#ID: {deleteId}</strong>?
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

export default Production
