import { useState, useEffect, useCallback, useMemo } from 'react'
import Layout from '../../../layouts/Layout'
import api from '../../../api/axios'
import { toast } from 'react-toastify'
import { exportToPDF } from '../../../utils/exportToPDF'
import { useReportAccess } from '../../../hooks/useReportAccess'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { MdOutlineBarChart, MdOutlineFileDownload, MdOutlineReceipt } from 'react-icons/md'
import { LuTrendingDown, LuDollarSign } from 'react-icons/lu'
import { RiWallet3Line } from 'react-icons/ri'
import ReportPDFTemplate from './ReportPDFTemplate'

const BLUE = '#2563EB'
const DARK_BLUE = '#1E40AF'
const RED = '#EF4444'
const ORANGE = '#F59E0B'
const GREEN = '#22C55E'

const fmtMoney = (n) =>
    Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function Skel({ w = '100%', h = 16, r = 6, mb = 0 }) {
    return (
        <div className="placeholder-glow" style={{ marginBottom: mb }}>
            <span className="placeholder" style={{ display: 'block', width: w, height: h, borderRadius: r }} />
        </div>
    )
}

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

function KpiCard({ icon, iconBg, iconColor, value, label, subtitle, badge, loading }) {
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
                        <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 5 }}>{label}</div>
                        {subtitle && <div style={{ fontSize: '0.71rem', color: '#94a3b8', marginTop: 2 }}>{subtitle}</div>}
                    </>
                )}
            </div>
        </div>
    )
}

function ChartSkel({ h = 240 }) {
    return (
        <div className="placeholder-glow">
            <span className="placeholder" style={{ display: 'block', width: '100%', height: h, borderRadius: 8 }} />
        </div>
    )
}

function Empty({ h = 200 }) {
    return (
        <div style={{ height: h, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: 8 }}>
            <MdOutlineBarChart size={32} />
            <span style={{ fontSize: '0.82rem' }}>No data available for this period</span>
        </div>
    )
}

const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-GB')
}

function ExpenseTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}>
            <p style={{ margin: '0 0 6px', fontWeight: 600, color: '#0f172a' }}>{label}</p>
            <p style={{ margin: 0, color: DARK_BLUE }}>
                Amount: <strong>{fmtMoney(payload[0]?.value)} €</strong>
            </p>
        </div>
    )
}

export default function ExpensesReport() {
    const { checking, denied, startDate, endDate, withRunId, runId } = useReportAccess('expenses')

    const [reportData, setReportData] = useState([])
    const [loading, setLoading] = useState(false)
    const [exporting, setExporting] = useState(false)

    const loadReport = useCallback(async () => {
        if (!runId || !startDate || !endDate) return
        setLoading(true)
        try {
            const response = await api.get(`/admin/expenses_report?${withRunId(`start_date=${startDate}&end_date=${endDate}`)}`)
            const data = response.data.data || response.data
            const list = Array.isArray(data) ? data : []
            setReportData(list)
            if (!list.length) toast.info('No expenses found for selected dates.')
        } catch {
            toast.error('Failed to load report.')
            setReportData([])
        } finally {
            setLoading(false)
        }
    }, [runId, withRunId, startDate, endDate])

    useEffect(() => {
        if (!denied && !checking && runId && startDate && endDate) {
            loadReport()
        }
    }, [denied, checking, runId, startDate, endDate, loadReport])

    const totalAmount = useMemo(
        () => reportData.reduce((sum, item) => sum + parseFloat(item.price || 0), 0),
        [reportData]
    )

    const avgAmount = useMemo(
        () => (reportData.length ? totalAmount / reportData.length : 0),
        [reportData, totalAmount]
    )

    const highestExpense = useMemo(() => {
        if (!reportData.length) return 0
        return Math.max(...reportData.map((e) => parseFloat(e.price || 0)))
    }, [reportData])

    const chartData = useMemo(
        () => reportData.map((item) => ({
            label: formatDate(item.date),
            value: parseFloat(item.price || 0),
        })),
        [reportData]
    )

    const topExpenses = useMemo(() => {
        return [...reportData]
            .sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0))
            .slice(0, 6)
    }, [reportData])

    const pdfProps = useMemo(() => {
        if (!reportData.length) return null
        return {
            reportTitle: 'Expenses Report',
            kpis: [
                { accent: RED, bg: '#fef2f2', value: `${fmtMoney(totalAmount)} €`, label: 'Total Expenses', sub: 'selected period' },
                { accent: BLUE, bg: '#eff6ff', value: String(reportData.length), label: 'Expense Records', sub: 'entries' },
                { accent: ORANGE, bg: '#fffbeb', value: `${fmtMoney(avgAmount)} €`, label: 'Avg per Record', sub: 'average amount' },
            ],
            panels: [{
                title: 'Expenses by Date',
                subtitle: 'Amount per expense entry',
                type: 'bars',
                data: chartData.map((d) => ({ label: d.label, value: d.value })),
            }],
            tableTitle: 'Expense Records',
            tableColumns: [
                { label: 'ID', align: 'center' },
                { label: 'Date', align: 'left' },
                { label: 'Comment', align: 'left' },
                { label: 'Price', align: 'right' },
            ],
            tableRows: reportData.map((e) => [
                String(e.id || e.eid),
                formatDate(e.date),
                e.comment || e.description || '—',
                `${fmtMoney(e.price || 0)} €`,
            ]),
            tableTotals: ['—', 'TOTAL', '—', `${fmtMoney(totalAmount)} €`],
        }
    }, [reportData, totalAmount, avgAmount, chartData])

    const handleExport = async () => {
        if (!pdfProps || exporting) return
        setExporting(true)
        try {
            await exportToPDF('pdf-export-container', `expenses-report-${startDate}-${endDate}.pdf`)
            toast.success('Report exported successfully')
        } catch {
            toast.error('Failed to export report. Please try again.')
        } finally {
            setExporting(false)
        }
    }

    const maxTop = topExpenses.length
        ? Math.max(...topExpenses.map((e) => parseFloat(e.price || 0)))
        : 1

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
                    <h4 className="fw-bold mb-0" style={{ color: '#0f172a' }}>Expenses Report</h4>
                    <small style={{ color: '#6b7280' }}>
                        {startDate && endDate ? `${startDate} — ${endDate}` : 'Financial analytics · Expenses'}
                    </small>
                </div>
                <button
                    type="button"
                    onClick={handleExport}
                    disabled={!reportData.length || loading || exporting}
                    className="btn d-flex align-items-center gap-2 fw-semibold px-4"
                    style={{ background: 'white', border: '1px solid #e2e8f0', color: '#374151', borderRadius: 10, height: 42, whiteSpace: 'nowrap' }}
                >
                    {exporting
                        ? <><span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14 }} /> Exporting...</>
                        : <><MdOutlineFileDownload size={17} /> Export report</>
                    }
                </button>
            </div>

            <div className="row g-3 mb-4">
                <KpiCard loading={loading} icon={<LuDollarSign size={20} />} iconBg="#fef2f2" iconColor={RED} value={`${fmtMoney(totalAmount)} €`} label="Total Expenses" subtitle="selected period" badge={<Badge label="↘ spend" color="#dc2626" bg="#fee2e2" />} />
                <KpiCard loading={loading} icon={<MdOutlineReceipt size={20} />} iconBg="#eff6ff" iconColor={BLUE} value={String(reportData.length)} label="Expense Records" subtitle="entries in range" badge={<Badge label="↗ count" color="#16a34a" bg="#dcfce7" />} />
                <KpiCard loading={loading} icon={<RiWallet3Line size={18} />} iconBg="#fffbeb" iconColor={ORANGE} value={`${fmtMoney(avgAmount)} €`} label="Avg per Record" subtitle="average amount" />
                <KpiCard loading={loading} icon={<LuTrendingDown size={18} />} iconBg="#f0fdf4" iconColor={GREEN} value={`${fmtMoney(highestExpense)} €`} label="Highest Expense" subtitle="single record peak" />
            </div>

            <div className="row g-3 mb-4">
                <div className="col-12 col-lg-8">
                    <div className="bg-white rounded-4 shadow-sm p-4 h-100">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h6 className="fw-bold mb-0">Expenses by Date</h6>
                                <small className="text-muted">Amount per expense entry</small>
                            </div>
                        </div>
                        {loading ? <ChartSkel h={220} /> : chartData.length === 0 ? <Empty h={220} /> : (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<ExpenseTooltip />} />
                                    <Bar dataKey="value" name="Amount" fill={DARK_BLUE} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="col-12 col-lg-4">
                    <div className="bg-white rounded-4 shadow-sm p-4 h-100 d-flex flex-column">
                        <h6 className="fw-bold mb-0">Top Expenses</h6>
                        <small className="text-muted mb-3">Highest amounts in period</small>
                        {loading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <div key={i}>
                                        <div className="d-flex justify-content-between mb-1"><Skel w="45%" h={13} /><Skel w="15%" h={13} /></div>
                                        <Skel w="100%" h={6} r={10} />
                                    </div>
                                ))}
                            </div>
                        ) : !topExpenses.length ? <Empty h={200} /> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
                                {topExpenses.map((e, i) => {
                                    const amt = parseFloat(e.price || 0)
                                    const pct = Math.min(100, Math.round((amt / maxTop) * 100))
                                    return (
                                        <div key={i}>
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                                                    {e.comment || e.description || `Expense #${e.id || e.eid}`}
                                                </span>
                                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: DARK_BLUE }}>{fmtMoney(amt)} €</span>
                                            </div>
                                            <div style={{ height: 6, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${pct}%`, background: DARK_BLUE, borderRadius: 10, transition: 'width 0.6s ease' }} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-4 shadow-sm p-4 mb-2">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h6 className="fw-bold mb-0">Expense Records</h6>
                        <small className="text-muted">{reportData.length} entries · {fmtMoney(totalAmount)} € total</small>
                    </div>
                </div>
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[0, 1, 2, 3, 4].map((i) => <Skel key={i} h={36} r={8} />)}
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead>
                                <tr className="text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.06em', color: '#6b7280' }}>
                                    <th className="text-nowrap fw-semibold">#</th>
                                    <th className="text-nowrap fw-semibold">Date</th>
                                    <th className="text-nowrap fw-semibold">Comment</th>
                                    <th className="text-end text-nowrap fw-semibold">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.length === 0 ? (
                                    <tr><td colSpan="4" className="text-center text-muted py-4">No data to show...</td></tr>
                                ) : (
                                    reportData.map((e, i) => (
                                        <tr key={i}>
                                            <td className="text-nowrap text-muted small">#{e.id || e.eid}</td>
                                            <td className="text-nowrap">{formatDate(e.date)}</td>
                                            <td className="text-nowrap fw-semibold">{e.comment || e.description || '—'}</td>
                                            <td className="text-end text-nowrap fw-semibold">{fmtMoney(e.price || 0)} €</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

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
