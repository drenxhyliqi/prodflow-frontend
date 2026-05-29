import { useState, useEffect, useCallback, useMemo } from 'react'
import Layout from '../../../layouts/Layout'
import api from '../../../api/axios'
import { toast } from 'react-toastify'
import { exportToPDF } from '../../../utils/exportToPDF'
import { useReportAccess } from '../../../hooks/useReportAccess'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { MdOutlineBarChart, MdOutlineFileDownload, MdOutlineInventory2 } from 'react-icons/md'
import { LuArrowDownToLine, LuArrowUpFromLine, LuScale } from 'react-icons/lu'
import ReportPDFTemplate from './ReportPDFTemplate'

const BLUE = '#2563EB'
const DARK_BLUE = '#1E40AF'
const GREEN = '#22C55E'
const RED = '#EF4444'
const LIGHT_BLUE = '#93C5FD'

const todayStr = () => new Date().toISOString().slice(0, 10)
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10)
const fmtQty = (n) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

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
                        <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{value}</div>
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

function StockTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}>
            <p style={{ margin: '0 0 6px', fontWeight: 600, color: '#0f172a' }}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ margin: '2px 0', color: p.color }}>
                    {p.name}: <strong>{fmtQty(p.value)}</strong>
                </p>
            ))}
        </div>
    )
}

export default function MaterialsStockReport() {
    const { checking, denied, startDate: accessStart, endDate: accessEnd, withRunId, runId } =
        useReportAccess('materials_stock')

    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [reportData, setReportData] = useState([])
    const [loading, setLoading] = useState(false)
    const [exporting, setExporting] = useState(false)

    const generate = useCallback(async (sd, ed) => {
        if (!runId) return
        if (sd > ed) {
            toast.error('End date must be after start date.')
            return
        }
        setLoading(true)
        try {
            const response = await api.get(
                `/admin/materials_stock_report?${withRunId(`start_date=${sd}&end_date=${ed}`)}`
            )
            const data = response.data?.data || response.data
            const list = Array.isArray(data) ? data : []
            setReportData(list)
            if (!list.length) toast.info('No stock movements found for selected dates.')
        } catch {
            toast.error('Failed to load stock report.')
            setReportData([])
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

    const totals = useMemo(() => {
        let totalIn = 0
        let totalOut = 0
        reportData.forEach((item) => {
            if (item?.type === 'IN') totalIn += parseFloat(item.qty || 0)
            if (item?.type === 'OUT') totalOut += parseFloat(item.qty || 0)
        })
        return { totalIn, totalOut, balance: totalIn - totalOut }
    }, [reportData])

    const chartData = useMemo(() => {
        const groups = {}
        reportData.forEach((item) => {
            if (!item) return
            const name = item.material_name || item.material || (item.material_id ? `ID: ${item.material_id}` : 'N/A')
            if (!groups[name]) groups[name] = { name, IN: 0, OUT: 0 }
            if (item.type === 'IN' || item.type === 'OUT') {
                groups[name][item.type] += parseFloat(item.qty || 0)
            }
        })
        return Object.values(groups)
    }, [reportData])

    const topMaterials = useMemo(() => {
        return [...chartData]
            .sort((a, b) => (b.IN + b.OUT) - (a.IN + a.OUT))
            .slice(0, 6)
    }, [chartData])

    const inOutPie = useMemo(() => [
        { name: 'IN', value: totals.totalIn, color: GREEN },
        { name: 'OUT', value: totals.totalOut, color: RED },
    ], [totals])

    const pdfProps = useMemo(() => {
        if (!reportData.length) return null

        const pdfChartData = []
        chartData.forEach((c) => {
            if (c.IN > 0) pdfChartData.push({ label: `${c.name} (IN)`, value: c.IN })
            if (c.OUT > 0) pdfChartData.push({ label: `${c.name} (OUT)`, value: c.OUT })
        })

        return {
            reportTitle: 'Materials Stock Report',
            kpis: [
                { accent: GREEN, bg: '#ecfdf5', value: `${fmtQty(totals.totalIn)}`, label: 'Total Stock IN', sub: 'entries' },
                { accent: RED, bg: '#fef2f2', value: `${fmtQty(totals.totalOut)}`, label: 'Total Stock OUT', sub: 'exits' },
                { accent: BLUE, bg: '#eff6ff', value: `${fmtQty(totals.balance)}`, label: 'Net Balance', sub: 'in stock' },
            ],
            panels: [{
                title: 'Stock Movements by Material',
                subtitle: 'Quantities entered (IN) and exited (OUT)',
                type: 'bars',
                data: pdfChartData,
            }],
            tableTitle: 'Material Stock Ledger',
            tableColumns: [
                { label: 'ID', align: 'center' },
                { label: 'Date', align: 'left' },
                { label: 'Material', align: 'left' },
                { label: 'Type', align: 'center' },
                { label: 'Quantity', align: 'right' },
            ],
            tableRows: reportData.map((e) => [
                String(e?.msid || ''),
                formatDate(e?.date),
                e?.material_name || e?.material || (e?.material_id ? `ID: ${e.material_id}` : '—'),
                e?.type || '',
                fmtQty(e?.qty),
            ]),
            tableTotals: ['—', 'TOTALS', '—', `IN: ${fmtQty(totals.totalIn)}`, `OUT: ${fmtQty(totals.totalOut)}`],
        }
    }, [reportData, totals, chartData])

    const handleGenerate = (e) => {
        e.preventDefault()
        generate(startDate, endDate)
    }

    const handleExport = async () => {
        if (!pdfProps || exporting) return
        setExporting(true)
        try {
            await exportToPDF('pdf-export-container', `materials-stock-report-${startDate}-${endDate}.pdf`)
            toast.success('Report exported successfully')
        } catch {
            toast.error('Failed to export report.')
        } finally {
            setExporting(false)
        }
    }

    const maxMaterial = topMaterials.length
        ? Math.max(...topMaterials.map((m) => m.IN + m.OUT))
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
            <div className="mb-4">
                <h4 className="fw-bold mb-0" style={{ color: '#0f172a' }}>Materials Stock Report</h4>
                <small style={{ color: '#6b7280' }}>Inventory analytics · Stock movements</small>
            </div>

            <div className="bg-white rounded-4 shadow-sm p-3 p-md-4 mb-4">
                <form onSubmit={handleGenerate}>
                    <div className="d-flex flex-wrap align-items-end gap-3">
                        <div style={{ flex: '1 1 180px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>Start date</label>
                            <input type="date" className="form-control shadow-none" style={{ fontSize: '0.875rem', borderRadius: 10, border: '1px solid #e2e8f0', height: 42 }} value={startDate} max={endDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div style={{ flex: '1 1 180px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>End date</label>
                            <input type="date" className="form-control shadow-none" style={{ fontSize: '0.875rem', borderRadius: 10, border: '1px solid #e2e8f0', height: 42 }} value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                        <div className="d-flex gap-2 align-items-center" style={{ marginTop: 'auto' }}>
                            <button type="submit" disabled={loading} className="btn d-flex align-items-center gap-2 fw-semibold px-4" style={{ background: BLUE, color: 'white', border: 'none', borderRadius: 10, height: 42, whiteSpace: 'nowrap' }}>
                                {loading ? <><span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14 }} /> Generating...</> : 'Generate report'}
                            </button>
                            <button type="button" onClick={handleExport} disabled={!reportData.length || loading || exporting} className="btn d-flex align-items-center gap-2 fw-semibold px-4" style={{ background: 'white', border: '1px solid #e2e8f0', color: '#374151', borderRadius: 10, height: 42, whiteSpace: 'nowrap' }}>
                                {exporting ? <><span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14 }} /> Generating...</> : <><MdOutlineFileDownload size={17} /> Export report</>}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div className="row g-3 mb-4">
                <KpiCard loading={loading} icon={<LuArrowDownToLine size={18} />} iconBg="#ecfdf5" iconColor={GREEN} value={fmtQty(totals.totalIn)} label="Total Stock IN" subtitle="entries in period" badge={<Badge label="↗ in" color="#16a34a" bg="#dcfce7" />} />
                <KpiCard loading={loading} icon={<LuArrowUpFromLine size={18} />} iconBg="#fef2f2" iconColor={RED} value={fmtQty(totals.totalOut)} label="Total Stock OUT" subtitle="exits in period" badge={<Badge label="↘ out" color="#dc2626" bg="#fee2e2" />} />
                <KpiCard loading={loading} icon={<LuScale size={18} />} iconBg="#eff6ff" iconColor={BLUE} value={fmtQty(totals.balance)} label="Net Balance" subtitle="IN minus OUT" />
                <KpiCard loading={loading} icon={<MdOutlineInventory2 size={20} />} iconBg="#faf5ff" iconColor={DARK_BLUE} value={String(reportData.length)} label="Movements" subtitle="total records" />
            </div>

            <div className="row g-3 mb-4">
                <div className="col-12 col-lg-8">
                    <div className="bg-white rounded-4 shadow-sm p-4 h-100">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h6 className="fw-bold mb-0">Stock Volume by Material</h6>
                                <small className="text-muted">IN vs OUT quantities per material</small>
                            </div>
                        </div>
                        <div className="d-flex gap-3 mb-3">
                            {[['Stock IN', GREEN], ['Stock OUT', RED]].map(([l, c]) => (
                                <span key={l} className="d-flex align-items-center gap-1" style={{ fontSize: '0.74rem', color: '#374151' }}>
                                    <span style={{ width: 10, height: 10, borderRadius: 3, background: c, display: 'inline-block' }} />
                                    {l}
                                </span>
                            ))}
                        </div>
                        {loading ? <ChartSkel h={220} /> : chartData.length === 0 ? <Empty h={220} /> : (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="20%" barGap={3}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<StockTooltip />} />
                                    <Bar dataKey="IN" name="Stock IN" fill={GREEN} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="OUT" name="Stock OUT" fill={RED} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="col-12 col-lg-4">
                    <div className="bg-white rounded-4 shadow-sm p-4 h-100 d-flex flex-column">
                        <h6 className="fw-bold mb-0">IN vs OUT</h6>
                        <small className="text-muted mb-3">Overall movement split</small>
                        {loading ? <ChartSkel h={180} /> : !reportData.length ? <Empty h={200} /> : (
                            <>
                                <div style={{ flex: 1 }}>
                                    <ResponsiveContainer width="100%" height={160}>
                                        <PieChart>
                                            <Pie data={inOutPie} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value" nameKey="name" labelLine={false}>
                                                {inOutPie.map((entry, i) => (
                                                    <Cell key={i} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(v, n) => [fmtQty(v), n]} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {inOutPie.map((item, i) => (
                                        <div key={i} className="d-flex justify-content-between align-items-center">
                                            <span className="d-flex align-items-center gap-2" style={{ fontSize: '0.78rem', color: '#374151' }}>
                                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                                                {item.name}
                                            </span>
                                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151' }}>{fmtQty(item.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h6 className="fw-bold mb-0">Top Materials by Volume</h6>
                        <small className="text-muted">Highest combined IN + OUT</small>
                    </div>
                </div>
                {loading ? (
                    [0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="py-2">
                            <div className="d-flex justify-content-between mb-1"><Skel w="40%" h={13} /><Skel w="15%" h={13} /></div>
                            <Skel w="100%" h={6} r={10} />
                        </div>
                    ))
                ) : !topMaterials.length ? (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '24px 0', fontSize: '0.82rem' }}>No materials data for this period</div>
                ) : (
                    topMaterials.map((m, i, arr) => {
                        const total = m.IN + m.OUT
                        const pct = Math.min(100, Math.round((total / maxMaterial) * 100))
                        return (
                            <div key={i} className="py-3" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                                <div className="d-flex align-items-center gap-3 mb-2">
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{m.name}</div>
                                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>IN: {fmtQty(m.IN)} · OUT: {fmtQty(m.OUT)}</div>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{fmtQty(total)}</div>
                                        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>total qty</div>
                                    </div>
                                </div>
                                <div style={{ height: 6, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${pct}%`, background: DARK_BLUE, borderRadius: 10, transition: 'width 0.6s ease' }} />
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            <div className="bg-white rounded-4 shadow-sm p-4 mb-2">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h6 className="fw-bold mb-0">Material Stock Ledger</h6>
                        <small className="text-muted">{reportData.length} movements · balance {fmtQty(totals.balance)}</small>
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
                                    <th className="text-nowrap fw-semibold">Material</th>
                                    <th className="text-center text-nowrap fw-semibold">Type</th>
                                    <th className="text-end text-nowrap fw-semibold">Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center text-muted py-4">No data to show...</td></tr>
                                ) : (
                                    reportData.map((e, i) => (
                                        <tr key={i}>
                                            <td className="text-nowrap text-muted small">#{e?.msid}</td>
                                            <td className="text-nowrap">{formatDate(e?.date)}</td>
                                            <td className="text-nowrap fw-semibold">
                                                {e?.material_name || e?.material || (e?.material_id ? `ID: ${e.material_id}` : '—')}
                                            </td>
                                            <td className="text-center text-nowrap">
                                                <span style={{
                                                    fontSize: '0.72rem', fontWeight: 700, borderRadius: 20, padding: '3px 10px',
                                                    color: e?.type === 'IN' ? GREEN : RED,
                                                    background: e?.type === 'IN' ? '#dcfce7' : '#fee2e2',
                                                }}>
                                                    {e?.type}
                                                </span>
                                            </td>
                                            <td className="text-end text-nowrap fw-semibold">{fmtQty(e?.qty)}</td>
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
