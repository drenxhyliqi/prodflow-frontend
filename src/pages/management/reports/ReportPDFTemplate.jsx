/**
 * ReportPDFTemplate — shared off-screen PDF layout for all reports.
 *
 * Props:
 *   id            string          DOM id for html2canvas (default: 'pdf-export-container')
 *   reportTitle   string          e.g. "Production Report"
 *   startDate     string          YYYY-MM-DD
 *   endDate       string          YYYY-MM-DD
 *   companyName   string
 *   username      string
 *
 *   kpis          KpiCard[]       each: { accent, bg, value, label, sub, bar?, barValue? }
 *
 *   panels        Panel[]         flat list, rendered 2-per-row
 *     each: { title, subtitle, type: 'bars'|'progress-list', data, flex? }
 *       'bars'          data: { label:string, value:number }[]
 *       'progress-list' data: { label:string, value:string, pct:number, color?:string }[]
 *
 *   tableTitle    string
 *   tableColumns  ColDef[]        each: { label:string, align?:'left'|'right'|'center' }
 *   tableRows     string[][]
 *   tableTotals   string[]|null   one cell per column, null = no totals row
 */

const BLUE      = '#2563EB'
const DARK_BLUE = '#1E40AF'
const LIGHT     = '#EFF6FF'

const pad = n => String(n).padStart(2, '0')
function nowLabel() {
    const d = new Date()
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}  ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/* ── Bar chart (CSS, no SVG) ─────────────────────────────────── */
function TrendBars({ data }) {
    if (!data?.length) {
        return (
            <div style={{ height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 10 }}>
                No data available
            </div>
        )
    }
    const values = data.map(d => Number(d.value) || 0)
    const maxVal = Math.max(...values, 1)
    const show   = data.slice(-12)
    const vals   = values.slice(-12)

    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 100, paddingTop: 16 }}>
            {show.map((d, i) => {
                const barH = Math.max(3, Math.round((vals[i] / maxVal) * 72))
                return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 8, fontWeight: 700, color: '#374151', marginBottom: 2, lineHeight: 1, whiteSpace: 'nowrap' }}>
                            {vals[i] >= 1000 ? `${(vals[i] / 1000).toFixed(1)}k` : vals[i]}
                        </div>
                        <div style={{ width: '80%', maxWidth: 22, height: barH, background: BLUE, borderRadius: '2px 2px 0 0' }} />
                        <div style={{ height: 1, width: '100%', background: '#E5E7EB' }} />
                        <div style={{ fontSize: 7.5, color: '#94a3b8', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '100%', textAlign: 'center' }}>
                            {d.label}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

/* ── Progress list (labeled bars) ────────────────────────────── */
function ProgressList({ data }) {
    if (!data?.length) return <div style={{ color: '#94a3b8', fontSize: 10 }}>No data</div>
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {data.map((item, i) => {
                const col = item.color || BLUE
                const pct = Math.min(100, Number(item.pct) || 0)
                return (
                    <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <div style={{ width: 7, height: 7, borderRadius: 2, background: col, flexShrink: 0 }} />
                                <span style={{ fontSize: 10, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>
                                    {item.label}
                                </span>
                            </div>
                            <span style={{ fontSize: 10, color: '#374151', fontWeight: 600, flexShrink: 0, marginLeft: 6 }}>
                                {item.value}
                            </span>
                        </div>
                        <div style={{ height: 5, background: '#F1F5F9', borderRadius: 6, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: 6 }} />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

/* ── Single analytics panel ──────────────────────────────────── */
function Panel({ title, subtitle, type, data, flex }) {
    return (
        <div style={{ flex, border: '1px solid #E5E7EB', borderRadius: 8, padding: '12px 14px', minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', marginBottom: 1 }}>{title}</div>
            <div style={{ fontSize: 9.5, color: '#94a3b8', marginBottom: 8 }}>{subtitle}</div>
            {type === 'bars'
                ? <TrendBars data={data} />
                : <ProgressList data={data} />
            }
        </div>
    )
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE COMPONENT
══════════════════════════════════════════════════════════════ */
export default function ReportPDFTemplate({
    id = 'pdf-export-container',
    reportTitle = 'Report',
    startDate, endDate,
    companyName, username,
    kpis = [],
    panels = [],
    tableTitle = 'Records',
    tableColumns = [],
    tableRows = [],
    tableTotals = null,
}) {
    const ts = nowLabel()

    /* group panels into rows of 2 */
    const panelRows = []
    for (let i = 0; i < panels.length; i += 2) panelRows.push(panels.slice(i, i + 2))

    return (
        <div
            id={id}
            style={{
                position: 'absolute', left: -9999, top: 0,
                width: 794, background: 'white',
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
            }}
        >

            {/* ── HEADER ───────────────────────────────────────── */}
            <div style={{
                background: `linear-gradient(135deg, ${DARK_BLUE} 0%, ${BLUE} 100%)`,
                padding: '28px 36px 24px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            }}>
                <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.3px', lineHeight: 1 }}>
                        ProdFlow
                    </div>
                    <div style={{ fontSize: 11, color: '#93C5FD', marginTop: 4, letterSpacing: '0.02em' }}>
                        Enterprise Resource Planning
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'white', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {reportTitle}
                    </div>
                    <div style={{ fontSize: 11, color: '#BFDBFE', marginTop: 5 }}>
                        Period: {startDate}  →  {endDate}
                    </div>
                    <div style={{ fontSize: 10, color: '#93C5FD', marginTop: 3 }}>
                        Generated: {ts}  ·  By: {username}
                    </div>
                </div>
            </div>
            <div style={{ height: 3, background: 'linear-gradient(90deg, #F59E0B, #FBBF24)' }} />

            {/* ── META ROW ─────────────────────────────────────── */}
            <div style={{
                background: '#F8FAFC', borderBottom: '1px solid #E5E7EB',
                padding: '8px 36px', display: 'flex',
            }}>
                {[
                    ['COMPANY',     companyName],
                    ['PERIOD',      `${startDate}  →  ${endDate}`],
                    ['GENERATED',   ts],
                    ['EXPORTED BY', username],
                ].map(([label, val], i) => (
                    <div key={i} style={{ flex: 1, paddingRight: 16 }}>
                        <div style={{ fontSize: 8, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                            {label}
                        </div>
                        <div style={{ fontSize: 10, color: '#374151', marginTop: 1, fontWeight: 500 }}>{val}</div>
                    </div>
                ))}
            </div>

            {/* ── BODY ─────────────────────────────────────────── */}
            <div style={{ padding: '18px 36px 16px' }}>

                {/* KPI ROW */}
                {kpis.length > 0 && (
                    <>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                            Key Performance Indicators
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                            {kpis.map((k, i) => (
                                <div key={i} style={{
                                    flex: 1, background: k.bg, borderRadius: 8,
                                    padding: '12px 14px', borderTop: `3px solid ${k.accent}`,
                                }}>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: k.accent, lineHeight: 1 }}>{k.value}</div>
                                    <div style={{ fontSize: 10, fontWeight: 600, color: '#374151', marginTop: 4, lineHeight: 1.3 }}>{k.label}</div>
                                    <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>{k.sub}</div>
                                    {k.bar && (
                                        <div style={{ height: 3, background: '#e2e8f0', borderRadius: 6, overflow: 'hidden', marginTop: 7 }}>
                                            <div style={{ height: '100%', width: `${Math.min(100, k.barValue || 0)}%`, background: k.accent, borderRadius: 6 }} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* ANALYTICS PANELS */}
                {panelRows.length > 0 && (
                    <>
                        <div style={{ height: 1, background: '#E5E7EB', marginBottom: 14 }} />
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                            Analytics
                        </div>
                        {panelRows.map((row, ri) => (
                            <div key={ri} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                                {row.map((panel, pi) => {
                                    const defaultFlex = row.length === 1 ? '1' : (pi === 0 ? '0 0 56%' : '1')
                                    return (
                                        <Panel
                                            key={pi}
                                            title={panel.title}
                                            subtitle={panel.subtitle}
                                            type={panel.type}
                                            data={panel.data}
                                            flex={panel.flex || defaultFlex}
                                        />
                                    )
                                })}
                            </div>
                        ))}
                    </>
                )}

                {/* DATA TABLE */}
                {tableColumns.length > 0 && (
                    <>
                        <div style={{ height: 1, background: '#E5E7EB', marginBottom: 14 }} />
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                            {tableTitle}
                        </div>
                        <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
                                <thead>
                                    <tr style={{ background: DARK_BLUE }}>
                                        {tableColumns.map((col, i) => (
                                            <th key={i} style={{
                                                color: 'white', fontWeight: 600, fontSize: 9,
                                                textTransform: 'uppercase', letterSpacing: '0.04em',
                                                padding: '7px 11px',
                                                textAlign: col.align || 'left',
                                            }}>
                                                {col.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableRows.map((row, ri) => (
                                        <tr key={ri} style={{ background: ri % 2 === 0 ? '#F9FAFB' : 'white', borderBottom: '1px solid #F3F4F6' }}>
                                            {row.map((cell, ci) => (
                                                <td key={ci} style={{
                                                    padding: '6px 11px', color: '#374151',
                                                    fontWeight: ci === 1 ? 600 : 400,
                                                    textAlign: tableColumns[ci]?.align || 'left',
                                                }}>
                                                    {cell}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    {tableTotals && (
                                        <tr style={{ background: LIGHT, borderTop: '2px solid #BFDBFE' }}>
                                            {tableTotals.map((cell, ci) => (
                                                <td key={ci} style={{
                                                    padding: '7px 11px', fontWeight: 700, color: '#0f172a',
                                                    textAlign: tableColumns[ci]?.align || 'left',
                                                }}>
                                                    {cell}
                                                </td>
                                            ))}
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

            </div>

            {/* ── FOOTER ───────────────────────────────────────── */}
            <div style={{
                background: '#F8FAFC', borderTop: '1px solid #E5E7EB',
                padding: '10px 36px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
                <div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#374151' }}>ProdFlow ERP System</span>
                    <span style={{ fontSize: 9, color: '#94a3b8', marginLeft: 8 }}>
                        {reportTitle}  ·  Automatically Generated
                    </span>
                </div>
                <span style={{ fontSize: 9, color: '#94a3b8' }}>Generated: {ts}  ·  Page 1 of 1</span>
            </div>

        </div>
    )
}
