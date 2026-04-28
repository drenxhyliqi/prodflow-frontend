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

const Staff = () => {
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
            .then((res) => {
                setCompanies(res.data.data || [])
            })
            .catch(() => toast.error('Failed to load companies.'))
    }

    function getStaff(page = 1, searchValue = '') {
        if (!companyId) {
            setRows([])
            setPagination({})
            return
        }
        let url = `/admin/staff?company_id=${companyId}&page=${page}`
        if (searchValue && searchValue.trim() !== '') {
            url += `&search=${encodeURIComponent(searchValue.trim())}`
        }
        api.get(url)
            .then((response) => {
                setRows(response.data.data)
                setPagination(response.data)
            })
            .catch(() => {
                toast.error('Failed to fetch staff.')
            })
    }

    function createStaff(e) {
        e.preventDefault()
        if (!companyId) {
            toast.error('Select a company first.')
            return
        }
        setSubmitting(true)
        const name = document.getElementById('name').value
        const surname = document.getElementById('surname').value
        const position = document.getElementById('position').value
        const contact = document.getElementById('contact').value
        api.post('/admin/create_staff', {
            name,
            surname,
            position,
            contact,
            company_id: Number(companyId),
        })
            .then(() => {
                toast.success('Staff created successfully.')
                getStaff()
                clearFields()
                setSubmitting(false)
            })
            .catch(() => {
                toast.error('Failed to create staff.')
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
        getStaff(1, value)
    }

    function checkEditStaff(id) {
        api.get(`/admin/edit_staff/${id}?company_id=${companyId}`)
            .then((response) => {
                setEditRow(response.data)
            })
            .catch(() => {
                toast.error('No information found.')
            })
    }

    function updateStaff(e) {
        e.preventDefault()
        setSubmitting(true)
        const sid = document.getElementById('sid').value
        const name = document.getElementById('name').value
        const surname = document.getElementById('surname').value
        const position = document.getElementById('position').value
        const contact = document.getElementById('contact').value
        api.post('/admin/update_staff', {
            sid,
            company_id: Number(companyId),
            name,
            surname,
            position,
            contact,
        })
            .then(() => {
                toast.success('Staff updated successfully.')
                setSubmitting(false)
                setEditRow(null)
                getStaff()
            })
            .catch(() => {
                toast.error('Failed to update staff.')
                setSubmitting(false)
            })
    }

    function handleDelete() {
        api.get(`/admin/delete_staff/${deleteId}?company_id=${companyId}`)
            .then(() => {
                toast.success('Staff deleted successfully.')
                getStaff()
                setDeleteId(null)
            })
            .catch(() => {
                toast.error('Failed to delete staff.')
                setDeleteId(null)
            })
    }

    function clearFields() {
        document.getElementById('name').value = ''
        document.getElementById('surname').value = ''
        document.getElementById('position').value = ''
        document.getElementById('contact').value = ''
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
        if (cid) getStaff(page, urlSearch)
        else {
            setRows([])
            setPagination({})
        }
    }, [location.search])

    return (
        <Layout>
            {!editRow && (
                <>
                    <h4 className="fw-bold">Staff</h4>
                    <small className="d-inline-block opacity-75">Manage staff by company</small>
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
                            Select company (required for list &amp; create)
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
                    </div>
                </div>
            )}

            {editRow && (
                <div className="card rounded-4 mt-3">
                    <div className="card-header rounded-4">
                        <span className="fw-semibold">
                            Update Staff <strong>#ID:{editRow.sid}</strong>
                        </span>
                    </div>
                    <div className="card-body">
                        <form method="post" onSubmit={updateStaff}>
                            <input type="hidden" id="sid" name="sid" value={editRow.sid} required />
                            <div className="row g-3">
                                <div className="col-12 col-md-6 col-lg-4">
                                    <label htmlFor="name" className="form-label">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue={editRow.name}
                                        className="form-control rounded-4 shadow-none"
                                        id="name"
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-6 col-lg-4">
                                    <label htmlFor="surname" className="form-label">
                                        Surname
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue={editRow.surname}
                                        className="form-control rounded-4 shadow-none"
                                        id="surname"
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-6 col-lg-4">
                                    <label htmlFor="position" className="form-label">
                                        Position
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue={editRow.position}
                                        className="form-control rounded-4 shadow-none"
                                        id="position"
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-6 col-lg-4">
                                    <label htmlFor="contact" className="form-label">
                                        Contact
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue={editRow.contact || ''}
                                        className="form-control rounded-4 shadow-none"
                                        id="contact"
                                    />
                                </div>
                                <div className="col-12">
                                    {submitting ? (
                                        <button type="button" className="btn btn-success rounded-4" disabled>
                                            Updating...
                                        </button>
                                    ) : (
                                        <button type="submit" className="btn btn-success rounded-4 d-flex align-items-center gap-1">
                                            <FaEdit /> Update Staff
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
                            <span className="fw-semibold">Register new Staff</span>
                        </div>
                        <div className="card-body">
                            <form method="post" onSubmit={createStaff}>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="name" className="form-label">
                                            Name
                                        </label>
                                        <input type="text" className="form-control rounded-4 shadow-none" id="name" required />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="surname" className="form-label">
                                            Surname
                                        </label>
                                        <input type="text" className="form-control rounded-4 shadow-none" id="surname" required />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="position" className="form-label">
                                            Position
                                        </label>
                                        <input type="text" className="form-control rounded-4 shadow-none" id="position" required />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="contact" className="form-label">
                                            Contact
                                        </label>
                                        <input type="text" className="form-control rounded-4 shadow-none" id="contact" />
                                    </div>
                                    <div className="col-12">
                                        {submitting ? (
                                            <button type="button" className="btn btn-success rounded-4" disabled>
                                                Creating...
                                            </button>
                                        ) : (
                                            <button type="submit" className="btn btn-success rounded-4 d-flex align-items-center gap-1">
                                                <MdOutlineAddBox /> Create Staff
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="card rounded-4 my-4">
                        <div className="card-header rounded-4">
                            <span className="fw-semibold">Staff List</span>
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
                                                Name
                                            </th>
                                            <th className="text-nowrap" scope="col">
                                                Surname
                                            </th>
                                            <th className="text-nowrap" scope="col">
                                                Position
                                            </th>
                                            <th className="text-nowrap" scope="col">
                                                Contact
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
                                                    Select a company to load staff.
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
                                                <tr key={row.sid}>
                                                    <td className="text-nowrap">{row.sid}</td>
                                                    <td className="text-nowrap">{row.name}</td>
                                                    <td className="text-nowrap">{row.surname}</td>
                                                    <td className="text-nowrap">{row.position}</td>
                                                    <td className="text-nowrap">{row.contact || '—'}</td>
                                                    <td className="text-end text-nowrap">
                                                        <button
                                                            type="button"
                                                            onClick={() => checkEditStaff(row.sid)}
                                                            className="btn btn-success btn-sm shadow-sm me-2"
                                                        >
                                                            <FaEdit size={20} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeleteId(row.sid)}
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
                                            Delete staff member <strong>#ID: {deleteId}</strong>?
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

export default Staff
