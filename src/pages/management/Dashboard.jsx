import { useEffect, useState, useCallback } from 'react';
import Layout from '../../layouts/Layout';
import api from '../../api/axios';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { MdOutlineFileDownload, MdOutlineBarChart } from 'react-icons/md';
import { HiOutlineCurrencyDollar } from 'react-icons/hi2';
import { FiShoppingCart, FiUsers } from 'react-icons/fi';
import { BsBoxSeam, BsBoxes } from 'react-icons/bs';
import { TbBuildingWarehouse } from 'react-icons/tb';
import { LuCalendarCheck2, LuWrench } from 'react-icons/lu';

const BLUE       = '#2563EB';
const PIE_COLORS = ['#2563EB', '#1e40af', '#f59e0b', '#94a3b8'];

/* ── Helpers ─────────────────────────────────────────────────── */
const fmt = n => n == null ? '—' : Number(n).toLocaleString('en-US');

const fmtMoney = n =>
    n == null ? '$—' : '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60)     return 'just now';
    if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

/* ── GrowthBadge ─────────────────────────────────────────────── */
function GrowthBadge({ value }) {
    if (value == null) return null;
    const v = Number(value), pos = v >= 0;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 2,
            fontSize: '0.72rem', fontWeight: 700,
            color: pos ? '#10b981' : '#ef4444',
            background: pos ? '#d1fae5' : '#fee2e2',
            borderRadius: 20, padding: '2px 8px',
        }}>
            {pos ? '▲' : '▼'} {pos ? '+' : ''}{Math.abs(v).toFixed(1)}%
        </span>
    );
}

/* ── Skeleton pieces ─────────────────────────────────────────── */
function SkeletonBlock({ w = '100%', h = 16, mb = 0, radius = 6 }) {
    return (
        <div className="placeholder-glow" style={{ marginBottom: mb }}>
            <span className="placeholder" style={{ display: 'block', width: w, height: h, borderRadius: radius }} />
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className="col-6 col-lg-3">
            <div className="bg-white rounded-4 shadow-sm p-3 p-md-4">
                <SkeletonBlock w={40} h={40} mb={12} radius={12} />
                <SkeletonBlock w="55%" h={28} mb={8} />
                <SkeletonBlock w="75%" h={14} mb={4} />
                <SkeletonBlock w="45%" h={12} />
            </div>
        </div>
    );
}

function SkeletonChart({ height = 260 }) {
    return (
        <div className="placeholder-glow">
            <span className="placeholder" style={{ display: 'block', width: '100%', height, borderRadius: 8 }} />
        </div>
    );
}

/* ── StatCard ────────────────────────────────────────────────── */
function StatCard({ icon, iconBg, iconColor, title, subtitle, value, badge }) {
    return (
        <div className="col-6 col-lg-3">
            <div className="bg-white rounded-4 shadow-sm p-3 p-md-4 h-100">
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {icon}
                    </div>
                    <GrowthBadge value={badge} />
                </div>
                <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{value}</div>
                <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 4 }}>{title}</div>
                {subtitle && <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>{subtitle}</div>}
            </div>
        </div>
    );
}

/* ── Activity item ───────────────────────────────────────────── */
const ICON_CFG = {
    cart:     { node: <FiShoppingCart size={14} />, bg: '#eff6ff', color: BLUE },
    factory:  { node: <BsBoxes size={14} />,        bg: '#f0fdf4', color: '#10b981' },
    calendar: { node: <LuCalendarCheck2 size={14}/>, bg: '#faf5ff', color: '#7c3aed' },
    wrench:   { node: <LuWrench size={14} />,       bg: '#fff7ed', color: '#f59e0b' },
};

function ActivityItem({ item }) {
    const cfg = ICON_CFG[item.icon] || ICON_CFG.cart;
    return (
        <div className="d-flex align-items-start gap-3 py-2" style={{ borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {cfg.node}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{item.detail}</div>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', flexShrink: 0, whiteSpace: 'nowrap' }}>{timeAgo(item.date)}</div>
        </div>
    );
}

/* ── Donut label ─────────────────────────────────────────────── */
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
    if (percent < 0.05) return null;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-(midAngle * Math.PI) / 180);
    const y = cy + r * Math.sin(-(midAngle * Math.PI) / 180);
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
}

/* ── Dashboard ───────────────────────────────────────────────── */
export default function Dashboard() {
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    const userName = (() => {
        try { const u = localStorage.getItem('user'); return u ? JSON.parse(u).user : 'User'; } catch { return 'User'; }
    })();

    const load = useCallback(() => {
        setLoading(true);
        setError(null);
        api.get('/admin/dashboard')
            .then(res => { setData(res.data); setLoading(false); })
            .catch(err => {
                const msg = err.response
                    ? `${err.response.status} — ${JSON.stringify(err.response.data).slice(0, 200)}`
                    : err.message;
                setError(msg);
                setLoading(false);
            });
    }, []);

    useEffect(() => { load(); }, [load]);

    /* auto-refresh every 60 s */
    useEffect(() => {
        const id = setInterval(load, 60_000);
        return () => clearInterval(id);
    }, [load]);

    /* re-fetch when active company changes */
    useEffect(() => {
        const h = () => load();
        window.addEventListener('company-changed', h);
        return () => window.removeEventListener('company-changed', h);
    }, [load]);

    const stats          = data?.stats;
    const charts         = data?.charts;
    const topProducts    = data?.top_products    || [];
    const recentActivity = data?.recent_activity || [];
    const warehouse      = data?.warehouse;
    const today          = data?.today_summary;
    const distribution   = charts?.distribution  || [];

    const maxVal = topProducts.length
        ? Math.max(...topProducts.map(p => Number(p.total_value) || 0), 1)
        : 1;

    return (
        <Layout>
            {error && (
                <div className="alert alert-danger rounded-4 mb-3 py-2 px-3" style={{ fontSize: '0.78rem', fontFamily: 'monospace' }}>
                    <strong>API Error:</strong> {error}
                </div>
            )}

            {/* ── Welcome Banner ─────────────────────────────── */}
            <div className="rounded-4 px-4 py-4 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3"
                style={{ background: `linear-gradient(135deg, ${BLUE} 0%, #1d4ed8 100%)`, color: 'white' }}>
                <div>
                    <p style={{ fontSize: '0.68rem', letterSpacing: '1.5px', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>
                        Welcome back, {userName}
                    </p>
                    <h3 style={{ fontWeight: 800, marginBottom: 6, fontSize: '1.45rem' }}>Here's what's happening today</h3>
                    <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: 0 }}>
                        {stats
                            ? `Revenue is up ${Number(stats.revenue?.growth_percent || 0).toFixed(1)}% this month and production efficiency hit a new high.`
                            : 'Loading company data...'}
                    </p>
                </div>
                <div className="d-flex gap-2 flex-wrap align-items-center">
                    <button className="btn btn-sm fw-semibold d-flex align-items-center gap-2"
                        style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', borderRadius: 8 }}>
                        <MdOutlineFileDownload size={16} /> Export
                    </button>
                    <button className="btn btn-sm fw-semibold d-flex align-items-center gap-2"
                        style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', borderRadius: 8 }}>
                        <MdOutlineBarChart size={16} /> View Reports
                    </button>
                </div>
            </div>

            {/* ── Stat Cards ─────────────────────────────────── */}
            <div className="row g-3 mb-4">
                {loading ? (
                    [0,1,2,3].map(i => <SkeletonCard key={i} />)
                ) : <>
                    <StatCard
                        icon={<HiOutlineCurrencyDollar size={20} />}
                        iconBg="#eff6ff" iconColor={BLUE}
                        title="Total Revenue" subtitle="vs last month"
                        value={fmtMoney(stats?.revenue?.this_month)}
                        badge={stats?.revenue?.growth_percent}
                    />
                    <StatCard
                        icon={<FiShoppingCart size={18} />}
                        iconBg="#f0fdf4" iconColor="#10b981"
                        title="Active Orders"
                        subtitle={stats?.transactions?.pending != null ? `${stats.transactions.pending} pending` : null}
                        value={fmt(stats?.transactions?.this_month)}
                        badge={stats?.transactions?.growth_percent}
                    />
                    <StatCard
                        icon={<MdOutlineBarChart size={20} />}
                        iconBg="#faf5ff" iconColor="#7c3aed"
                        title="Production Output"
                        subtitle={stats?.production?.efficiency_rate != null
                            ? `${Number(stats.production.efficiency_rate).toFixed(1)}% efficiency rate`
                            : '— efficiency rate'}
                        value={stats?.production?.this_month != null ? `${fmt(stats.production.this_month)} units` : '—'}
                        badge={stats?.production?.growth_percent}
                    />
                    <StatCard
                        icon={<FiUsers size={18} />}
                        iconBg="#fff7ed" iconColor="#f59e0b"
                        title="Active Staff"
                        subtitle={stats?.staff?.on_vacation_today != null
                            ? `${stats.staff.on_vacation_today} on vacation today`
                            : null}
                        value={fmt(stats?.staff?.total)}
                        badge={null}
                    />
                </>}
            </div>

            {/* ── Row 1: Revenue vs Expenses + Distribution ──── */}
            <div className="row g-3 mb-4">
                <div className="col-12 col-lg-8">
                    <div className="bg-white rounded-4 shadow-sm p-4 h-100">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h6 className="fw-bold mb-0">Revenue vs Expenses</h6>
                                <small className="text-muted">Last 9 months performance</small>
                            </div>
                            <div className="d-flex gap-3">
                                {[['Revenue', BLUE], ['Expenses', '#93c5fd']].map(([l, c]) => (
                                    <span key={l} className="d-flex align-items-center gap-1" style={{ fontSize: '0.74rem', color: '#374151' }}>
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block' }} /> {l}
                                    </span>
                                ))}
                            </div>
                        </div>
                        {loading ? <SkeletonChart height={220} /> : (
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={charts?.revenue_vs_expenses || []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                                        tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                                    <Tooltip
                                        formatter={(v, n) => [fmtMoney(v), n === 'revenue' ? 'Revenue' : 'Expenses']}
                                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }} />
                                    <Line type="monotone" dataKey="revenue"  stroke={BLUE}    strokeWidth={2.5} dot={false} />
                                    <Line type="monotone" dataKey="expenses" stroke="#93c5fd" strokeWidth={2}   dot={false} strokeDasharray="4 2" />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="col-12 col-lg-4">
                    <div className="bg-white rounded-4 shadow-sm p-4 h-100 d-flex flex-column">
                        <h6 className="fw-bold mb-0">{charts?.distribution_label || 'Distribution'}</h6>
                        <small className="text-muted mb-2">{
                            ({ 'Sales by Product': 'Distribution this month', 'Production by Product': 'All-time production units', 'Materials in Stock': 'Current stock quantities' })[charts?.distribution_label] ?? 'Distribution'
                        }</small>
                        {loading ? <SkeletonChart height={200} /> : <>
                            <div style={{ flex: 1 }}>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie data={distribution} cx="50%" cy="50%"
                                            innerRadius={52} outerRadius={78}
                                            dataKey="value" labelLine={false} label={PieLabel}>
                                            {distribution.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(v, n, p) => [fmtMoney(v), p.payload.name]}
                                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {distribution.map((item, i) => (
                                    <div key={i} className="d-flex justify-content-between align-items-center">
                                        <span className="d-flex align-items-center gap-2" style={{ fontSize: '0.78rem', color: '#374151' }}>
                                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], display: 'inline-block', flexShrink: 0 }} />
                                            {item.name}
                                        </span>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151' }}>{item.percent}%</span>
                                    </div>
                                ))}
                            </div>
                        </>}
                    </div>
                </div>
            </div>

            {/* ── Row 2: Weekly Production + Warehouse + Today ─ */}
            <div className="row g-3 mb-4">
                <div className="col-12 col-lg-8">
                    <div className="bg-white rounded-4 shadow-sm p-4 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h6 className="fw-bold mb-0">Weekly Production Output</h6>
                                <small className="text-muted">Units produced per day</small>
                            </div>
                            <GrowthBadge value={stats?.production?.growth_percent} />
                        </div>
                        {loading ? <SkeletonChart height={220} /> : (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={charts?.weekly_production || []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        formatter={v => [fmt(v), 'Units']}
                                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }} />
                                    <Bar dataKey="units" fill={BLUE} radius={[5, 5, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="col-12 col-lg-4 d-flex flex-column gap-3">
                    {/* Warehouse */}
                    <div className="rounded-4 p-4" style={{ background: '#EEF2FF' }}>
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div style={{ width: 42, height: 42, borderRadius: 12, background: BLUE, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <TbBuildingWarehouse size={20} />
                            </div>
                            <div>
                                <div className="fw-bold" style={{ fontSize: '0.95rem', color: '#0f172a' }}>Warehouse Capacity</div>
                                <small className="text-muted">
                                    {loading ? '—' : `${warehouse?.active_warehouses ?? 0} active locations`}
                                </small>
                            </div>
                        </div>
                        {loading ? <SkeletonBlock w="40%" h={38} mb={10} /> : (() => {
                            const pct = warehouse?.capacity_percent != null
                                ? Math.round(warehouse.capacity_percent)
                                : (warehouse?.total_stock_units != null && warehouse?.max_stock_units != null)
                                    ? Math.min(100, Math.round((warehouse.total_stock_units / warehouse.max_stock_units) * 100))
                                    : null;
                            return (
                                <>
                                    <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
                                        {pct != null ? `${pct}%` : fmt(warehouse?.total_stock_units)}
                                    </div>
                                    <div style={{ height: 6, background: 'rgba(37,99,235,0.18)', borderRadius: 8, marginBottom: 8 }}>
                                        <div style={{ height: '100%', borderRadius: 8, background: BLUE, width: `${pct ?? 0}%`, transition: 'width 0.7s ease' }} />
                                    </div>
                                </>
                            );
                        })()}
                        <small style={{ color: '#475569' }}>
                            {loading ? '—' : (
                                warehouse?.total_stock_units != null && warehouse?.max_stock_units != null
                                    ? `${fmt(warehouse.total_stock_units)} / ${fmt(warehouse.max_stock_units)} units`
                                    : `${fmt(warehouse?.total_stock_units)} total units`
                            )}
                        </small>
                    </div>

                    {/* Today's Summary */}
                    <div className="bg-white rounded-4 shadow-sm p-4 flex-grow-1">
                        <h6 className="fw-bold mb-3">Today's Summary</h6>
                        {[
                            { label: 'Orders fulfilled',      value: today?.sales_today,          color: '#10b981' },
                            { label: 'Pending vacations',     value: today?.pending_vacations,     color: '#f59e0b' },
                            { label: 'Stock alerts',          value: today?.stock_alerts,          color: '#ef4444' },
                            { label: 'Expiring contracts',    value: today?.expiring_contracts,    color: '#6366f1' },
                        ].map((row, i, arr) => (
                            <div key={i} className="d-flex justify-content-between align-items-center py-2"
                                style={{ borderBottom: i < arr.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                                <span className="d-flex align-items-center gap-2" style={{ fontSize: '0.82rem', color: '#374151' }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: row.color, display: 'inline-block' }} />
                                    {row.label}
                                </span>
                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                                    {loading ? '—' : (row.value ?? '—')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Row 3: Top Products + Recent Activity ────────── */}
            <div className="row g-3 mb-2">
                <div className="col-12 col-lg-8">
                    <div className="bg-white rounded-4 shadow-sm p-4 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h6 className="fw-bold mb-0">Top Performing Products</h6>
                                <small className="text-muted">Best sellers this month</small>
                            </div>
                            <button className="btn btn-sm" style={{ fontSize: '0.75rem', color: '#6b7280', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 10px' }}>
                                View report
                            </button>
                        </div>
                        {loading
                            ? [0,1,2,3,4].map(i => (
                                <div key={i} className="d-flex align-items-center gap-3 mb-3">
                                    <SkeletonBlock w={32} h={32} radius={8} />
                                    <div style={{ flex: 1 }}>
                                        <SkeletonBlock w="60%" h={13} mb={6} />
                                        <SkeletonBlock w="100%" h={4} />
                                    </div>
                                </div>
                            ))
                            : topProducts.map((p, i) => (
                                <div key={i} className="d-flex align-items-center gap-3 mb-3">
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', color: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <BsBoxSeam size={14} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div className="d-flex justify-content-between mb-1">
                                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.product}</span>
                                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', flexShrink: 0, marginLeft: 8 }}>{fmtMoney(p.total_value)}</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <div style={{ flex: 1, height: 4, background: '#f1f5f9', borderRadius: 4 }}>
                                                <div style={{ height: '100%', background: BLUE, borderRadius: 4, width: `${Math.round((Number(p.total_value) / maxVal) * 100)}%`, transition: 'width 0.6s ease' }} />
                                            </div>
                                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', flexShrink: 0, width: 80, textAlign: 'right' }}>{fmt(p.units_sold)} units sold</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                <div className="col-12 col-lg-4">
                    <div className="bg-white rounded-4 shadow-sm p-4 h-100 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <h6 className="fw-bold mb-0">Recent Activity</h6>
                            <button className="btn btn-sm p-0" style={{ fontSize: '0.75rem', color: BLUE, background: 'none', border: 'none' }}>View all</button>
                        </div>
                        <small className="text-muted mb-3">Latest events</small>
                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            {loading
                                ? [0,1,2,3,4].map(i => (
                                    <div key={i} className="d-flex gap-3 py-2" style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <SkeletonBlock w={32} h={32} radius={8} />
                                        <div style={{ flex: 1 }}>
                                            <SkeletonBlock w="70%" h={13} mb={4} />
                                            <SkeletonBlock w="50%" h={11} />
                                        </div>
                                    </div>
                                ))
                                : recentActivity.length === 0
                                    ? <div className="text-muted text-center py-4" style={{ fontSize: '0.8rem' }}>No recent activity</div>
                                    : recentActivity.map((item, i) => <ActivityItem key={i} item={item} />)
                            }
                        </div>
                    </div>
                </div>
            </div>

        </Layout>
    );
}
