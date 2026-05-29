import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaRegUser, FaLock, FaEye, FaEyeSlash, FaBuilding, FaMapMarkerAlt, FaIndustry } from 'react-icons/fa';
import { MdOutlineBarChart } from 'react-icons/md';
import { FiUsers } from 'react-icons/fi';
import { TbSparkles, TbShieldCheck } from 'react-icons/tb';

const BRAND = '#2662D9';

const Signup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const checkAvailability = async () => {
            try {
                const response = await api.get('/signup-available');
                if (!response.data.available) {
                    toast.info('Signup is not available. Please sign in.');
                    navigate('/login', { replace: true });
                }
            } catch {
                toast.error('Could not verify signup availability.');
                navigate('/login', { replace: true });
            } finally {
                setChecking(false);
            }
        };

        checkAvailability();
    }, [navigate]);

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);

        const form = e.target;
        const user = form.user.value.trim();
        const username = form.username.value.trim();
        const password = form.password.value;
        const confirmPassword = form.confirmPassword.value;
        const name = form.name.value.trim();
        const sector = form.sector.value.trim();
        const location = form.location.value.trim();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/signup', {
                user,
                username,
                password,
                name,
                sector,
                location,
            });

            toast.success('Account created successfully');
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: <MdOutlineBarChart size={18} />, title: 'Real-time analytics', sub: 'Track KPIs across your business' },
        { icon: <FiUsers size={18} />, title: 'Team management', sub: 'Vacations, contracts and payroll' },
        { icon: <TbShieldCheck size={18} />, title: 'Secure by design', sub: 'Enterprise-grade authentication' },
    ];

    if (checking) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f3f5fb',
                color: '#6b7280',
                fontSize: '0.95rem',
            }}>
                Checking signup availability...
            </div>
        );
    }

    return (
        <>
            <style>{`
                .signup-input {
                    width: 100%;
                    padding: 11px 14px 11px 42px;
                    border: 1.5px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    background: #fff;
                    outline: none;
                    transition: border-color .18s;
                    color: #111827;
                }
                .signup-input:focus { border-color: ${BRAND}; }
                .signup-input::placeholder { color: #9ca3af; }
                .signup-btn {
                    width: 100%;
                    padding: 13px;
                    background: #1055aa;
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background .18s;
                }
                .signup-btn:hover:not(:disabled) { background: #0b3f84; }
                .signup-btn:disabled { opacity: .7; cursor: not-allowed; }
                @media (max-width: 767px) {
                    .signup-left  { display: none !important; }
                    .signup-right { width: 100% !important; }
                }
            `}</style>

            <div style={{ display: 'flex', minHeight: '100vh' }}>
                {/* LEFT PANEL */}
                <div
                    className="signup-left"
                    style={{
                        width: '50%',
                        background: 'linear-gradient(155deg, #0c1e5c 0%, #1055aa 55%, #1868cc 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '2rem 2.5rem',
                        color: '#fff',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'radial-gradient(rgba(255,255,255,0.13) 1px, transparent 1px)',
                        backgroundSize: '26px 26px',
                        pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', width: 320, height: 320,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(100,160,255,0.18) 0%, transparent 70%)',
                        top: -80, right: -60, pointerEvents: 'none',
                    }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 11, position: 'relative' }}>
                        <div style={{
                            width: 42, height: 42, borderRadius: 11,
                            background: 'rgba(255,255,255,0.14)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <TbSparkles size={22} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.1 }}>Prodflow</div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.65, letterSpacing: '0.03em' }}>Management System</div>
                        </div>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: '3rem', position: 'relative' }}>
                        <h2 style={{ fontWeight: 800, fontSize: '2.15rem', lineHeight: 1.18, marginBottom: '1rem', letterSpacing: '-0.01em' }}>
                            Set up your<br />workspace
                        </h2>
                        <p style={{ opacity: 0.75, fontSize: '0.93rem', marginBottom: '2.5rem', lineHeight: 1.65, maxWidth: 360 }}>
                            Create the first admin account and company to start using Prodflow.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {features.map((f, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: 38, height: 38, borderRadius: 10,
                                        background: 'rgba(255,255,255,0.12)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        {f.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.88rem', lineHeight: 1.25 }}>{f.title}</div>
                                        <div style={{ fontSize: '0.76rem', opacity: 0.6, marginTop: 2 }}>{f.sub}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ fontSize: '0.74rem', opacity: 0.45, position: 'relative' }}>
                        © 2026 Prodflow. All rights reserved.
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div
                    className="signup-right"
                    style={{
                        width: '50%',
                        background: '#f3f5fb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem',
                    }}
                >
                    <div style={{ width: '100%', maxWidth: 420 }}>
                        <h2 style={{ fontWeight: 800, fontSize: '2rem', color: '#0f172a', marginBottom: 6 }}>Create account</h2>
                        <p style={{ color: '#6b7280', fontSize: '0.88rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
                            Register the first admin user and company.
                        </p>

                        <form onSubmit={handleSignup}>
                            {/* Full name */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                                    Full name
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{
                                        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                        color: '#9ca3af', display: 'flex', alignItems: 'center', pointerEvents: 'none',
                                    }}>
                                        <FaRegUser size={14} />
                                    </span>
                                    <input
                                        className="signup-input"
                                        type="text"
                                        name="user"
                                        placeholder="Enter your full name"
                                        autoComplete="name"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Username */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                                    Username
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{
                                        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                        color: '#9ca3af', display: 'flex', alignItems: 'center', pointerEvents: 'none',
                                    }}>
                                        <FaRegUser size={14} />
                                    </span>
                                    <input
                                        className="signup-input"
                                        type="text"
                                        name="username"
                                        placeholder="Choose a username"
                                        autoComplete="username"
                                        minLength={3}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                                    Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{
                                        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                        color: '#9ca3af', display: 'flex', alignItems: 'center', pointerEvents: 'none',
                                    }}>
                                        <FaLock size={13} />
                                    </span>
                                    <input
                                        className="signup-input"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="Create a password"
                                        autoComplete="new-password"
                                        minLength={8}
                                        style={{ paddingRight: 42 }}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(s => !s)}
                                        style={{
                                            position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: '#9ca3af', display: 'flex', alignItems: 'center', padding: 0,
                                        }}
                                    >
                                        {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm password */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                                    Confirm password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{
                                        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                        color: '#9ca3af', display: 'flex', alignItems: 'center', pointerEvents: 'none',
                                    }}>
                                        <FaLock size={13} />
                                    </span>
                                    <input
                                        className="signup-input"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        placeholder="Confirm your password"
                                        autoComplete="new-password"
                                        minLength={8}
                                        style={{ paddingRight: 42 }}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(s => !s)}
                                        style={{
                                            position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: '#9ca3af', display: 'flex', alignItems: 'center', padding: 0,
                                        }}
                                    >
                                        {showConfirmPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                                    </button>
                                </div>
                            </div>

                            <button className="signup-btn" type="submit" disabled={loading}>
                                {loading ? 'Creating account...' : 'Create account'}
                            </button>
                            
                        </form>

                        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: '#6b7280' }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ color: BRAND, fontWeight: 600, textDecoration: 'none' }}>
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Signup;