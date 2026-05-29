import { useState, useEffect, useCallback, useMemo } from 'react'
import Layout from '../../../layouts/Layout'
import api from '../../../api/axios'
import { toast } from 'react-toastify'
import { exportToPDF } from '../../../utils/exportToPDF'
import { useReportAccess } from '../../../hooks/useReportAccess'
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { MdOutlineFileDownload, MdOutlineShoppingCart, MdOutlineReceipt } from 'react-icons/md'
import { LuTrendingUp, LuTrophy, LuDollarSign } from 'react-icons/lu'
import { BsGearFill } from 'react-icons/bs'
import ReportPDFTemplate from './ReportPDFTemplate'

/* ── Constants ──────────────────────────────────────────────── */
const BLUE          = '#2563EB'
const DARK_BLUE     = '#1E40AF'
const STROKE_LIGHT  = '#93C5FD'
const GREEN         = '#22C55E'
const RED           = '#EF4444'
const AMBER         = '#F59E0B'
const CLIENT_COLORS = ['#1E40AF', '#2563EB', '#F59E0B', '#22C55E', '#9CA3AF']

/* ── Helpers ────────────────────────────────────────────────── */
const todayStr   = () => new Date().toISOString().slice(0, 10)
const daysAgo    = n  => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10)
const fmt        = n  => n == null ? '—' : Number(n).toLocaleString('en-US')
const fmtRevenue = n  => n == null ? '—' : `$${Number(n).toLocaleString('en-US')}`
const fmtDecimal = n  => n == null ? '—' : `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const fmtGrowth  = n  => { const v = Number(n || 0); return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%` }
const monthAbbr  = s  => (s || '').slice(0, 3)

/* ── Skeleton ───────────────────────────────────────────────── */
function Skel({ w = '100%', h = 16, r = 6, mb = 0 }) {
    return (
        <div className="placeholder-glow" style={{ marginBottom: mb }}>
            <span className="placeholder" style={{ display: 'block', width: w, height: h, borderRadius: r }} />
        </div>
    )
}

/* ── Growth Badge ───────────────────────────────────────────── */
function Badge({ label, color, bg }) {
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontSize: '0.72rem', fontWeight: 700, color, background: bg,
            borderRadius: 20, padding: '2px 8px',
        }}>
            {label}
        </span>
    )
}

/* ── KPI Card ───────────────────────────────────────────────── */
function KpiCard({ icon, iconBg, iconColor, value, label, subtitle, badge, loading, valueStyle }) {
    return (
        <div className="col-6 col-lg">
            <div className="h-100" style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', padding: '16px 18px' }}>
                {loading ? (
                    <>
                        <Skel w={36} h={36} r={10} mb={14} />
                        <Skel w="55%" h={26} mb={8} />
                        <Skel w="75%" h={12} mb={4} />
                        <Skel w="45%" h={11} />
                    </>
                ) : (
                    <>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {icon}
                            </div>
                            {badge}
                        </div>
                        <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...valueStyle }}>
                            {value}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 5 }}>{label}</div>
                        {subtitle && <div style={{ fontSize: '0.71rem', color: '#94a3b8', marginTop: 2 }}>{subtitle}</div>}
                    </>
                )}
            </div>
        </div>
    )
}

/* ── Chart skeleton ─────────────────────────────────────────── */
function ChartSkel({ h = 240 }) {
    return (
        <div className="placeholder-glow">
            <span className="placeholder" style={{ display: 'block', width: '100%', height: h, borderRadius: 8 }} />
        </div>
    )
}

/* ── Empty state ────────────────────────────────────────────── */
function Empty({ h = 200 }) {
    return (
        <div style={{ height: h, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: 8 }}>
            <MdOutlineFileDownload size={32} style={{ opacity: 0.3 }} />
            <span style={{ fontSize: '0.82rem' }}>No data available for this period</span>
        </div>
    )
}

/* ── Tooltip ────────────────────────────────────────────────── */
function SalesTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}>
            <p style={{ margin: '0 0 6px', fontWeight: 600, color: '#0f172a' }}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ margin: '2px 0', color: p.color }}>
                    {p.name}: <strong>{typeof p.value === 'number' && p.name !== 'Growth' ? fmtRevenue(p.value) : `${p.value}%`}</strong>
                </p>
            ))}
        </div>
    )
}

/* ── Orders Tooltip ─────────────────────────────────────────── */
function OrdersTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}>
            <p style={{ margin: '0 0 6px', fontWeight: 600, color: '#0f172a' }}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ margin: '2px 0', color: p.color }}>
                    {p.name}: <strong>{fmt(p.value)}</strong>
                </p>
            ))}
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function SalesReport() {
    const { checking, denied, startDate: accessStart, endDate: accessEnd, withRunId, runId } =
        useReportAccess('sales')

    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [loading,        setLoading]        = useState(false)
    const [exporting,      setExporting]      = useState(false)
    const [summary,        setSummary]        = useState(null)
    const [trends,         setTrends]         = useState(null)
    const [topProducts,    setTopProducts]    = useState([])
    const [topClients,     setTopClients]     = useState([])
    const [ordersOverview, setOrdersOverview] = useState([])
    const [showAllProducts, setShowAllProducts] = useState(false)

    /* ── Fetch all 5 endpoints ──────────────────────────────── */
    const generate = useCallback(async (sd, ed) => {
        if (!runId) return
        if (sd > ed) { toast.error('End date must be after start date.'); return }
        setLoading(true)
        try {
            const q = withRunId(`start_date=${sd}&end_date=${ed}`)
            const [sumR, trendR, prodR, clientR, ordersR] = await Promise.all([
                api.get(`/admin/reports/sales/summary?${q}`),
                api.get(`/admin/reports/sales/trends?${q}`),
                api.get(`/admin/reports/sales/top-products?${q}`),
                api.get(`/admin/reports/sales/top-clients?${q}`),
                api.get(`/admin/reports/sales/orders-overview?${q}`),
            ])
            setSummary(sumR.data)
            setTrends(trendR.data)
            setTopProducts(Array.isArray(prodR.data)    ? prodR.data    : [])
            setTopClients(Array.isArray(clientR.data)   ? clientR.data  : [])
            setOrdersOverview(Array.isArray(ordersR.data) ? ordersR.data : [])
        } catch {
            toast.error('Failed to generate report. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [runId, withRunId])

    useEffect(() => {
        if (accessStart && accessEnd) {
            setStartDate(accessStart)
            setEndDate(accessEnd)
        }
    }, [accessStart, accessEnd])

    useEffect(() => {
        if (!denied && !checking && runId && accessStart && accessEnd) {
            generate(accessStart, accessEnd)
        }
    }, [denied, checking, runId, accessStart, accessEnd, generate])

    /* ── Derived data ───────────────────────────────────────── */
    const weeklyData = useMemo(() =>
        (trends?.weekly || []).map(d => ({ ...d, label: d.week })),
    [trends])

    const monthlyData = useMemo(() => {
        const raw = trends?.monthly || []
        return raw.map((d, i) => {
            if (i === 0) return { ...d, label: monthAbbr(d.month), computed_growth: null }
            const prevRev = Number(raw[i - 1]?.revenue) || 0
            const curRev  = Number(d?.revenue) || 0
            // null when prevRev is 0 — can't compute meaningful growth from nothing
            const growth = prevRev > 0
                ? Number(((curRev - prevRev) / prevRev * 100).toFixed(2))
                : null
            return { ...d, label: monthAbbr(d.month), computed_growth: growth }
        })
    }, [trends])


    // Overall period growth: last month vs first month with revenue
    const periodGrowth = useMemo(() => {
        const raw = trends?.monthly || []
        const withRevenue = raw.filter(d => Number(d?.revenue) > 0)
        if (withRevenue.length < 2) return null
        const first = Number(withRevenue[0]?.revenue)
        const last  = Number(withRevenue[withRevenue.length - 1]?.revenue)
        return Number(((last - first) / first * 100).toFixed(1))
    }, [trends])

    const visibleProducts = useMemo(() =>
        showAllProducts ? topProducts : topProducts.slice(0, 5),
    [topProducts, showAllProducts])

    const effectiveGrowth   = periodGrowth ?? Number(summary?.revenue_growth || 0)
    const revenueGrowthPos  = effectiveGrowth >= 0
    const ordersGrowthPos   = Number(summary?.orders_growth || 0) >= 0

    /* ── PDF props ───────────────────────────────────────────── */
    const pdfProps = useMemo(() => {
        if (!summary) return null
        return {
            reportTitle: 'Sales Report',
            kpis: [
                { accent: BLUE,      bg: '#eff6ff', value: fmtRevenue(summary.total_revenue),        label: 'Total Revenue',   sub: 'selected period' },
                { accent: '#0D9488', bg: '#f0fdfa', value: fmt(summary.total_orders),                label: 'Total Orders',    sub: 'entries' },
                { accent: '#7C3AED', bg: '#faf5ff', value: fmtDecimal(summary.avg_order_value),      label: 'Avg Order Value', sub: 'per transaction' },
                { accent: AMBER,     bg: '#fffbeb', value: (summary.best_seller?.product_name || '—').slice(0, 18), label: 'Best Seller', sub: `${fmt(summary.best_seller?.units_sold)} units` },
            ],
            panels: [
                {
                    title: 'Weekly Revenue', subtitle: 'Revenue over selected period', type: 'bars',
                    data: (trends?.weekly || []).map(d => ({ label: d.week, value: Number(d.revenue) || 0 })),
                },
                {
                    title: 'Top Clients', subtitle: 'Revenue distribution by client', type: 'progress-list',
                    data: topClients.slice(0, 5).map((c, i) => ({ label: c.client, value: fmtRevenue(c.revenue), pct: Number(c.percentage) || 0, color: CLIENT_COLORS[i % CLIENT_COLORS.length] })),
                },
                {
                    title: 'Top Selling Products', subtitle: 'By revenue this period', type: 'progress-list',
                    data: topProducts.slice(0, 5).map(p => ({ label: p.product_name, value: fmtRevenue(p.revenue), pct: Number(p.percentage) || 0, color: DARK_BLUE })),
                },
                {
                    title: 'Monthly Orders', subtitle: 'Order count per month', type: 'bars',
                    data: ordersOverview.map(d => ({ label: monthAbbr(d.month), value: Number(d.orders) || 0 })),
                },
            ],
            tableTitle: 'Top Selling Products',
            tableColumns: [
                { label: '#',          align: 'center' },
                { label: 'Product',    align: 'left'   },
                { label: 'Units Sold', align: 'right'  },
                { label: 'Revenue',    align: 'right'  },
                { label: '% Share',    align: 'right'  },
            ],
            tableRows: topProducts.map((p, i) => [
                String(i + 1),
                p.product_name,
                fmt(p.units_sold),
                fmtRevenue(p.revenue),
                `${Number(p.percentage).toFixed(1)}%`,
            ]),
            tableTotals: ['—', 'TOTAL', '—', fmtRevenue(summary.total_revenue), '100%'],
        }
    }, [summary, trends, topProducts, topClients, ordersOverview, revenueGrowthPos])

    /* ── Handlers ───────────────────────────────────────────── */
    const handleGenerate = (e) => {
        e.preventDefault()
        generate(startDate, endDate)
    }

    const handleExport = async () => {
        if (!summary || exporting) return
        setExporting(true)
        try {
            await exportToPDF('pdf-export-container', `sales-report-${startDate}-${endDate}.pdf`)
            toast.success('Report exported successfully')
        } catch {
            toast.error('Failed to export report. Please try again.')
        } finally {
            setExporting(false)
        }
    }

    /* ──────────────────────────────────────────────────────── */
    if (checking) {
        return (
            <Layout>
                <div className="text-center text-muted py-5">Verifying report access…</div>
            </Layout>
        )
    }

    if (denied) return null

    return (
        <Layout>

            {/* ── Page Header ────────────────────────────────── */}
            <div className="mb-4">
                <h4 className="fw-bold mb-0" style={{ color: '#0f172a' }}>Sales Report</h4>
                <small style={{ color: '#6b7280' }}>Business analytics · Revenue & orders</small>
            </div>

            {/* ── Filter Bar ──────────────────────────────────── */}
            <div className="bg-white rounded-4 shadow-sm p-3 p-md-4 mb-4">
                <form onSubmit={handleGenerate}>
                    <div className="d-flex flex-wrap align-items-end gap-3">
                        <div style={{ flex: '1 1 180px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>Start date</label>
                            <input
                                type="date"
                                className="form-control shadow-none"
                                style={{ fontSize: '0.875rem', borderRadius: 10, border: '1px solid #e2e8f0', height: 42 }}
                                value={startDate}
                                max={endDate}
                                onChange={e => setStartDate(e.target.value)}
                            />
                        </div>
                        <div style={{ flex: '1 1 180px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>End date</label>
                            <input
                                type="date"
                                className="form-control shadow-none"
                                style={{ fontSize: '0.875rem', borderRadius: 10, border: '1px solid #e2e8f0', height: 42 }}
                                value={endDate}
                                min={startDate}
                                onChange={e => setEndDate(e.target.value)}
                            />
                        </div>
                        <div className="d-flex gap-2" style={{ marginTop: 'auto' }}>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn d-flex align-items-center gap-2 fw-semibold px-4"
                                style={{ background: BLUE, color: 'white', border: 'none', borderRadius: 10, height: 42, whiteSpace: 'nowrap' }}
                            >
                                {loading
                                    ? <><span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14 }} /> Generating...</>
                                    : 'Generate report'
                                }
                            </button>
                            <button
                                type="button"
                                onClick={handleExport}
                                disabled={!summary || loading || exporting}
                                className="btn d-flex align-items-center gap-2 fw-semibold px-4"
                                style={{ background: 'white', border: '1px solid #e2e8f0', color: '#374151', borderRadius: 10, height: 42, whiteSpace: 'nowrap' }}
                            >
                                {exporting
                                    ? <><span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14 }} /> Generating...</>
                                    : <><MdOutlineFileDownload size={17} /> Export report</>
                                }
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* ── KPI Cards ───────────────────────────────────── */}
            <div className="row g-3 mb-4">

                {/* Total Revenue */}
                <KpiCard
                    loading={loading}
                    icon={<LuDollarSign size={18} />}
                    iconBg="#eff6ff" iconColor={BLUE}
                    value={fmtRevenue(summary?.total_revenue)}
                    label="Total Revenue"
                    subtitle="vs prev. period"
                    badge={summary
                        ? <Badge label={`${revenueGrowthPos ? '↗' : '↙'} ${fmtGrowth(effectiveGrowth)}`} color={revenueGrowthPos ? '#16a34a' : '#dc2626'} bg={revenueGrowthPos ? '#dcfce7' : '#fee2e2'} />
                        : null}
                />

                {/* Total Orders */}
                <KpiCard
                    loading={loading}
                    icon={<MdOutlineShoppingCart size={20} />}
                    iconBg="#f0fdfa" iconColor="#0D9488"
                    value={fmt(summary?.total_orders)}
                    label="Total Orders"
                    subtitle="this period"
                    badge={summary
                        ? <Badge label={`${ordersGrowthPos ? '↗' : '↙'} ${fmtGrowth(summary.orders_growth)}`} color={ordersGrowthPos ? '#16a34a' : '#dc2626'} bg={ordersGrowthPos ? '#dcfce7' : '#fee2e2'} />
                        : null}
                />

                {/* Avg Order Value */}
                <KpiCard
                    loading={loading}
                    icon={<MdOutlineReceipt size={20} />}
                    iconBg="#faf5ff" iconColor="#7C3AED"
                    value={fmtDecimal(summary?.avg_order_value)}
                    label="Avg Order Value"
                    subtitle="per transaction"
                    badge={summary?.profit_margin != null
                        ? <Badge label={`${Number(summary.profit_margin).toFixed(1)}% margin`} color="#16a34a" bg="#dcfce7" />
                        : null}
                />

                {/* Best Seller */}
                <KpiCard
                    loading={loading}
                    icon={<LuTrophy size={18} />}
                    iconBg="#fffbeb" iconColor={AMBER}
                    value={summary?.best_seller?.product_name || '—'}
                    label="Best Seller"
                    subtitle="this period"
                    badge={summary?.best_seller
                        ? <Badge label={`↗ ${fmt(summary.best_seller.units_sold)} sold`} color="#16a34a" bg="#dcfce7" />
                        : null}
                    valueStyle={{ fontSize: '1.1rem' }}
                />
            </div>

            {/* ── Row 1: Revenue vs Expenses + Revenue by Client ─ */}
            <div className="row g-3 mb-4">

                {/* Revenue vs Expenses — Area Chart */}
                <div className="col-12 col-lg-7">
                    <div className="bg-white rounded-4 shadow-sm p-4 h-100">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <h6 className="fw-bold mb-0">Revenue vs Expenses</h6>
                                <small className="text-muted">Performance over selected range</small>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="d-flex gap-3 mb-3">
                            {[['Revenue', BLUE], ['Expenses', STROKE_LIGHT]].map(([l, c]) => (
                                <span key={l} className="d-flex align-items-center gap-1" style={{ fontSize: '0.74rem', color: '#374151' }}>
                                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'inline-block' }} />
                                    {l}
                                </span>
                            ))}
                        </div>

                        {loading ? <ChartSkel h={220} /> : weeklyData.length === 0 ? <Empty h={220} /> : (
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={weeklyData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor={BLUE}        stopOpacity={0.18} />
                                            <stop offset="95%" stopColor={BLUE}        stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="expensesGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor={STROKE_LIGHT} stopOpacity={0.14} />
                                            <stop offset="95%" stopColor={STROKE_LIGHT} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                                        tickFormatter={v => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`} />
                                    <Tooltip content={<SalesTooltip />} />
                                    <Area type="monotone" dataKey="revenue"  name="Revenue"  stroke={BLUE}         strokeWidth={2.5} fill="url(#revenueGrad)"  dot={false} />
                                    <Area type="monotone" dataKey="expenses" name="Expenses" stroke={STROKE_LIGHT} strokeWidth={1.5} fill="url(#expensesGrad)" dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Revenue by Client — Donut */}
                <div className="col-12 col-lg-5">
                    <div className="bg-white rounded-4 shadow-sm p-4 h-100 d-flex flex-column">
                        <h6 className="fw-bold mb-0">Revenue by Client</h6>
                        <small className="text-muted mb-3">Distribution this period</small>

                        {loading ? <ChartSkel h={200} /> : topClients.length === 0 ? <Empty h={200} /> : (
                            <>
                                <div style={{ flex: 1 }}>
                                    <ResponsiveContainer width="100%" height={180}>
                                        <PieChart>
                                            <Pie
                                                data={topClients}
                                                cx="50%" cy="50%"
                                                innerRadius={50} outerRadius={74}
                                                dataKey="percentage" nameKey="client"
                                                labelLine={false}
                                            >
                                                {topClients.map((_, i) => (
                                                    <Cell key={i} fill={CLIENT_COLORS[i % CLIENT_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(v, n) => [`${v}%`, n]}
                                                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    {topClients.map((c, i) => (
                                        <div key={i} className="d-flex justify-content-between align-items-center">
                                            <span className="d-flex align-items-center gap-2" style={{ fontSize: '0.78rem', color: '#374151' }}>
                                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: CLIENT_COLORS[i % CLIENT_COLORS.length], display: 'inline-block', flexShrink: 0 }} />
                                                {c.client}
                                            </span>
                                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151' }}>{c.percentage}%</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Row 2: Monthly Revenue ───────────────────────── */}
            <div className="row g-3 mb-4">
                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <h6 className="fw-bold mb-0">Monthly Sales Revenue</h6>
                                <small className="text-muted">Revenue per month</small>
                            </div>
                            {summary && effectiveGrowth !== 0 && (
                                <Badge
                                    label={`${revenueGrowthPos ? '↑' : '↓'} ${fmtGrowth(effectiveGrowth)}`}
                                    color={revenueGrowthPos ? GREEN : RED}
                                    bg={revenueGrowthPos ? '#d1fae5' : '#fee2e2'}
                                />
                            )}
                        </div>

                        {loading ? <ChartSkel h={240} /> : monthlyData.length === 0 ? <Empty h={240} /> : (
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }} barCategoryGap="40%">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                                        tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                                    <Tooltip
                                        formatter={(v, n) => [fmtRevenue(v), n]}
                                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}
                                    />
                                    <Bar dataKey="revenue" name="Revenue" fill={BLUE} radius={[6, 6, 0, 0]} maxBarSize={64} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Top Selling Products ─────────────────────────── */}
            <div className="bg-white rounded-4 shadow-sm p-4 mb-2">
                <div className="mb-3">
                    <h6 className="fw-bold mb-0">Top Selling Products</h6>
                    <small className="text-muted">Highest revenue products this period</small>
                </div>

                <div>
                    {loading ? (
                        [0,1,2,3,4].map(i => (
                            <div key={i} className="py-3" style={{ borderBottom: i < 4 ? '1px solid #f8fafc' : 'none' }}>
                                <div className="d-flex align-items-center gap-3 mb-2">
                                    <Skel w={36} h={36} r={8} />
                                    <div style={{ flex: 1 }}>
                                        <Skel w="40%" h={13} mb={5} />
                                        <Skel w="25%" h={11} />
                                    </div>
                                    <Skel w="8%" h={13} />
                                </div>
                                <Skel w="100%" h={4} r={10} />
                            </div>
                        ))
                    ) : topProducts.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>
                            <BsGearFill size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                            <div style={{ fontSize: '0.82rem' }}>No products data for this period</div>
                        </div>
                    ) : (
                        <>
                            {visibleProducts.map((p, i, arr) => (
                                <div key={i} className="py-3" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                                    <div className="d-flex align-items-center gap-3 mb-2">
                                        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f1f5f9', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <BsGearFill size={16} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {p.product_name}
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                                {fmt(p.units_sold)} units sold
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                                                {fmtRevenue(p.revenue)}
                                            </div>
                                            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                                                {Number(p.percentage).toFixed(1)}% of total
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ height: 4, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%', width: `${Math.min(100, Number(p.percentage) || 0)}%`,
                                            background: DARK_BLUE, borderRadius: 10,
                                            transition: 'width 0.6s ease',
                                        }} />
                                    </div>
                                </div>
                            ))}

                            {topProducts.length > 5 && (
                                <div className="text-center pt-3">
                                    <button
                                        onClick={() => setShowAllProducts(v => !v)}
                                        style={{ background: 'none', border: 'none', color: BLUE, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        {showAllProducts ? 'Show less ↑' : `View all ${topProducts.length} products ↓`}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Hidden PDF template */}
            {pdfProps && (
                <ReportPDFTemplate
                    {...pdfProps}
                    startDate={startDate}
                    endDate={endDate}
                    companyName={localStorage.getItem('active_company_name') || 'ProdFlow'}
                    username={(() => { try { return JSON.parse(localStorage.getItem('user')).user } catch { return 'User' } })()}
                />
            )}

        </Layout>
    )
}
