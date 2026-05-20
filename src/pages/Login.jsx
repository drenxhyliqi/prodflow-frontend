import { useState } from 'react'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaRegUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdOutlineBarChart } from 'react-icons/md';
import { FiUsers } from 'react-icons/fi';
import { TbSparkles, TbShieldCheck } from 'react-icons/tb';

const BRAND = '#2662D9';

const Login = () => {
    const navigate = useNavigate();
    const [loading,      setLoading]      = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [keepSigned,   setKeepSigned]   = useState(false);

    const checkLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const username = e.target.username.value;
        const password = e.target.password.value;
        await api.post('/login', { username, password })
            .then(response => {
                toast.success('Login successful');
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                navigate('/dashboard');
            })
            .catch(error => {
                toast.error(error.response?.data?.message || 'Login failed');
            })
            .finally(() => setLoading(false));
    };

    const features = [
        { icon: <MdOutlineBarChart size={18} />, title: 'Real-time analytics',  sub: 'Track KPIs across your business'      },
        { icon: <FiUsers           size={18} />, title: 'Team management',       sub: 'Vacations, contracts and payroll'      },
        { icon: <TbShieldCheck     size={18} />, title: 'Secure by design',      sub: 'Enterprise-grade authentication'       },
    ];

    return (
        <>
            <style>{`
                .login-input {
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
                .login-input:focus { border-color: ${BRAND}; }
                .login-input::placeholder { color: #9ca3af; }
                .login-btn {
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
                .login-btn:hover:not(:disabled) { background: #0b3f84; }
                .login-btn:disabled { opacity: .7; cursor: not-allowed; }
                .login-checkbox {
                    width: 16px; height: 16px;
                    accent-color: ${BRAND};
                    cursor: pointer;
                    flex-shrink: 0;
                }
                @media (max-width: 767px) {
                    .login-left  { display: none !important; }
                    .login-right { width: 100% !important; }
                }
            `}</style>

            <div style={{ display: 'flex', minHeight: '100vh' }}>

                {/* ── LEFT PANEL ──────────────────────────────────── */}
                <div
                    className="login-left"
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
                    {/* dot grid */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'radial-gradient(rgba(255,255,255,0.13) 1px, transparent 1px)',
                        backgroundSize: '26px 26px',
                        pointerEvents: 'none',
                    }} />
                    {/* top-right glow accent */}
                    <div style={{
                        position: 'absolute', width: 320, height: 320,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(100,160,255,0.18) 0%, transparent 70%)',
                        top: -80, right: -60, pointerEvents: 'none',
                    }} />

                    {/* Logo */}
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

                    {/* Main copy */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: '3rem', position: 'relative' }}>
                        <h2 style={{ fontWeight: 800, fontSize: '2.15rem', lineHeight: 1.18, marginBottom: '1rem', letterSpacing: '-0.01em' }}>
                            Welcome back to<br />your workspace
                        </h2>
                        <p style={{ opacity: 0.75, fontSize: '0.93rem', marginBottom: '2.5rem', lineHeight: 1.65, maxWidth: 360 }}>
                            Manage your team, track production, and gain insights — all from one elegant dashboard.
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

                    {/* Footer */}
                    <div style={{ fontSize: '0.74rem', opacity: 0.45, position: 'relative' }}>
                        © 2026 Prodflow. All rights reserved.
                    </div>
                </div>

                {/* ── RIGHT PANEL ─────────────────────────────────── */}
                <div
                    className="login-right"
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
                        <h2 style={{ fontWeight: 800, fontSize: '2rem', color: '#0f172a', marginBottom: 6 }}>Sign in</h2>
                        <p style={{ color: '#6b7280', fontSize: '0.88rem', marginBottom: '2rem', lineHeight: 1.5 }}>
                            Enter your credentials to access your dashboard.
                        </p>

                        <form onSubmit={checkLogin}>
                            {/* Username */}
                            <div style={{ marginBottom: '1.2rem' }}>
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
                                        className="login-input"
                                        type="text"
                                        name="username"
                                        placeholder="Enter your username"
                                        autoComplete="username"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Password</label>
                                    <a href="#" style={{ fontSize: '0.8rem', color: BRAND, textDecoration: 'none', fontWeight: 500 }}>
                                        Forgot password?
                                    </a>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <span style={{
                                        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                        color: '#9ca3af', display: 'flex', alignItems: 'center', pointerEvents: 'none',
                                    }}>
                                        <FaLock size={13} />
                                    </span>
                                    <input
                                        className="login-input"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        style={{ paddingRight: 42 }}
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

                            {/* Keep signed in */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: '1.6rem' }}>
                                <input
                                    className="login-checkbox"
                                    type="checkbox"
                                    id="keepSigned"
                                    checked={keepSigned}
                                    onChange={e => setKeepSigned(e.target.checked)}
                                />
                                <label htmlFor="keepSigned" style={{ fontSize: '0.875rem', color: '#374151', cursor: 'pointer', userSelect: 'none' }}>
                                    Keep me signed in for 30 days
                                </label>
                            </div>

                            {/* Submit */}
                            <button className="login-btn" type="submit" disabled={loading}>
                                {loading ? 'Signing in...' : 'Sign in to Prodflow'}
                            </button>
                        </form>

                        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.78rem', color: '#9ca3af' }}>
                            Protected by enterprise-grade security.{' '}
                            <a href="#" style={{ color: BRAND, fontWeight: 600, textDecoration: 'none' }}>Need help?</a>
                        </p>
                    </div>
                </div>

            </div>
        </>
    );
};

export default Login;
