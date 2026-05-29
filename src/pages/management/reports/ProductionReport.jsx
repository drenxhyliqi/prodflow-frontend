import { useState, useEffect, useCallback, useMemo } from 'react'
import Layout from '../../../layouts/Layout'
import api from '../../../api/axios'
import { toast } from 'react-toastify'
import { exportToPDF } from '../../../utils/exportToPDF'
import { useReportAccess } from '../../../hooks/useReportAccess'
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { MdOutlineBarChart, MdOutlineFileDownload, MdOutlineSpeed } from 'react-icons/md'
import { LuClipboardList, LuClock, LuTrendingUp } from 'react-icons/lu'
import { BsGearFill } from 'react-icons/bs'
import ReportPDFTemplate from './ReportPDFTemplate'

/* ── Constants ──────────────────────────────────────────────── */
const BLUE       = '#2563EB'
const DARK_BLUE  = '#1E40AF'
const LIGHT_BLUE = '#93C5FD'
const ORANGE     = '#F59E0B'
const GREEN      = '#22C55E'
const RED        = '#EF4444'
const PURPLE     = '#7C3AED'
const TEAL       = '#0D9488'

const STATUS_COLORS = {
    'Completed':   '#22C55E',
    'In Progress': '#3B82F6',
    'Pending':     '#F59E0B',
    'Delayed':     '#EF4444',
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/* ── Helpers ────────────────────────────────────────────────── */
const fmt       = n  => n == null ? '—' : Number(n).toLocaleString('en-US')
const fmtPct    = n  => n == null ? '—' : `${Number(n).toFixed(1)}%`


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
function KpiCard({ icon, iconBg, iconColor, value, label, subtitle, badge, loading, extra }) {
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
                        <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{value}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 5 }}>{label}</div>
                        {subtitle && <div style={{ fontSize: '0.71rem', color: '#94a3b8', marginTop: 2 }}>{subtitle}</div>}
                        {extra}
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
            <MdOutlineBarChart size={32} />
            <span style={{ fontSize: '0.82rem' }}>No data available for this period</span>
        </div>
    )
}

/* ── Tooltip custom ─────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}>
            <p style={{ margin: '0 0 6px', fontWeight: 600, color: '#0f172a' }}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ margin: '2px 0', color: p.color }}>
                    {p.name}: <strong>{fmt(p.value)} units</strong>
                </p>
            ))}
        </div>
    )
}

/* ── Donut center label ─────────────────────────────────────── */
function DonutLabel({ viewBox, total }) {
    const { cx, cy } = viewBox
    return (
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
            <tspan x={cx} dy="-0.3em" style={{ fontSize: 22, fontWeight: 800, fill: '#0f172a' }}>{fmt(total)}</tspan>
            <tspan x={cx} dy="1.5em" style={{ fontSize: 11, fill: '#94a3b8' }}>plans</tspan>
        </text>
    )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function ProductionReport() {
    const { checking, denied, startDate, endDate, withRunId, runId } = useReportAccess('production')

    const [loading,    setLoading]    = useState(false)
    const [summary,    setSummary]    = useState(null)
    const [trends,     setTrends]     = useState(null)
    const [machines,   setMachines]   = useState([])
    const [topProducts,setTopProducts]= useState([])
    const [statusDist, setStatusDist] = useState(null)
    const [trendView,  setTrendView]  = useState('weekly')
    const [exporting,  setExporting]  = useState(false)

    /* ── Fetch all 5 endpoints ──────────────────────────────── */
    const loadReport = useCallback(async () => {
        if (!runId || !startDate || !endDate) return
        setLoading(true)
        try {
            const q = withRunId(`start_date=${startDate}&end_date=${endDate}`)
            const [sumR, trendR, machR, prodR, statR] = await Promise.all([
                api.get(`/admin/reports/production/summary?${q}`),
                api.get(`/admin/reports/production/trends?${q}`),
                api.get(`/admin/reports/production/machines?${q}`),
                api.get(`/admin/reports/production/top-products?${q}`),
                api.get(`/admin/reports/production/status-distribution?${q}`),
            ])
            setSummary(sumR.data)
            setTrends(trendR.data)
            setMachines(Array.isArray(machR.data) ? machR.data : [])
            setTopProducts(Array.isArray(prodR.data) ? prodR.data : [])
            setStatusDist(statR.data)
        } catch {
            toast.error('Failed to load report. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [runId, withRunId, startDate, endDate])

    useEffect(() => {
        if (!denied && !checking && runId && startDate && endDate) {
            loadReport()
        }
    }, [denied, checking, runId, startDate, endDate, loadReport])

    /* ── Derived data ───────────────────────────────────────── */
    const trendData = useMemo(() => {
        if (!trends) return []
        if (trendView === 'daily')   return (trends.daily   || []).map(d => ({ name: d.date,       units: d.units }))
        if (trendView === 'weekly')  return (trends.weekly  || []).map(d => ({ name: d.week,       units: d.units }))
        if (trendView === 'monthly') return (trends.monthly || []).map(d => ({ name: d.month,      units: d.units }))
        return []
    }, [trends, trendView])

    const targetValue = useMemo(() => {
        if (!summary?.avg_daily_output) return null
        const v = Number(summary.avg_daily_output)
        if (trendView === 'weekly')  return Math.round(v * 7)
        if (trendView === 'monthly') return Math.round(v * 30)
        return Math.round(v)
    }, [summary, trendView])

    const weeklyGrowth = useMemo(() => {
        const w = trends?.weekly || []
        if (w.length < 2) return null
        const first = Number(w[0].units) || 0
        const last  = Number(w[w.length - 1].units) || 0
        if (first === 0) return null
        return (((last - first) / first) * 100).toFixed(1)
    }, [trends])

    const comparisonData = useMemo(() => {
        const daily = trends?.daily || []
        if (!daily.length) return []
        const map = Object.fromEntries(WEEKDAYS.map(d => [d, []]))
        daily.forEach(entry => {
            try {
                const dn = new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })
                if (map[dn]) map[dn].push(Number(entry.units) || 0)
            } catch {}
        })
        const weeklyAvg  = summary?.avg_daily_output ? Math.round(Number(summary.avg_daily_output)) : 0
        const wList = trends?.weekly || []
        const mList = trends?.monthly || []
        const weeklyTotal  = wList.reduce((s, w) => s + Number(w.units), 0)
        const monthlyTotal = mList.reduce((s, m) => s + Number(m.units), 0)
        const weeklyPerDay  = wList.length  ? Math.round(weeklyTotal  / (wList.length * 7))  : weeklyAvg
        const monthlyPerDay = mList.length  ? Math.round(monthlyTotal / (mList.length * 30)) : weeklyAvg
        return WEEKDAYS.map(day => ({
            day,
            actual:  map[day].length ? Math.round(map[day].reduce((a, b) => a + b, 0) / map[day].length) : 0,
            weekly:  weeklyPerDay,
            monthly: monthlyPerDay,
        }))
    }, [trends, summary])

    const sortedMachines = useMemo(() =>
        [...machines].sort((a, b) => Number(b.efficiency) - Number(a.efficiency)).slice(0, 6),
    [machines])

    const effColor = (pct) => {
        const v = Number(pct)
        if (v >= 90) return DARK_BLUE
        if (v >= 75) return ORANGE
        return RED
    }

    /* ── PDF props for template ─────────────────────────────── */
    const pdfProps = useMemo(() => {
        if (!summary) return null
        const effVal  = Number(summary.production_efficiency) || 0
        const effOk   = effVal >= 92
        const effCol  = effOk  ? '#16a34a' : '#dc2626'
        const downCol = summary.downtime_incidents > 0 ? '#dc2626' : '#16a34a'
        const effColor = pct => pct >= 90 ? '#2563EB' : pct >= 75 ? '#d97706' : '#dc2626'
        const STATUS_PDF = { 'Completed': '#16a34a', 'In Progress': '#2563EB', 'Pending': '#d97706', 'Delayed': '#dc2626' }

        return {
            reportTitle: 'Production Report',
            kpis: [
                { accent: '#2563EB', bg: '#eff6ff',  value: fmt(summary.total_units_produced),    label: 'Total Units Produced',    sub: 'units' },
                { accent: effCol,   bg: effOk ? '#f0fdf4' : '#fef2f2', value: fmtPct(summary.production_efficiency), label: 'Production Efficiency', sub: 'Target: 92%', bar: true, barValue: effVal },
                { accent: '#7C3AED', bg: '#faf5ff',  value: fmt(summary.active_production_plans), label: 'Active Plans',            sub: `${summary.total_days_in_range || '—'} day range` },
                { accent: downCol,  bg: summary.downtime_incidents > 0 ? '#fef2f2' : '#f0fdf4', value: fmt(summary.downtime_incidents), label: 'Downtime Incidents', sub: 'maintenance events' },
                { accent: '#0D9488', bg: '#f0fdfa',  value: fmt(summary.avg_daily_output),        label: 'Avg Daily Output',        sub: 'units / day' },
            ],
            panels: [
                {
                    title: 'Production Output Trend', subtitle: 'Weekly output — selected period', type: 'bars',
                    data: (trends?.weekly || []).map(d => ({ label: String(d.week || '').replace(/^\d{4}-?W?/, 'W'), value: Number(d.units) || 0 })),
                },
                {
                    title: 'Status Distribution', subtitle: `Plans by status · ${(statusDist?.data || []).reduce((s, d) => s + Number(d.count), 0)} total`, type: 'progress-list',
                    data: (statusDist?.data || []).map(d => ({ label: d.status, value: `${d.percentage}% (${d.count})`, pct: Number(d.percentage) || 0, color: STATUS_PDF[d.status] || '#94a3b8' })),
                },
                {
                    title: 'Machine Performance', subtitle: 'Efficiency per machine', type: 'progress-list',
                    data: [...machines].sort((a, b) => Number(b.efficiency) - Number(a.efficiency)).slice(0, 6).map(m => ({ label: m.machine, value: `${Number(m.efficiency).toFixed(0)}%`, pct: Math.min(100, Number(m.efficiency) || 0), color: effColor(Number(m.efficiency) || 0) })),
                },
                {
                    title: 'Top Produced Products', subtitle: 'By output quantity', type: 'progress-list',
                    data: topProducts.slice(0, 5).map(p => ({ label: p.product_name, value: `${fmt(p.units)} units`, pct: Math.min(100, Number(p.percentage) || 0), color: '#1E40AF' })),
                },
            ],
            tableTitle: 'Production Records',
            tableColumns: [
                { label: '#',            align: 'center' },
                { label: 'Product Name', align: 'left'   },
                { label: 'Total Units',  align: 'right'  },
                { label: 'Unit',         align: 'right'  },
                { label: '% of Total',   align: 'right'  },
            ],
            tableRows:   topProducts.map((p, i) => [String(i + 1), p.product_name, fmt(p.units), p.unit || 'units', `${Number(p.percentage).toFixed(1)}%`]),
            tableTotals: ['—', 'TOTAL', fmt(summary.total_units_produced), '—', '100%'],
        }
    }, [summary, trends, machines, topProducts, statusDist])

    /* ── Handlers ───────────────────────────────────────────── */
    const handleExport = async () => {
        if (!summary || exporting) return
        setExporting(true)
        try {
            await exportToPDF('pdf-export-container', `production-report-${startDate}-${endDate}.pdf`)
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

            <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                <div>
                    <h4 className="fw-bold mb-0" style={{ color: '#0f172a' }}>Production Report</h4>
                    <small style={{ color: '#6b7280' }}>
                        {startDate && endDate ? `${startDate} — ${endDate}` : 'Operational analytics · Manufacturing'}
                    </small>
                </div>
                <button
                    type="button"
                    onClick={handleExport}
                    disabled={!summary || loading || exporting}
                    className="btn d-flex align-items-center gap-2 fw-semibold px-4"
                    style={{ background: 'white', border: '1px solid #e2e8f0', color: '#374151', borderRadius: 10, height: 42, whiteSpace: 'nowrap' }}
                >
                    {exporting
                        ? <><span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14 }} /> Exporting...</>
                        : <><MdOutlineFileDownload size={17} /> Export report</>
                    }
                </button>
            </div>

            {/* ── KPI Cards ───────────────────────────────────── */}
            <div className="row g-3 mb-4">
                <KpiCard
                    loading={loading}
                    icon={<MdOutlineBarChart size={20} />}
                    iconBg="#eff6ff" iconColor={BLUE}
                    value={fmt(summary?.total_units_produced)}
                    label="Total Units Produced"
                    subtitle="vs prev. period"
                    badge={<Badge label="↗ output" color="#16a34a" bg="#dcfce7" />}
                />
                <KpiCard
                    loading={loading}
                    icon={<MdOutlineSpeed size={20} />}
                    iconBg="#f0fdf4" iconColor="#10b981"
                    value={fmtPct(summary?.production_efficiency)}
                    label="Production Efficiency"
                    subtitle="target: 92%"
                    badge={(() => {
                        if (!summary) return null
                        const diff = (Number(summary.production_efficiency) - 92).toFixed(1)
                        const pos  = Number(diff) >= 0
                        return <Badge label={`${pos ? '↗' : '↙'} ${pos ? '+' : ''}${diff}%`} color={pos ? '#16a34a' : '#dc2626'} bg={pos ? '#dcfce7' : '#fee2e2'} />
                    })()}
                    extra={summary && (
                        <div style={{ marginTop: 8, height: 4, background: '#e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.min(100, Number(summary.production_efficiency) || 0)}%`, background: '#10b981', borderRadius: 10, transition: 'width 0.6s ease' }} />
                        </div>
                    )}
                />
                <KpiCard
                    loading={loading}
                    icon={<LuClipboardList size={18} />}
                    iconBg="#faf5ff" iconColor={PURPLE}
                    value={fmt(summary?.active_production_plans)}
                    label="Active Production Plans"
                    subtitle={summary ? `${summary.total_days_in_range} day range` : '—'}
                    badge={summary
                        ? <Badge label={`↗ +${summary.active_production_plans}`} color="#16a34a" bg="#dcfce7" />
                        : null}
                />
                <KpiCard
                    loading={loading}
                    icon={<LuClock size={18} />}
                    iconBg="#fff7ed" iconColor={ORANGE}
                    value={fmt(summary?.downtime_incidents)}
                    label="Downtime Incidents"
                    subtitle={summary ? `${summary.downtime_incidents} incidents` : '—'}
                    badge={summary
                        ? summary.downtime_incidents === 0
                            ? <Badge label="↗ none" color="#16a34a" bg="#dcfce7" />
                            : <Badge label={`↙ -${summary.downtime_incidents}`} color="#dc2626" bg="#fee2e2" />
                        : null}
                />
                <KpiCard
                    loading={loading}
                    icon={<LuTrendingUp size={18} />}
                    iconBg="#f0fdfa" iconColor={TEAL}
                    value={fmt(summary?.avg_daily_output)}
                    label="Avg Daily Output"
                    subtitle="units / day"
                    badge={<Badge label="↗ daily" color="#16a34a" bg="#dcfce7" />}
                />
            </div>

            {/* ── Row 1: Trend Chart + Status Donut ───────────── */}
            <div className="row g-3 mb-4">

                {/* ── Production Trend ── */}
                <div className="col-12 col-lg-8">
                    <div className="bg-white rounded-4 shadow-sm p-4 h-100">
                        <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
                            <div>
                                <h6 className="fw-bold mb-0">Production Output Trend</h6>
                                <small className="text-muted">Output vs target over selected range</small>
                            </div>
                            <div className="d-flex gap-1">
                                {['daily', 'weekly', 'monthly'].map(v => (
                                    <button
                                        key={v}
                                        onClick={() => setTrendView(v)}
                                        style={{
                                            padding: '4px 12px', borderRadius: 7, fontSize: '0.75rem', fontWeight: 600,
                                            border: '1px solid #e2e8f0', cursor: 'pointer',
                                            background: trendView === v ? DARK_BLUE : 'white',
                                            color: trendView === v ? 'white' : '#6b7280',
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        {v.charAt(0).toUpperCase() + v.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="d-flex gap-3 mb-3">
                            {[['Output', DARK_BLUE, false], ['Target', LIGHT_BLUE, true]].map(([l, c, dashed]) => (
                                <span key={l} className="d-flex align-items-center gap-1" style={{ fontSize: '0.74rem', color: '#374151' }}>
                                    <span style={{ width: 20, height: 2, background: c, display: 'inline-block', borderTop: dashed ? `2px dashed ${c}` : 'none' }} />
                                    {l}
                                </span>
                            ))}
                        </div>

                        {loading ? <ChartSkel h={220} /> : trendData.length === 0 ? <Empty h={220} /> : (
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="outputGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor={DARK_BLUE} stopOpacity={0.15} />
                                            <stop offset="95%" stopColor={DARK_BLUE} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                                        tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                                    <Tooltip content={<CustomTooltip />} />
                                    {targetValue && (
                                        <ReferenceLine y={targetValue} stroke={LIGHT_BLUE} strokeDasharray="5 3" strokeWidth={2}
                                            label={{ value: 'Target', fill: LIGHT_BLUE, fontSize: 10, position: 'right' }} />
                                    )}
                                    <Area type="monotone" dataKey="units" name="Output"
                                        stroke={DARK_BLUE} strokeWidth={2.5}
                                        fill="url(#outputGrad)" dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* ── Status Donut ── */}
                <div className="col-12 col-lg-4">
                    <div className="bg-white rounded-4 shadow-sm p-4 h-100 d-flex flex-column">
                        <h6 className="fw-bold mb-0">Production Status</h6>
                        <small className="text-muted mb-3">Distribution by status</small>

                        {loading ? <ChartSkel h={200} /> : !statusDist?.data?.length ? <Empty h={200} /> : (
                            <>
                                <div style={{ flex: 1 }}>
                                    <ResponsiveContainer width="100%" height={180}>
                                        <PieChart>
                                            <Pie
                                                data={statusDist.data}
                                                cx="50%" cy="50%"
                                                innerRadius={52} outerRadius={76}
                                                dataKey="count" nameKey="status"
                                                labelLine={false}
                                            >
                                                {statusDist.data.map((entry, i) => (
                                                    <Cell key={i} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                                                ))}
                                                <DonutLabel total={statusDist.total} viewBox={{ cx: 0, cy: 0 }} />
                                            </Pie>
                                            <Tooltip formatter={(v, n, p) => [`${p.payload.percentage}% (${v})`, p.payload.status]}
                                                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {statusDist.data.map((item, i) => (
                                        <div key={i} className="d-flex justify-content-between align-items-center">
                                            <span className="d-flex align-items-center gap-2" style={{ fontSize: '0.78rem', color: '#374151' }}>
                                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[item.status] || '#94a3b8', display: 'inline-block', flexShrink: 0 }} />
                                                {item.status}
                                            </span>
                                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151' }}>{item.percentage}%</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Row 2: Comparison Bar + Machine Performance ───── */}
            <div className="row g-3 mb-4">

                {/* ── Comparison Bar Chart ── */}
                <div className="col-12 col-lg-8">
                    <div className="bg-white rounded-4 shadow-sm p-4 h-100">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                            <div>
                                <h6 className="fw-bold mb-0">Daily / Weekly / Monthly Comparison</h6>
                                <small className="text-muted">Average output across time scales</small>
                            </div>
                            {weeklyGrowth != null && (
                                <Badge
                                    label={`${Number(weeklyGrowth) >= 0 ? '↑' : '↓'} ${Math.abs(weeklyGrowth)}%`}
                                    color={Number(weeklyGrowth) >= 0 ? GREEN : RED}
                                    bg={Number(weeklyGrowth) >= 0 ? '#d1fae5' : '#fee2e2'}
                                />
                            )}
                        </div>

                        {/* Legend */}
                        <div className="d-flex gap-3 mb-3 mt-2">
                            {[['Actual', DARK_BLUE], ['Weekly Avg', ORANGE], ['Monthly Avg', LIGHT_BLUE]].map(([l, c]) => (
                                <span key={l} className="d-flex align-items-center gap-1" style={{ fontSize: '0.74rem', color: '#374151' }}>
                                    <span style={{ width: 10, height: 10, borderRadius: 3, background: c, display: 'inline-block' }} />
                                    {l}
                                </span>
                            ))}
                        </div>

                        {loading ? <ChartSkel h={220} /> : !comparisonData.length ? <Empty h={220} /> : (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={comparisonData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="20%" barGap={3}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                                        tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="actual"  name="Actual"       fill={DARK_BLUE}  radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="weekly"  name="Weekly Avg"   fill={ORANGE}     radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="monthly" name="Monthly Avg"  fill={LIGHT_BLUE} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* ── Machine Performance ── */}
                <div className="col-12 col-lg-4">
                    <div className="bg-white rounded-4 shadow-sm p-4 h-100 d-flex flex-column">
                        <h6 className="fw-bold mb-0">Machine Performance</h6>
                        <small className="text-muted mb-3">Efficiency % per machine</small>

                        {loading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {[0,1,2,3,4,5].map(i => (
                                    <div key={i}>
                                        <div className="d-flex justify-content-between mb-1">
                                            <Skel w="45%" h={13} />
                                            <Skel w="15%" h={13} />
                                        </div>
                                        <Skel w="100%" h={6} r={10} />
                                    </div>
                                ))}
                            </div>
                        ) : !sortedMachines.length ? <Empty h={200} /> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
                                {sortedMachines.map((m, i) => {
                                    const pct = Math.min(100, Number(m.efficiency) || 0)
                                    const col = effColor(pct)
                                    return (
                                        <div key={i}>
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>{m.machine}</span>
                                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: col }}>{pct.toFixed(0)}%</span>
                                            </div>
                                            <div style={{ height: 6, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
                                                <div style={{
                                                    height: '100%', width: `${pct}%`, background: col, borderRadius: 10,
                                                    transition: 'width 0.6s ease',
                                                }} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Top Produced Products ───────────────────────── */}
            <div className="bg-white rounded-4 shadow-sm p-4 mb-2">
                <div className="d-flex justify-content-between align-items-center mb-1">
                    <div>
                        <h6 className="fw-bold mb-0">Top Produced Products</h6>
                        <small className="text-muted">Highest output during selected range</small>
                    </div>
                </div>

                <div className="mt-3">
                    {loading ? (
                        [0,1,2,3,4].map(i => (
                            <div key={i} className="py-3" style={{ borderBottom: i < 4 ? '1px solid #f8fafc' : 'none' }}>
                                <div className="d-flex align-items-center gap-3 mb-2">
                                    <Skel w={36} h={36} r={8} />
                                    <div style={{ flex: 1 }}>
                                        <Skel w="40%" h={13} mb={5} />
                                        <Skel w="20%" h={11} />
                                    </div>
                                    <Skel w="6%" h={13} />
                                </div>
                                <Skel w="100%" h={6} r={10} />
                            </div>
                        ))
                    ) : !topProducts.length ? (
                        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>
                            <BsGearFill size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                            <div style={{ fontSize: '0.82rem' }}>No products data for this period</div>
                        </div>
                    ) : (
                        topProducts.slice(0, 5).map((p, i, arr) => (
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
                                            {fmt(p.units)} units produced
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                                            {Number(p.percentage).toFixed(0)}%
                                        </div>
                                        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>of total output</div>
                                    </div>
                                </div>
                                <div style={{ height: 6, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', width: `${Math.min(100, Number(p.percentage) || 0)}%`,
                                        background: DARK_BLUE, borderRadius: 10,
                                        transition: 'width 0.6s ease',
                                    }} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Hidden PDF template — captured by html2canvas on export */}
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
