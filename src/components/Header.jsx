import React, { useEffect, useState, useRef } from 'react'
import { LuMenu, LuBell } from 'react-icons/lu'
import { PiSignOut, PiUserFocusBold } from 'react-icons/pi'
import { HiBuildingOffice2 } from 'react-icons/hi2'
import { FaAngleDown } from 'react-icons/fa6'
import { AiOutlineClose } from 'react-icons/ai'
import api from '../api/axios'
import axios from 'axios'
import '../Global.css'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'

const BLUE = '#2563EB'

const ALERT_STYLE = {
    danger:  { background: '#fef2f2', borderLeft: '3px solid #ef4444', color: '#991b1b' },
    warning: { background: '#fffbeb', borderLeft: '3px solid #f59e0b', color: '#92400e' },
    info:    { background: '#eff6ff', borderLeft: '3px solid #3b82f6', color: '#1e40af' },
}

function getInitials(name) {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
}

const Header = ({ menuVisible, setMenuVisible }) => {
    const [allCompanies, setAllCompanies]   = useState([])
    const [activeCompany, setActiveC]       = useState(null)
    const [alerts, setAlerts]               = useState([])
    const [showAlerts, setShowAlerts]       = useState(false)
    const [companyId, setCompanyId]         = useState(() => Number(localStorage.getItem('active_company_id') || 1))
    const dismissedRef                      = useRef(new Set())
    const alertsRef                         = useRef(null)
    const navigate                          = useNavigate()
    const userStr                           = localStorage.getItem('user')
    const userName                          = userStr ? JSON.parse(userStr).user  : 'User'
    const userEmail                         = userStr ? JSON.parse(userStr).email : ''

    /* ── Alerts ─────────────────────────────────────────────── */
    const fetchAlerts = async (cid) => {
        try {
            const { data } = await axios.post('/api/ai/alerts', { company_id: cid })
            if (data.count > 0) {
                setAlerts(data.alerts.filter(a => !dismissedRef.current.has(a.message)))
            } else {
                setAlerts([])
                setShowAlerts(false)
            }
        } catch {
            setAlerts([])
        }
    }

    const dismissAlert = (message) => {
        dismissedRef.current.add(message)
        setAlerts(prev => prev.filter(a => a.message !== message))
    }

    /* close dropdown on outside click */
    useEffect(() => {
        const handler = (e) => {
            if (alertsRef.current && !alertsRef.current.contains(e.target)) setShowAlerts(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    useEffect(() => { fetchAlerts(companyId) }, [])

    useEffect(() => {
        const onCompanyChange = (e) => {
            const newId = Number(e.detail.companyId)
            setCompanyId(newId)
            dismissedRef.current = new Set()
            setAlerts([])
            fetchAlerts(newId)
        }
        window.addEventListener('company-changed', onCompanyChange)
        return () => window.removeEventListener('company-changed', onCompanyChange)
    }, [])

    /* ── Auth / Companies ───────────────────────────────────── */
    const handleSignOut = async () => {
        try {
            await api.post('/logout')
                .then(res  => { toast.success(res.data.message || 'Successfully signed out.'); localStorage.clear(); navigate('/') })
                .catch(err => { toast.error(err.response?.data?.message || 'Sign out failed') })
        } catch (err) {
            toast.error(err)
            localStorage.clear()
            navigate('/')
        }
    }

    function getCompanies() {
        api.get('/admin/all_companies')
            .then(res => setAllCompanies(res.data))
            .catch(() => toast.error('Failed to fetch companies.'))
    }

    function getActiveCompany() {
        api.get('/admin/active_company')
            .then(res => {
                setActiveC(res.data)
                setCompanyId(Number(res.data))
                localStorage.setItem('active_company_id', res.data)
            })
            .catch(() => toast.error('Failed to fetch active company.'))
    }

    function setActiveCompany(id) {
        api.post(`/admin/set_active_company/${id}`)
            .then(() => {
                const company = allCompanies.find(c => c.cid === id)
                setActiveC(id)
                setCompanyId(id)
                localStorage.setItem('active_company_id', id)
                localStorage.setItem('active_company_name', company?.name || '')
                window.dispatchEvent(new CustomEvent('company-changed', {
                    detail: { companyId: id, companyName: company?.name || '' }
                }))
                navigate('/dashboard')
            })
            .catch(() => toast.error('Failed to set active company.'))
    }

    useEffect(() => { getCompanies(); getActiveCompany() }, [])

    const activeCompanyName = allCompanies.find(c => c.cid === activeCompany)?.name
        || localStorage.getItem('active_company_name')
        || 'ProdFlow'

    return (
        <header className='border-bottom bg-white'>
            <div className="d-flex justify-content-between align-items-center px-3" style={{ height: 60 }}>

                {/* Left: Hamburger */}
                <button className='btn btn-transparent border-0 opacity-75' onClick={() => setMenuVisible(!menuVisible)}>
                    <LuMenu size={24} />
                </button>

                {/* Right: Controls */}
                <div className="d-flex align-items-center gap-2">

                    {/* ── Company Switcher ── */}
                    <div className="dropdown d-none d-md-block">
                        <button
                            className="btn d-flex align-items-center gap-2"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            style={{
                                background: '#f8fafc', border: '1px solid #e2e8f0',
                                borderRadius: 10, padding: '6px 12px',
                                fontSize: '0.82rem', fontWeight: 600, color: '#1e293b',
                                transition: 'all 0.15s',
                            }}
                        >
                            <HiBuildingOffice2 size={15} color={BLUE} />
                            <span style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {activeCompanyName}
                            </span>
                            <FaAngleDown size={11} style={{ opacity: 0.45 }} />
                        </button>
                        <ul className="dropdown-menu shadow-sm rounded-3 border-0 mt-1 py-1" style={{ minWidth: 190 }}>
                            {allCompanies.length === 0 ? (
                                <li>
                                    <span className="dropdown-item" style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                                        No companies
                                    </span>
                                </li>
                            ) : allCompanies.map(cmp => (
                                <li key={cmp.cid}>
                                    <button
                                        className="dropdown-item d-flex align-items-center gap-2"
                                        onClick={() => setActiveCompany(cmp.cid)}
                                        style={{ fontSize: '0.82rem', fontWeight: cmp.cid === activeCompany ? 600 : 400, color: '#1e293b' }}
                                    >
                                        <span style={{
                                            width: 6, height: 6, borderRadius: '50%', flexShrink: 0, display: 'inline-block',
                                            background: cmp.cid === activeCompany ? BLUE : 'transparent',
                                            border: cmp.cid === activeCompany ? 'none' : '1px solid #cbd5e1',
                                        }} />
                                        {cmp.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── Notification Bell ── */}
                    <div className="position-relative d-none d-md-flex" ref={alertsRef}>
                        <button
                            onClick={() => setShowAlerts(v => !v)}
                            style={{
                                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                                background: showAlerts ? '#eff6ff' : '#f8fafc',
                                border: `1px solid ${showAlerts ? '#bfdbfe' : '#e2e8f0'}`,
                                color: showAlerts ? BLUE : '#64748b',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', transition: 'all 0.15s', position: 'relative',
                            }}
                        >
                            <LuBell size={17} />
                            {alerts.length > 0 && (
                                <span style={{
                                    position: 'absolute', top: -5, right: -5,
                                    background: '#ef4444', color: 'white',
                                    borderRadius: '50%', width: 18, height: 18,
                                    fontSize: 10, fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '2px solid white',
                                }}>
                                    {alerts.length > 9 ? '9+' : alerts.length}
                                </span>
                            )}
                        </button>

                        {/* Alerts Dropdown */}
                        {showAlerts && (
                            <div style={{
                                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                                width: 340, background: 'white', borderRadius: 14,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                border: '1px solid #e2e8f0', zIndex: 1050, overflow: 'hidden',
                            }}>
                                <div style={{
                                    padding: '13px 16px', borderBottom: '1px solid #f1f5f9',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>Alerts</span>
                                    {alerts.length > 0 && (
                                        <span style={{
                                            fontSize: '0.72rem', background: '#fef2f2',
                                            color: '#dc2626', padding: '2px 8px', borderRadius: 20, fontWeight: 600,
                                        }}>
                                            {alerts.length} active
                                        </span>
                                    )}
                                </div>
                                {alerts.length === 0 ? (
                                    <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                                        No active alerts
                                    </div>
                                ) : (
                                    <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                                        {alerts.map((a, i) => {
                                            const s = ALERT_STYLE[a.type] || ALERT_STYLE.info
                                            return (
                                                <div key={i} style={{
                                                    display: 'flex', alignItems: 'flex-start', gap: 10,
                                                    padding: '10px 14px', ...s,
                                                    borderBottom: i < alerts.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                                                }}>
                                                    <span style={{ flex: 1, fontSize: '0.8rem', lineHeight: 1.5 }}>{a.message}</span>
                                                    <button
                                                        onClick={() => dismissAlert(a.message)}
                                                        style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.5, padding: 0, display: 'flex', alignItems: 'center' }}
                                                    >
                                                        <AiOutlineClose size={13} />
                                                    </button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── User Avatar Dropdown ── */}
                    <div className="dropdown d-none d-md-block">
                        <button
                            className="btn d-flex align-items-center gap-2"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            style={{
                                background: '#f8fafc', border: '1px solid #e2e8f0',
                                borderRadius: 10, padding: '5px 10px 5px 5px',
                                transition: 'all 0.15s',
                            }}
                        >
                            <div style={{
                                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                                background: `linear-gradient(135deg, ${BLUE} 0%, #1d4ed8 100%)`,
                                color: 'white', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700,
                            }}>
                                {getInitials(userName)}
                            </div>
                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {userName}
                            </span>
                            <FaAngleDown size={11} style={{ opacity: 0.45 }} />
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end shadow-sm rounded-3 border-0 mt-1 py-2" style={{ minWidth: 210 }}>
                            <div className="px-3 pb-2 mb-1" style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <div className="d-flex align-items-center gap-2">
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                                        background: `linear-gradient(135deg, ${BLUE} 0%, #1d4ed8 100%)`,
                                        color: 'white', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700,
                                    }}>
                                        {getInitials(userName)}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {userName}
                                        </div>
                                        {userEmail && (
                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {userEmail}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <li>
                                <Link to='/profile' className="dropdown-item d-flex align-items-center gap-2" style={{ fontSize: '0.82rem' }}>
                                    <PiUserFocusBold size={16} className='txt-custom' /> My Profile
                                </Link>
                            </li>
                            <li>
                                <button className="dropdown-item d-flex align-items-center gap-2" onClick={handleSignOut} style={{ fontSize: '0.82rem' }}>
                                    <PiSignOut size={16} className='txt-custom' /> Sign Out
                                </button>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>
        </header>
    )
}

export default Header
