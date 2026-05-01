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

const Machines = () => {
    const [rows, setRows] = useState([])
    const [companies, setCompanies] = useState([])
    const [companyId, setCompanyId] = useState('')
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

    function fetchMachines(cid, page = 1, searchValue = '') {
        if (!cid) {
            setRows([])
            setPagination({})
            return
        }
        let url = `/admin/machines?company_id=${cid}&page=${page}`
        if (searchValue && searchValue.trim() !== '') {
            url += `&search=${encodeURIComponent(searchValue.trim())}`
        }
        api.get(url)
            .then((response) => {
                setRows(response.data.data)
                setPagination(response.data)
            })
            .catch(() => toast.error('Failed to fetch machines.'))
    }

    function createMachine(e) {
        e.preventDefault()
        if (!companyId) {
            toast.error('Select a company first.')
            return
        }
        setSubmitting(true)
        const machine = document.getElementById('machine').value
        const type = document.getElementById('type').value
        api.post('/admin/create_machine', {
            machine,
            type,
            company_id: Number(companyId),
        })
            .then(() => {
                toast.success('Machine created successfully.')
                fetchMachines(companyId)
                clearFields()
                setSubmitting(false)
            })
            .catch(() => {
                toast.error('Failed to create machine.')
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
        fetchMachines(companyId || new URLSearchParams(location.search).get('company_id'), 1, value)
    }

    function checkEditMachine(id) {
        const cid = companyId || new URLSearchParams(location.search).get('company_id')
        api.get(`/admin/edit_machine/${id}?company_id=${cid}`)
            .then((response) => setEditRow(response.data))
            .catch(() => toast.error('No information found.'))
    }

    function updateMachine(e) {
        e.preventDefault()
        setSubmitting(true)
        const mid = document.getElementById('mid').value
        const machine = document.getElementById('machine').value
        const type = document.getElementById('type').value
        api.post('/admin/update_machine', {
            mid,
            company_id: Number(companyId),
            machine,
            type,
        })
            .then(() => {
                toast.success('Machine updated successfully.')
                setSubmitting(false)
                setEditRow(null)
                fetchMachines(companyId)
            })
            .catch(() => {
                toast.error('Failed to update machine.')
                setSubmitting(false)
            })
    }

    function handleDelete() {
        api.get(`/admin/delete_machine/${deleteId}?company_id=${companyId}`)
            .then(() => {
                toast.success('Machine deleted successfully.')
                fetchMachines(companyId)
                setDeleteId(null)
            })
            .catch(() => {
                toast.error('Failed to delete machine.')
                setDeleteId(null)
            })
    }

    function clearFields() {
        document.getElementById('machine').value = ''
        document.getElementById('type').value = ''
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
        fetchMachines(cid, page, urlSearch)
    }, [location.search])

    return (
        <Layout>
            {!editRow && (
                <>
                    <h4 className="fw-bold">Machines</h4>
                    <small className="d-inline-block opacity-75">Manage machines by company</small>
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
                            <option value="">- Choose -</option>
                            {companies.map((c) => (
                                <option key={c.cid} value={String(c.cid)}>
                                    {c.name} (#{c.cid})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {editRow && (
                <div className="card rounded-4 mt-3">
                    <div className="card-header rounded-4">
                        <span className="fw-semibold">
                            Update Machine <strong>#ID:{editRow.mid}</strong>
                        </span>
                    </div>
                    <div className="card-body">
                        <form method="post" onSubmit={updateMachine}>
                            <input type="hidden" id="mid" name="mid" value={editRow.mid} required />
                            <div className="row g-3">
                                <div className="col-12 col-md-6 col-lg-6">
                                    <label htmlFor="machine" className="form-label">
                                        Machine name
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue={editRow.machine}
                                        className="form-control rounded-4 shadow-none"
                                        id="machine"
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-6 col-lg-6">
                                    <label htmlFor="type" className="form-label">
                                        Type
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue={editRow.type}
                                        className="form-control rounded-4 shadow-none"
                                        id="type"
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
                                            <FaEdit /> Update Machine
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
                            <span className="fw-semibold">Register new Machine</span>
                        </div>
                        <div className="card-body">
                            <form method="post" onSubmit={createMachine}>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6 col-lg-6">
                                        <label htmlFor="machine" className="form-label">
                                            Machine name
                                        </label>
                                        <input type="text" className="form-control rounded-4 shadow-none" id="machine" placeholder="Enter machine name" required />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-6">
                                        <label htmlFor="type" className="form-label">
                                            Type
                                        </label>
                                        <input type="text" className="form-control rounded-4 shadow-none" id="type" placeholder="Enter machine type" required />
                                    </div>
                                    <div className="col-12">
                                        {submitting ? (
                                            <button type="button" className="btn btn-success rounded-4" disabled>
                                                Creating...
                                            </button>
                                        ) : (
                                            <button type="submit" className="btn btn-success rounded-4 d-flex align-items-center gap-1">
                                                <MdOutlineAddBox /> Create Machine
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="card rounded-4 my-4">
                        <div className="card-header rounded-4">
                            <span className="fw-semibold">Machines List</span>
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
                                                Machine
                                            </th>
                                            <th className="text-nowrap" scope="col">
                                                Type
                                            </th>
                                            <th className="text-end text-nowrap" scope="col">
                                                Operations
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {!companyId ? (
                                            <tr>
                                                <td colSpan="4" className="text-center">
                                                    Select a company to load machines.
                                                </td>
                                            </tr>
                                        ) : rows.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="text-center">
                                                    No data to show...
                                                </td>
                                            </tr>
                                        ) : (
                                            rows.map((row) => (
                                                <tr key={row.mid}>
                                                    <td className="text-nowrap">{row.mid}</td>
                                                    <td className="text-nowrap">{row.machine}</td>
                                                    <td className="text-nowrap">{row.type}</td>
                                                    <td className="text-end text-nowrap">
                                                        <button
                                                            type="button"
                                                            onClick={() => checkEditMachine(row.mid)}
                                                            className="btn btn-success btn-sm shadow-sm me-2"
                                                        >
                                                            <FaEdit size={20} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeleteId(row.mid)}
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
                                            Delete machine <strong>#ID: {deleteId}</strong>?
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

export default Machines
