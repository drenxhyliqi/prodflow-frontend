import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import Layout from '../../layouts/Layout'
import api from '../../api/axios'
import { toast } from 'react-toastify';
import { MdOutlineAddBox } from 'react-icons/md';
import Paginate from '../../components/Paginate';
import { FaSearch, FaEdit } from 'react-icons/fa';
import { IoIosArrowBack } from "react-icons/io";
import { MdDeleteOutline } from "react-icons/md";

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
            .catch(error => {
                toast.error(error.response?.data?.message || 'Failed to create user.');
            })
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
            .catch(error => {
                toast.error(error.response?.data?.message || 'Failed to create invitation.');
            })
            .finally(() => setInviteSubmitting(false));
    }

    // Copy Invite Link
    function copyInviteLink(link) {
        if (!link) {
            toast.error('Invite link is not available.');
            return;
        }
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
            .catch(error => {
                toast.error(error.response?.data?.message || 'Failed to revoke invitation.');
            })
            .finally(() => setRevokeLoadingId(null));
    }

    // Read Companies
    function getCompanies() {
        api.get('/admin/all_companies')
            .then(response => {
                setCompanies(response.data);
            })
            .catch(() => {
                toast.error('Failed to fetch companies.');
            });
    }

    // Read Users
    function getUsers(page = 1, searchValue = '') {
        let url = `/admin/users?page=${page}`;
        if (searchValue && searchValue.trim() !== '') {
            url += `&search=${encodeURIComponent(searchValue.trim())}`;
        }
        api.get(url)
            .then(response => {
                setUsers(response.data.data);
                setPagination(response.data);
            })
            .catch(() => {
                toast.error('Failed to fetch users.');
            });
    }

    // Read Invitations
    function getInvitations(page = 1, searchValue = '') {
        let url = `/admin/invitations?page=${page}`;
        if (searchValue && searchValue.trim() !== '') {
            url += `&search=${encodeURIComponent(searchValue.trim())}`;
        }
        api.get(url)
            .then(response => {
                setInvitations(response.data.data || []);
                setInvitePagination(response.data || {});
            })
            .catch(() => {
                toast.error('Failed to fetch invitations.');
            });
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
            .then(response => {
                setEditUser(response.data);
            })
            .catch(error => {
                toast.error(error.response?.data?.message || 'No information found.');
                setSubmitting(false);
            });
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
                setEditUser(null)
                getUsers();
            })
            .catch(error => {
                toast.error(error.response?.data?.message || 'Failed to update user.');
            })
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

    // Clear Fields
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

    return (
        <Layout>
            {!editUser && (
                <>
                    <h4 className='fw-bold'>Users</h4>
                    <small className='d-inline-block opacity-75'>Manage registered users and invitations</small>

                    <div className="mt-3 d-flex gap-2">
                        <button
                            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline-primary'} rounded-4`}
                            onClick={() => setActiveTab('users')}
                        >
                            Users
                        </button>
                        <button
                            className={`btn ${activeTab === 'invitations' ? 'btn-primary' : 'btn-outline-primary'} rounded-4`}
                            onClick={() => setActiveTab('invitations')}
                        >
                            Invitations
                        </button>
                    </div>
                </>
            )}

            {editUser && (
                <button onClick={() => setEditUser(null)} className='btn btn-transparent border-0 p-0 d-flex align-items-center fw-semibold'>
                    <IoIosArrowBack className='me-2' />Turn back
                </button>
            )}

            {/* Edit User */}
            {editUser && (
                <div className="card rounded-4 mt-3">
                    <div className="card-header rounded-4">
                        <span className='fw-semibold'>Update User <strong>#ID:{editUser.uid}</strong></span>
                    </div>
                    <div className="card-body">
                        <form method='post' onSubmit={updateUser}>
                            <input type="hidden" id='uid' name='uid' value={editUser.uid} required />
                            <div className="row g-3">
                                <div className="col-12 col-md-6 col-lg-4">
                                    <label htmlFor="user" className="form-label">Name & Surname</label>
                                    <input type="text" defaultValue={editUser.user} className="form-control rounded-4 shadow-none" id="user" />
                                </div>
                                <div className="col-12 col-md-6 col-lg-4">
                                    <label htmlFor="username" className="form-label">Username</label>
                                    <input type="text" defaultValue={editUser.username} className="form-control rounded-4 shadow-none" id="username" />
                                </div>
                                <div className="col-12 col-md-6 col-lg-4">
                                    <label htmlFor="password" className="form-label">Password</label>
                                    <input type="password" className="form-control rounded-4 shadow-none" id="password" placeholder="Enter password" />
                                </div>
                                <div className="col-12 col-md-6 col-lg-4">
                                    <label htmlFor="company_id" className="form-label">Company</label>
                                    <select name="company_id" defaultValue={editUser.company_id} id="company_id" className="form-control rounded-4 shadow-none">
                                        {companies.length === 0 ? (
                                            <option value="">-- 0 Companies --</option>
                                        ) : (
                                            <>
                                                <option value="">-- Select Company --</option>
                                                {companies.map((c) => (
                                                    <option key={c.cid} value={c.cid}>{c.name}</option>
                                                ))}
                                            </>
                                        )}
                                    </select>
                                </div>
                                <div className="col-12 col-md-6 col-lg-4">
                                    <label htmlFor="role" className="form-label">Role</label>
                                    <select name="role" defaultValue={editUser.role} id="role" className="form-control rounded-4 shadow-none">
                                        <option value="admin">Admin</option>
                                        <option value="manager">Manager</option>
                                        <option value="staff">Staff</option>
                                    </select>
                                </div>
                                <div className="col-12">
                                    <button type='submit' className="btn btn-success rounded-4 d-flex align-items-center gap-1" disabled={submitting}>
                                        <FaEdit /> {submitting ? 'Updating...' : 'Update User'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {!editUser && activeTab === 'users' && (
                <>
                    {/* Create User */}
                    <div className="card rounded-4 mt-3">
                        <div className="card-header rounded-4">
                            <span className='fw-semibold'>Register new User</span>
                        </div>
                        <div className="card-body">
                            <form method='post' onSubmit={createUser}>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="user" className="form-label">Name & Surname</label>
                                        <input type="text" className="form-control rounded-4 shadow-none" id="user" placeholder="Enter name and surname" />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="username" className="form-label">Username</label>
                                        <input type="text" className="form-control rounded-4 shadow-none" id="username" placeholder="Enter username" />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="password" className="form-label">Password</label>
                                        <input type="password" className="form-control rounded-4 shadow-none" id="password" placeholder="Enter password" />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="company_id" className="form-label">Company</label>
                                        <select name="company_id" id="company_id" className="form-control rounded-4 shadow-none">
                                            {companies.length === 0 ? (
                                                <option value="">-- 0 Companies --</option>
                                            ) : (
                                                <>
                                                    <option value="">-- Select Company --</option>
                                                    {companies.map((c) => (
                                                        <option key={c.cid} value={c.cid}>{c.name}</option>
                                                    ))}
                                                </>
                                            )}
                                        </select>
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="role" className="form-label">Role</label>
                                        <select name="role" id="role" className="form-control rounded-4 shadow-none">
                                            <option value="admin">Admin</option>
                                            <option value="manager">Manager</option>
                                            <option value="staff">Staff</option>
                                        </select>
                                    </div>
                                    <div className="col-12">
                                        <button type='submit' className="btn btn-success rounded-4 d-flex align-items-center gap-1" disabled={submitting}>
                                            <MdOutlineAddBox /> {submitting ? 'Creating...' : 'Create User'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Users List */}
                    <div className="card rounded-4 my-4">
                        <div className="card-header rounded-4">
                            <span className='fw-semibold'>Users List</span>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <form onSubmit={handleSearch}>
                                    <div className="input-group mb-3">
                                        <input type="search" name='search' defaultValue={search} className="form-control rounded-start-4 shadow-none" placeholder="Search..." />
                                        <button className="btn btn-primary rounded-end-4" type="submit"><FaSearch /></button>
                                    </div>
                                </form>
                            </div>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>User</th>
                                            <th>Username</th>
                                            <th>Company</th>
                                            <th>Role</th>
                                            <th className='text-end'>Operations</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center">No data to show...</td>
                                            </tr>
                                        ) : (
                                            users.map((user) => (
                                                <tr key={user.uid}>
                                                    <td>{user.uid}</td>
                                                    <td>{user.user}</td>
                                                    <td>{user.username}</td>
                                                    <td>{user.company}</td>
                                                    <td className='text-capitalize'>{user.role}</td>
                                                    <td className='text-end'>
                                                        <button onClick={() => checkEditUser(user.uid)} className="btn btn-success btn-sm shadow-sm me-2"><FaEdit size={20} /></button>
                                                        <button onClick={() => setDeleteId(user.uid)} className="btn btn-danger btn-sm shadow-sm"><MdDeleteOutline size={20} /></button>
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

            {!editUser && activeTab === 'invitations' && (
                <>
                    {/* Create Invitation */}
                    <div className="card rounded-4 mt-3">
                        <div className="card-header rounded-4">
                            <span className='fw-semibold'>Create Invitation</span>
                        </div>
                        <div className="card-body">
                            <form onSubmit={createInvitation}>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="invite_user" className="form-label">Name & Surname</label>
                                        <input type="text" className="form-control rounded-4 shadow-none" id="invite_user" placeholder="Enter name and surname" required />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="invite_username" className="form-label">Username</label>
                                        <input type="text" className="form-control rounded-4 shadow-none" id="invite_username" placeholder="Enter username" required />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="invite_company_id" className="form-label">Company</label>
                                        <select id="invite_company_id" className="form-control rounded-4 shadow-none" required>
                                            <option value="">-- Select Company --</option>
                                            {companies.map((c) => (
                                                <option key={c.cid} value={c.cid}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="invite_role" className="form-label">Role</label>
                                        <select id="invite_role" defaultValue="staff" className="form-control rounded-4 shadow-none">
                                            <option value="staff">Staff</option>
                                            <option value="manager">Manager</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="col-12">
                                        <button type='submit' className="btn btn-success rounded-4 d-flex align-items-center gap-1" disabled={inviteSubmitting}>
                                            <MdOutlineAddBox /> {inviteSubmitting ? 'Creating...' : 'Create Invitation'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Invitations List */}
                    <div className="card rounded-4 my-4">
                        <div className="card-header rounded-4">
                            <span className='fw-semibold'>Invitations List</span>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <form onSubmit={handleInviteSearch}>
                                    <div className="input-group mb-3">
                                        <input type="search" name='invite_search' defaultValue={inviteSearch} className="form-control rounded-start-4 shadow-none" placeholder="Search invitations..." />
                                        <button className="btn btn-primary rounded-end-4" type="submit"><FaSearch /></button>
                                    </div>
                                </form>
                            </div>

                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>User</th>
                                            <th>Username</th>
                                            <th>Company</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Expires</th>
                                            <th className='text-end'>Operations</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invitations.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="text-center">No invitations to show...</td>
                                            </tr>
                                        ) : (
                                            invitations.map((inv) => (
                                                <tr key={inv.iid}>
                                                    <td>{inv.iid}</td>
                                                    <td>{inv.user}</td>
                                                    <td>{inv.username}</td>
                                                    <td>{inv.company || '-'}</td>
                                                    <td className='text-capitalize'>{inv.role}</td>
                                                    <td className='text-capitalize'>{inv.status}</td>
                                                    <td>{new Date(inv.expires_at).toLocaleString()}</td>
                                                    <td className='text-end'>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-primary btn-sm me-2"
                                                            onClick={() => copyInviteLink(inv.invite_link)}
                                                        >
                                                            Copy link
                                                        </button>

                                                        {inv.status === 'pending' ? (
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => revokeInvitation(inv.iid)}
                                                                disabled={revokeLoadingId === inv.iid}
                                                            >
                                                                {revokeLoadingId === inv.iid ? 'Revoking...' : 'Revoke'}
                                                            </button>
                                                        ) : (
                                                            <span className="text-muted small">No actions</span>
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

            {/* Delete User */}
            {!editUser && deleteId && (
                <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4 px-3" style={{ zIndex: 1050, width: '100%', maxWidth: '500px' }}>
                    <div className="bg-white shadow-lg rounded-4 p-3 border">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>Confirm deletion</strong>
                                <p className="mb-0 small text-muted">
                                    Are you sure you want to delete this user with <strong>#ID: {deleteId}</strong>?
                                </p>
                            </div>
                            <button className="btn-close ms-2 shadow-none" onClick={() => setDeleteId(null)}></button>
                        </div>
                        <div className="d-flex justify-content-end mt-3">
                            <button className="btn btn-light me-2" onClick={() => setDeleteId(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={handleDelete}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    )
}

export default Users