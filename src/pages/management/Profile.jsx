import { useEffect, useState } from 'react'
import Layout from '../../layouts/Layout'
import api from '../../api/axios'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaEdit } from 'react-icons/fa';
import { MdLockOutline, MdOutlinePerson } from 'react-icons/md';

const BRAND    = '#035dad'
const inputCls = 'form-control shadow-none rounded-3'
const btnBrand = { backgroundColor: BRAND, color: '#fff', border: 'none' }

const Profile = () => {
    const [user, setUser] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const storedUser = JSON.parse(localStorage.getItem('user'));

    // Read User
    function getUser() {
        api.get('/me')
            .then(response => {
                setUser(response.data);
            })
            .catch(() => {
                toast.error('Failed to fetch user.');
                navigate('/dashboard');
            });
    }

    // Update User
    function updateProfile(e) {
        e.preventDefault();
        setSubmitting(true);
        const user = document.getElementById('user').value;
        const password = document.getElementById('password').value;
        const new_password = document.getElementById('new_password').value;
        api.post('/admin/update_account', { user, password, new_password })
            .then(response => {
                toast.success(response.data.message);
                const updatedUser = {
                    ...storedUser,
                    user: user
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setSubmitting(false);
                clearFields();
                getUser();
            })
            .catch(error => {
                toast.error(error.response.data.message || 'Failed to update account.');
                setSubmitting(false);
            });
    }

    // Clear Fields
    function clearFields() {
        document.getElementById('password').value = '';
        document.getElementById('new_password').value = '';
    }

    useEffect(() => {
        getUser();
    }, []);

    const initials = (user?.user || user?.username || '')
        .trim()
        .split(/\s+/)
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <Layout>
            {user && (
                <>
                    {/* Header */}
                    <div className="hero-banner d-flex justify-content-between align-items-center flex-wrap gap-3 px-4 py-4 mb-4">
                        <div>
                            <p className="mb-1 fw-semibold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.1em' }}>Account</p>
                            <h4 className="fw-bold mb-1">My Profile</h4>
                            <small>Manage your account details and password.</small>
                        </div>
                    </div>

                    {/* Account Details */}
                    <div className="card rounded-4 border-0 shadow-sm mb-4">
                        <div className="card-body px-4 pt-4 pb-4">
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    background: BRAND + '18', color: BRAND,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                                }}>
                                    <MdOutlinePerson />
                                </div>
                                <div>
                                    <p className="fw-semibold mb-0">Update Account Details</p>
                                    <small className="text-muted">Edit your display name or change your password</small>
                                </div>
                            </div>

                            <div className="row g-4 align-items-start">
                                {/* Avatar */}
                                <div className="col-12 col-lg-3 text-center">
                                    <div
                                        className="mx-auto d-flex align-items-center justify-content-center"
                                        style={{
                                            width: 120, height: 120, borderRadius: '50%',
                                            background: `linear-gradient(135deg, ${BRAND} 0%, #1d4ed8 100%)`,
                                            color: '#fff', fontSize: '2.6rem', fontWeight: 800, letterSpacing: '-0.02em',
                                            boxShadow: '0 12px 28px -10px rgba(3,93,173,0.55)',
                                        }}
                                    >
                                        {initials || <MdOutlinePerson size={56} />}
                                    </div>
                                    <p className="fw-bold mb-0 mt-3" style={{ color: '#0f172a' }}>{user.user}</p>
                                    <small className="text-muted">@{user.username}</small>
                                </div>

                                {/* Form */}
                                <div className="col-12 col-lg-9">
                                    <form method="post" onSubmit={updateProfile}>
                                        <div className="row g-3">
                                            <div className="col-12 col-lg-6">
                                                <label className="form-label fw-semibold small">Username</label>
                                                <input type="text" defaultValue={user.username} className={inputCls} id="username" placeholder="Enter username" disabled style={{ background: '#f8fafc' }} />
                                            </div>
                                            <div className="col-12 col-lg-6">
                                                <label className="form-label fw-semibold small">Name &amp; Surname</label>
                                                <input type="text" defaultValue={user.user} className={inputCls} id="user" placeholder="Enter name & surname" />
                                            </div>

                                            <div className="col-12">
                                                <div className="d-flex align-items-center gap-2 mt-2 mb-1">
                                                    <MdLockOutline style={{ color: BRAND }} size={16} />
                                                    <span className="fw-semibold small" style={{ color: '#374151' }}>Change Password</span>
                                                </div>
                                                <hr className="mt-1 mb-2" style={{ opacity: 0.08 }} />
                                            </div>

                                            <div className="col-12 col-lg-6">
                                                <label className="form-label fw-semibold small">Actual Password</label>
                                                <input type="password" className={inputCls} id="password" placeholder="Enter actual password" />
                                            </div>
                                            <div className="col-12 col-lg-6">
                                                <label className="form-label fw-semibold small">New Password</label>
                                                <input type="password" className={inputCls} id="new_password" placeholder="Enter new password" />
                                            </div>

                                            <div className="col-12 mt-2">
                                                <button
                                                    type={submitting ? 'button' : 'submit'}
                                                    disabled={submitting}
                                                    className="btn rounded-3 d-flex align-items-center gap-2 fw-semibold px-4"
                                                    style={btnBrand}
                                                >
                                                    <FaEdit size={14} /> {submitting ? 'Updating...' : 'Update Account'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </Layout>
    )
}

export default Profile
