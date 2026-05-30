import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import Layout from '../../layouts/Layout'
import api from '../../api/axios'
import { toast } from 'react-toastify';
import { MdOutlineAddBox, MdDeleteOutline } from 'react-icons/md';
import Paginate from '../../components/Paginate';
import { FaSearch, FaEdit, FaCopy } from 'react-icons/fa';
import { IoIosArrowBack } from "react-icons/io";

const BRAND    = '#035dad'
const inputCls = 'form-control shadow-none rounded-3'
const selCls   = 'form-select shadow-none rounded-3'
const btnBrand = { backgroundColor: BRAND, color: '#fff', border: 'none' }

const roleCfg = (role) => {
    const r = (role || '').toLowerCase();
    if (r === 'admin')   return { backgroundColor: '#dbeafe', color: '#1e40af' };
    if (r === 'manager') return { backgroundColor: '#ede9fe', color: '#5b21b6' };
    return                      { backgroundColor: '#f3f4f6', color: '#374151' };
}

const inviteStatusCfg = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'pending')  return { backgroundColor: '#fef9c3', color: '#854d0e' };
    if (s === 'accepted' || s === 'used') return { backgroundColor: '#d1fae5', color: '#065f46' };
    return { backgroundColor: '#fee2e2', color: '#991b1b' };
}

const Users = () => {
    const [users, setUsers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [editUser, setEditUser] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [pagination, setPagination] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('users');
    const location = useLocation();

    // Invitations
    const [invitations, setInvitations] = useState([]);
    const [invitePagination, setInvitePagination] = useState({});
    const [inviteSubmitting, setInviteSubmitting] = useState(false);
    const [inviteSearch, setInviteSearch] = useState('');
    const [revokeLoadingId, setRevokeLoadingId] = useState(null);

    // Create User
    function createUser(e) {
        e.preventDefault();
        setSubmitting(true);
        const user = document.getElementById('user').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const company_id = document.getElementById('company_id').value;
        const role = document.getElementById('role').value;
        api.post('/admin/create_user', { user, username, password, company_id, role })
            .then(response => {
                toast.success(response.data.message);
                getUsers();
                clearFields();
            })
            .catch(error => toast.error(error.response?.data?.message || 'Failed to create user.'))
            .finally(() => setSubmitting(false));
    }

    // Create Invitation
    function createInvitation(e) {
        e.preventDefault();
        setInviteSubmitting(true);
        const user = document.getElementById('invite_user').value;
        const username = document.getElementById('invite_username').value;
        const company_id = document.getElementById('invite_company_id').value;
        const role = document.getElementById('invite_role').value;
        api.post('/admin/invitations', { user, username, company_id, role })
            .then(async (response) => {
                const inviteLink = response.data?.invite_link;
                toast.success(response.data?.message || 'Invitation created successfully.');
                if (inviteLink) {
                    try {
                        await navigator.clipboard.writeText(inviteLink);
                        toast.info('Invite link copied to clipboard.');
                    } catch {
                        toast.info(`Invite link: ${inviteLink}`);
                    }
                }
                clearInviteFields();
                getInvitations();
            })
            .catch(error => toast.error(error.response?.data?.message || 'Failed to create invitation.'))
            .finally(() => setInviteSubmitting(false));
    }

    // Copy Invite Link
    function copyInviteLink(link) {
        if (!link) { toast.error('Invite link is not available.'); return; }
        navigator.clipboard.writeText(link)
            .then(() => toast.success('Invite link copied.'))
            .catch(() => toast.error('Failed to copy invite link.'));
    }

    // Revoke Invitation
    function revokeInvitation(id) {
        setRevokeLoadingId(id);
        api.post(`/admin/invitations/revoke/${id}`)
            .then(response => {
                toast.success(response.data?.message || 'Invitation revoked successfully.');
                getInvitations();
            })
            .catch(error => toast.error(error.response?.data?.message || 'Failed to revoke invitation.'))
            .finally(() => setRevokeLoadingId(null));
    }

    // Read Companies
    function getCompanies() {
        api.get('/admin/all_companies')
            .then(response => setCompanies(response.data))
            .catch(() => toast.error('Failed to fetch companies.'));
    }

    // Read Users
    function getUsers(page = 1, searchValue = '') {
        let url = `/admin/users?page=${page}`;
        if (searchValue && searchValue.trim() !== '') url += `&search=${encodeURIComponent(searchValue.trim())}`;
        api.get(url)
            .then(response => { setUsers(response.data.data); setPagination(response.data); })
            .catch(() => toast.error('Failed to fetch users.'));
    }

    // Read Invitations
    function getInvitations(page = 1, searchValue = '') {
        let url = `/admin/invitations?page=${page}`;
        if (searchValue && searchValue.trim() !== '') url += `&search=${encodeURIComponent(searchValue.trim())}`;
        api.get(url)
            .then(response => { setInvitations(response.data.data || []); setInvitePagination(response.data || {}); })
            .catch(() => toast.error('Failed to fetch invitations.'));
    }

    // Search Users
    const handleSearch = (e) => {
        e.preventDefault();
        const value = e.target.search.value.trim();
        const params = new URLSearchParams(location.search);
        params.set('search', value);
        params.set('page', 1);
        window.history.pushState({}, '', `?${params.toString()}`);
        getUsers(1, value);
        setSearch(value);
    };

    // Search Invitations
    const handleInviteSearch = (e) => {
        e.preventDefault();
        const value = e.target.invite_search.value.trim();
        getInvitations(1, value);
        setInviteSearch(value);
    };

    // Edit User
    function checkEditUser(id) {
        api.get(`/admin/edit_user/${id}`)
            .then(response => setEditUser(response.data))
            .catch(error => toast.error(error.response?.data?.message || 'No information found.'));
    }

    // Update User
    function updateUser(e) {
        e.preventDefault();
        setSubmitting(true);
        const uid = document.getElementById('uid').value;
        const user = document.getElementById('user').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const company_id = document.getElementById('company_id').value;
        const role = document.getElementById('role').value;
        api.post('/admin/update_user', { uid, user, username, password, company_id, role })
            .then(response => {
                toast.success(response.data.message);
                setEditUser(null);
                getUsers();
            })
            .catch(error => toast.error(error.response?.data?.message || 'Failed to update user.'))
            .finally(() => setSubmitting(false));
    }

    // Delete User
    function handleDelete() {
        api.get(`/admin/delete_user/${deleteId}`)
            .then(response => {
                toast.success(response.data.message);
                getUsers();
                setDeleteId(null);
            })
            .catch(error => {
                toast.error(error.response?.data?.message || 'Failed to delete user.');
                setDeleteId(null);
            });
    }

    function clearFields() {
        document.getElementById('user').value = '';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('company_id').value = '';
    }

    function clearInviteFields() {
        document.getElementById('invite_user').value = '';
        document.getElementById('invite_username').value = '';
        document.getElementById('invite_company_id').value = '';
        document.getElementById('invite_role').value = 'staff';
    }

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const page = params.get('page') || 1;
        const urlSearch = params.get('search') || '';
        getUsers(page, urlSearch);
        getInvitations(1, '');
        getCompanies();
        setSearch(urlSearch);
    }, [location.search]);

    /* ── EDIT MODE ─────────────────────────────────────── */
    if (editUser) return (
        <Layout>
            <button
                onClick={() => setEditUser(null)}
                className="btn btn-transparent border-0 p-0 d-flex align-items-center fw-semibold"
            >
                <IoIosArrowBack className="me-2" />Turn back
            </button>

            <div className="card rounded-4 mt-3 border-0 shadow-sm">
                <div className="card-header rounded-top-4 border-0 py-3 px-4" style={{ background: BRAND + '10' }}>
                    <span className="fw-semibold" style={{ color: BRAND }}>
                        Update User <strong>#ID:{editUser.uid}</strong>
                    </span>
                </div>
                <div className="card-body px-4 pb-4">
                    <form method="post" onSubmit={updateUser}>
                        <input type="hidden" id="uid" name="uid" value={editUser.uid} required />
                        <div className="row g-3">
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Name & Surname</label>
                                <input type="text" defaultValue={editUser.user} className={inputCls} id="user" placeholder="Enter name and surname" />
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Username</label>
                                <input type="text" defaultValue={editUser.username} className={inputCls} id="username" placeholder="Enter username" />
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Password</label>
                                <input type="password" className={inputCls} id="password" placeholder="Leave blank to keep current" />
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Company</label>
                                <select name="company_id" defaultValue={editUser.company_id} id="company_id" className={selCls}>
                                    {companies.length === 0
                                        ? <option value="">— No companies —</option>
                                        : <><option value="">— Select Company —</option>{companies.map(c => <option key={c.cid} value={c.cid}>{c.name}</option>)}</>
                                    }
                                </select>
                            </div>
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold small">Role</label>
                                <select name="role" defaultValue={editUser.role} id="role" className={selCls}>
                                    <option value="admin">Admin</option>
                                    <option value="manager">Manager</option>
                                    <option value="staff">Staff</option>
                                </select>
                            </div>
                            <div className="col-12 col-md-4 d-flex align-items-end">
                                <button
                                    type={submitting ? 'button' : 'submit'}
                                    disabled={submitting}
                                    className="btn w-100 rounded-3 d-flex align-items-center justify-content-center gap-2 fw-semibold"
                                    style={btnBrand}
                                >
                                    <FaEdit size={13} /> {submitting ? 'Updating...' : 'Update User'}
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
                className="hero-banner d-flex justify-content-between align-items-center flex-wrap gap-3 px-4 py-4 mb-4"
            >
                <div>
                    <p className="mb-1 fw-semibold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.1em', color: BRAND }}>Administration</p>
                    <h4 className="fw-bold mb-1">Users & Invitations</h4>
                    <small className="text-muted">Manage system users, roles and pending invitations.</small>
                </div>
            </div>

            {/* Tabs */}
            <div className="d-flex gap-1 mb-4 p-1 rounded-3" style={{ background: '#f1f5f9', width: 'fit-content' }}>
                {[['users', 'Users'], ['invitations', 'Invitations']].map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className="btn btn-sm fw-semibold rounded-2 px-4"
                        style={{
                            background: activeTab === key ? 'white' : 'transparent',
                            color: activeTab === key ? BRAND : '#6b7280',
                            boxShadow: activeTab === key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                            border: 'none',
                            transition: 'all 0.15s',
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* ── USERS TAB ── */}
            {activeTab === 'users' && (
                <>
                    {/* Create User */}
                    <div className="card rounded-4 border-0 shadow-sm mb-4">
                        <div className="card-body px-4 pt-4 pb-3">
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: BRAND + '18', color: BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                                    <MdOutlineAddBox />
                                </div>
                                <div>
                                    <p className="fw-semibold mb-0">Register new User</p>
                                    <small className="text-muted">Create a user account with direct access</small>
                                </div>
                            </div>
                            <form method="post" onSubmit={createUser}>
                                <div className="row g-3 pb-2">
                                    <div className="col-12 col-md-4">
                                        <label className="form-label fw-semibold small">Name & Surname</label>
                                        <input type="text" className={inputCls} id="user" placeholder="Enter name and surname" />
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="form-label fw-semibold small">Username</label>
                                        <input type="text" className={inputCls} id="username" placeholder="Enter username" />
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="form-label fw-semibold small">Password</label>
                                        <input type="password" className={inputCls} id="password" placeholder="Enter password" />
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="form-label fw-semibold small">Company</label>
                                        <select name="company_id" id="company_id" className={selCls}>
                                            {companies.length === 0
                                                ? <option value="">— No companies —</option>
                                                : <><option value="">— Select Company —</option>{companies.map(c => <option key={c.cid} value={c.cid}>{c.name}</option>)}</>
                                            }
                                        </select>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="form-label fw-semibold small">Role</label>
                                        <select name="role" id="role" className={selCls}>
                                            <option value="admin">Admin</option>
                                            <option value="manager">Manager</option>
                                            <option value="staff">Staff</option>
                                        </select>
                                    </div>
                                    <div className="col-12 col-md-4 d-flex align-items-end">
                                        <button
                                            type={submitting ? 'button' : 'submit'}
                                            disabled={submitting}
                                            className="btn w-100 rounded-3 d-flex align-items-center justify-content-center gap-2 fw-semibold"
                                            style={btnBrand}
                                        >
                                            <MdOutlineAddBox size={18} />
                                            {submitting ? 'Creating...' : 'Create User'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Users List */}
                    <div className="card rounded-4 border-0 shadow-sm mb-4">
                        <div className="card-body px-4 pt-4">
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                                <div>
                                    <p className="fw-semibold mb-0">Users List</p>
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
                                            placeholder="Search users..."
                                            style={{ fontSize: '0.875rem' }}
                                        />
                                    </div>
                                </form>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead>
                                        <tr className="text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.06em', color: '#6b7280' }}>
                                            <th className="fw-semibold">#</th>
                                            <th className="fw-semibold">User</th>
                                            <th className="fw-semibold">Username</th>
                                            <th className="fw-semibold">Company</th>
                                            <th className="fw-semibold">Role</th>
                                            <th className="fw-semibold text-end">Operations</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.length === 0 ? (
                                            <tr><td colSpan="6" className="text-center text-muted py-4">No data to show...</td></tr>
                                        ) : (
                                            users.map((user) => (
                                                <tr key={user.uid}>
                                                    <td className="text-muted small">#{user.uid}</td>
                                                    <td className="fw-semibold">{user.user}</td>
                                                    <td className="text-muted">{user.username}</td>
                                                    <td className="text-muted">{user.company}</td>
                                                    <td>
                                                        <span className="badge rounded-pill px-3 py-1 text-capitalize" style={{ fontSize: '0.72rem', ...roleCfg(user.role) }}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="text-end text-nowrap">
                                                        <button onClick={() => checkEditUser(user.uid)} className="btn btn-sm me-1" style={{ color: BRAND, background: BRAND + '12' }}>
                                                            <FaEdit size={14} />
                                                        </button>
                                                        <button onClick={() => setDeleteId(user.uid)} className="btn btn-sm" style={{ color: '#ef4444', background: '#ef444412' }}>
                                                            <MdDeleteOutline size={17} />
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
                </>
            )}

            {/* ── INVITATIONS TAB ── */}
            {activeTab === 'invitations' && (
                <>
                    {/* Create Invitation */}
                    <div className="card rounded-4 border-0 shadow-sm mb-4">
                        <div className="card-body px-4 pt-4 pb-3">
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: BRAND + '18', color: BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                                    <MdOutlineAddBox />
                                </div>
                                <div>
                                    <p className="fw-semibold mb-0">Create Invitation</p>
                                    <small className="text-muted">Send a one-time invite link for the user to set their password</small>
                                </div>
                            </div>
                            <form onSubmit={createInvitation}>
                                <div className="row g-3 pb-2">
                                    <div className="col-12 col-md-4">
                                        <label className="form-label fw-semibold small">Name & Surname</label>
                                        <input type="text" className={inputCls} id="invite_user" placeholder="Enter name and surname" required />
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="form-label fw-semibold small">Username</label>
                                        <input type="text" className={inputCls} id="invite_username" placeholder="Enter username" required />
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="form-label fw-semibold small">Company</label>
                                        <select id="invite_company_id" className={selCls} required>
                                            <option value="">— Select Company —</option>
                                            {companies.map(c => <option key={c.cid} value={c.cid}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="form-label fw-semibold small">Role</label>
                                        <select id="invite_role" defaultValue="staff" className={selCls}>
                                            <option value="staff">Staff</option>
                                            <option value="manager">Manager</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="col-12 col-md-4 d-flex align-items-end">
                                        <button
                                            type={inviteSubmitting ? 'button' : 'submit'}
                                            disabled={inviteSubmitting}
                                            className="btn w-100 rounded-3 d-flex align-items-center justify-content-center gap-2 fw-semibold"
                                            style={btnBrand}
                                        >
                                            <MdOutlineAddBox size={18} />
                                            {inviteSubmitting ? 'Creating...' : 'Create Invitation'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Invitations List */}
                    <div className="card rounded-4 border-0 shadow-sm mb-4">
                        <div className="card-body px-4 pt-4">
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                                <div>
                                    <p className="fw-semibold mb-0">Invitations List</p>
                                    <small className="text-muted">{invitePagination.total || 0} entries</small>
                                </div>
                                <form onSubmit={handleInviteSearch} style={{ minWidth: 220 }}>
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-end-0 rounded-start-3">
                                            <FaSearch className="text-muted" size={13} />
                                        </span>
                                        <input
                                            type="search" name="invite_search" defaultValue={inviteSearch}
                                            className="form-control border-start-0 shadow-none rounded-end-3"
                                            placeholder="Search invitations..."
                                            style={{ fontSize: '0.875rem' }}
                                        />
                                    </div>
                                </form>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead>
                                        <tr className="text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.06em', color: '#6b7280' }}>
                                            <th className="fw-semibold">#</th>
                                            <th className="fw-semibold">User</th>
                                            <th className="fw-semibold">Username</th>
                                            <th className="fw-semibold">Company</th>
                                            <th className="fw-semibold">Role</th>
                                            <th className="fw-semibold">Status</th>
                                            <th className="fw-semibold">Expires</th>
                                            <th className="fw-semibold text-end">Operations</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invitations.length === 0 ? (
                                            <tr><td colSpan="8" className="text-center text-muted py-4">No invitations to show...</td></tr>
                                        ) : (
                                            invitations.map((inv) => (
                                                <tr key={inv.iid}>
                                                    <td className="text-muted small">#{inv.iid}</td>
                                                    <td className="fw-semibold">{inv.user}</td>
                                                    <td className="text-muted">{inv.username}</td>
                                                    <td className="text-muted">{inv.company || '—'}</td>
                                                    <td>
                                                        <span className="badge rounded-pill px-3 py-1 text-capitalize" style={{ fontSize: '0.72rem', ...roleCfg(inv.role) }}>
                                                            {inv.role}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="badge rounded-pill px-3 py-1 text-capitalize" style={{ fontSize: '0.72rem', ...inviteStatusCfg(inv.status) }}>
                                                            {inv.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                        {new Date(inv.expires_at).toLocaleString()}
                                                    </td>
                                                    <td className="text-end text-nowrap">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm me-1"
                                                            style={{ color: BRAND, background: BRAND + '12' }}
                                                            onClick={() => copyInviteLink(inv.invite_link)}
                                                            title="Copy invite link"
                                                        >
                                                            <FaCopy size={13} />
                                                        </button>
                                                        {inv.status === 'pending' ? (
                                                            <button
                                                                className="btn btn-sm"
                                                                style={{ color: '#ef4444', background: '#ef444412' }}
                                                                onClick={() => revokeInvitation(inv.iid)}
                                                                disabled={revokeLoadingId === inv.iid}
                                                            >
                                                                {revokeLoadingId === inv.iid ? '...' : 'Revoke'}
                                                            </button>
                                                        ) : (
                                                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <Paginate data={invitePagination} />
                        </div>
                    </div>
                </>
            )}

            {/* Delete confirmation */}
            {deleteId && (
                <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4 px-3" style={{ zIndex: 1050, width: '100%', maxWidth: '500px' }}>
                    <div className="bg-white shadow-lg rounded-4 p-3 border">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>Confirm deletion</strong>
                                <p className="mb-0 small text-muted">Are you sure you want to delete user <strong>#ID: {deleteId}</strong>?</p>
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

export default Users
