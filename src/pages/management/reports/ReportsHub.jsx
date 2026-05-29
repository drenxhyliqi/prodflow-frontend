import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../../layouts/Layout'
import { validateReportBatchInput } from '../../../utils/reportValidation'
import { REPORT_TYPES } from '../../../constants/reportTypes'
import { useReportBatch } from '../../../context/ReportBatchContext'
import { MdOutlineFileDownload, MdOutlinePlayCircle, MdOutlineCheckCircle } from 'react-icons/md'
import { FaCheck, FaExclamationTriangle, FaSpinner } from 'react-icons/fa'
import { LuCalendarRange, LuChartBar } from 'react-icons/lu'
import { HiOutlineArrowRight } from 'react-icons/hi2'

const BRAND = '#035dad'
const btnBrand = { backgroundColor: BRAND, color: '#fff', border: 'none' }

const todayStr = () => new Date().toISOString().slice(0, 10)
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10)

const DATE_PRESETS = [
    { label: '7 days', days: 7 },
    { label: '30 days', days: 30 },
    { label: '90 days', days: 90 },
]

const STATUS_RING = {
    queued: { color: '#94a3b8', label: 'Queued' },
    processing: { color: BRAND, label: 'Running' },
    completed: { color: '#16a34a', label: 'Done' },
    failed: { color: '#dc2626', label: 'Failed' },
}

function JobDot({ status }) {
    if (!status) return null
    const meta = STATUS_RING[status] || STATUS_RING.queued
    return (
        <span
            className="d-inline-flex align-items-center gap-1"
            style={{ fontSize: '0.68rem', fontWeight: 700, color: meta.color }}
        >
            <span
                style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: meta.color,
                    display: 'inline-block',
                    animation: status === 'processing' ? 'pulse 1.2s infinite' : 'none',
                }}
            />
            {meta.label}
        </span>
    )
}

export default function ReportsHub() {
    const [startDate, setStartDate] = useState(daysAgo(30))
    const [endDate, setEndDate] = useState(todayStr())
    const [selected, setSelected] = useState(() => REPORT_TYPES.map((r) => r.id))
    const [validationErrors, setValidationErrors] = useState([])

    const { batch, isGenerating, startBatch, clearBatch, getRunForType } = useReportBatch()

    const allSelected = selected.length === REPORT_TYPES.length

    const applyPreset = (days) => {
        setStartDate(daysAgo(days))
        setEndDate(todayStr())
    }

    const toggleAll = () => {
        setSelected(allSelected ? [] : REPORT_TYPES.map((r) => r.id))
    }

    const toggleOne = (id) => {
        if (isGenerating) return
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        )
    }

    const handleGenerate = async (e) => {
        e.preventDefault()
        const { valid, errors } = validateReportBatchInput({ startDate, endDate, types: selected })
        setValidationErrors(errors)
        if (!valid) return
        await startBatch({ startDate, endDate, types: selected })
    }

    const batchProgress = useMemo(() => {
        if (!batch) return null
        const completed = Number(batch.completed_count ?? batch.completed ?? 0)
        const total = Number(batch.total_count ?? batch.total ?? batch.runs?.length ?? selected.length)
        const pct = total ? Math.round((completed / total) * 100) : 0
        return { completed, total, pct }
    }, [batch, selected.length])

    const buildViewLink = (report) => {
        const run = getRunForType(report.id)
        if (!run?.run_id || run.status !== 'completed') return null
        return `${report.path}?run_id=${encodeURIComponent(run.run_id)}`
    }

    const canOpenReport = (report) => Boolean(buildViewLink(report))

    return (
        <Layout>
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.85); }
                }
            `}</style>

            {/* Hero */}
            <div
                className="rounded-4 px-4 py-4 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3"
                style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #024a8a 100%)`, color: '#fff' }}
            >
                <div>
                    <p className="mb-1 fw-semibold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.12em', opacity: 0.85 }}>
                        Analytics
                    </p>
                    <h4 className="fw-bold mb-1">Reports Center</h4>
                    <small style={{ opacity: 0.85 }}>
                        Pick your reports, set the period, and generate everything in the background.
                    </small>
                </div>
                <div
                    className="d-flex align-items-center gap-3 px-3 py-2 rounded-4"
                    style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                    <LuChartBar size={28} style={{ opacity: 0.9 }} />
                    <div>
                        <div className="fw-bold" style={{ fontSize: '1.4rem', lineHeight: 1 }}>
                            {selected.length}/{REPORT_TYPES.length}
                        </div>
                        <small style={{ opacity: 0.8 }}>selected</small>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* Left panel — controls */}
                <div className="col-12 col-lg-4">
                    <div
                        className="rounded-4 p-4 h-100"
                        style={{ background: '#fff', border: '1px solid #e8eef4', boxShadow: '0 2px 12px rgba(3,93,173,0.06)' }}
                    >
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <div
                                style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    background: BRAND + '14', color: BRAND,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                <LuCalendarRange size={18} />
                            </div>
                            <div>
                                <p className="fw-semibold mb-0" style={{ fontSize: '0.9rem' }}>Date range</p>
                                <small className="text-muted">Period for all reports</small>
                            </div>
                        </div>

                        <form onSubmit={handleGenerate}>
                            <div className="d-flex flex-wrap gap-2 mb-3">
                                {DATE_PRESETS.map((p) => (
                                    <button
                                        key={p.days}
                                        type="button"
                                        disabled={isGenerating}
                                        className="btn btn-sm rounded-pill fw-semibold"
                                        style={{
                                            background: startDate === daysAgo(p.days) && endDate === todayStr() ? BRAND + '18' : '#f8fafc',
                                            color: startDate === daysAgo(p.days) && endDate === todayStr() ? BRAND : '#64748b',
                                            border: `1px solid ${startDate === daysAgo(p.days) && endDate === todayStr() ? BRAND + '40' : '#e2e8f0'}`,
                                        }}
                                        onClick={() => applyPreset(p.days)}
                                    >
                                        Last {p.label}
                                    </button>
                                ))}
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-semibold small text-muted mb-1">From</label>
                                <input
                                    type="date"
                                    className="form-control shadow-none rounded-3"
                                    value={startDate}
                                    max={endDate}
                                    disabled={isGenerating}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="form-label fw-semibold small text-muted mb-1">To</label>
                                <input
                                    type="date"
                                    className="form-control shadow-none rounded-3"
                                    value={endDate}
                                    min={startDate}
                                    disabled={isGenerating}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>

                            {batchProgress && (isGenerating || batch?.status === 'partial') && (
                                <div
                                    className="rounded-3 p-3 mb-4"
                                    style={{ background: BRAND + '08', border: `1px solid ${BRAND}20` }}
                                >
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="fw-semibold small" style={{ color: BRAND }}>
                                            {isGenerating ? 'Generating…' : 'Last batch'}
                                        </span>
                                        <span className="fw-bold" style={{ color: BRAND }}>
                                            {batchProgress.completed}/{batchProgress.total}
                                        </span>
                                    </div>
                                    <div style={{ height: 8, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                height: '100%',
                                                width: `${batchProgress.pct}%`,
                                                background: `linear-gradient(90deg, ${BRAND}, #38bdf8)`,
                                                borderRadius: 99,
                                                transition: 'width 0.5s ease',
                                            }}
                                        />
                                    </div>
                                    {!isGenerating && (
                                        <button type="button" className="btn btn-link btn-sm p-0 mt-2 text-muted" onClick={clearBatch}>
                                            Clear
                                        </button>
                                    )}
                                </div>
                            )}

                            {validationErrors.length > 0 && (
                                <div className="alert alert-danger rounded-3 py-2 px-3 mb-3 mb-0" style={{ fontSize: '0.82rem' }}>
                                    <ul className="mb-0 ps-3">
                                        {validationErrors.map((err, i) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="d-grid gap-2">
                                <button
                                    type="submit"
                                    disabled={isGenerating || selected.length === 0}
                                    className="btn rounded-3 py-2 d-flex align-items-center justify-content-center gap-2 fw-semibold"
                                    style={btnBrand}
                                >
                                    {isGenerating ? (
                                        <>
                                            <FaSpinner className="fa-spin" />
                                            Running batch…
                                        </>
                                    ) : (
                                        <>
                                            <MdOutlinePlayCircle size={20} />
                                            Generate {selected.length} report{selected.length !== 1 ? 's' : ''}
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    disabled={isGenerating}
                                    className="btn rounded-3 py-2 fw-semibold"
                                    style={{ border: '1px solid #e2e8f0', color: '#64748b', background: '#fff' }}
                                    onClick={toggleAll}
                                >
                                    {allSelected ? 'Clear selection' : 'Select all reports'}
                                </button>
                            </div>
                        </form>

                        <p className="text-muted mb-0 mt-4" style={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
                            Progress appears in the bottom-right toast while you browse other pages.
                        </p>
                    </div>
                </div>

                {/* Right — report tiles */}
                <div className="col-12 col-lg-8">
                    <div className="d-flex flex-column gap-3">
                        {REPORT_TYPES.map((report, index) => {
                            const Icon = report.icon
                            const isChecked = selected.includes(report.id)
                            const run = getRunForType(report.id)
                            const runStatus = run?.status
                            const isReady = runStatus === 'completed'

                            return (
                                <div
                                    key={report.id}
                                    role="button"
                                    tabIndex={isGenerating ? -1 : 0}
                                    onClick={() => toggleOne(report.id)}
                                    onKeyDown={(e) => e.key === 'Enter' && toggleOne(report.id)}
                                    className="rounded-4 overflow-hidden"
                                    style={{
                                        background: '#fff',
                                        border: isChecked ? `2px solid ${BRAND}` : '1px solid #e8eef4',
                                        boxShadow: isChecked
                                            ? `0 4px 20px ${BRAND}18`
                                            : '0 1px 4px rgba(0,0,0,0.04)',
                                        cursor: isGenerating ? 'default' : 'pointer',
                                        transition: 'all 0.2s ease',
                                        opacity: isGenerating && !isChecked ? 0.7 : 1,
                                    }}
                                >
                                    <div className="d-flex align-items-stretch">
                                        {/* Accent strip */}
                                        <div
                                            style={{
                                                width: 5,
                                                flexShrink: 0,
                                                background: isChecked
                                                    ? `linear-gradient(180deg, ${BRAND}, #38bdf8)`
                                                    : '#e2e8f0',
                                                transition: 'background 0.2s',
                                            }}
                                        />

                                        <div className="flex-grow-1 p-3 p-md-4 d-flex align-items-center gap-3 gap-md-4">
                                            {/* Icon block */}
                                            <div
                                                style={{
                                                    width: 52,
                                                    height: 52,
                                                    borderRadius: 14,
                                                    background: report.iconBg,
                                                    color: report.iconColor,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <Icon size={26} />
                                            </div>

                                            {/* Text */}
                                            <div className="flex-grow-1 min-w-0">
                                                <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                                                    <span className="fw-bold" style={{ color: '#0f172a', fontSize: '0.95rem' }}>
                                                        {report.label}
                                                    </span>
                                                    <span
                                                        className="text-muted"
                                                        style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em' }}
                                                    >
                                                        0{index + 1}
                                                    </span>
                                                    {runStatus && <JobDot status={runStatus} />}
                                                </div>
                                                <p className="mb-0 text-muted small text-truncate">{report.description}</p>
                                                {run?.error_message && (
                                                    <p className="mb-0 mt-1 small text-danger">{run.error_message}</p>
                                                )}
                                            </div>

                                            {/* Open page — only after batch completed */}
                                            {canOpenReport(report) ? (
                                                <Link
                                                    to={buildViewLink(report)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="btn btn-sm rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center"
                                                    title="Open report"
                                                    style={{
                                                        width: 36,
                                                        height: 36,
                                                        border: `1px solid ${BRAND}30`,
                                                        color: BRAND,
                                                        background: BRAND + '08',
                                                    }}
                                                >
                                                    <HiOutlineArrowRight size={16} />
                                                </Link>
                                            ) : (
                                                <span
                                                    className="rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center"
                                                    title="Generate from Reports Center first"
                                                    style={{
                                                        width: 36,
                                                        height: 36,
                                                        border: '1px dashed #cbd5e1',
                                                        color: '#94a3b8',
                                                        background: '#f8fafc',
                                                        fontSize: '0.65rem',
                                                    }}
                                                >
                                                    —
                                                </span>
                                            )}

                                            {/* Selection indicator */}
                                            <div
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: '50%',
                                                    flexShrink: 0,
                                                    border: isChecked ? 'none' : '2px solid #cbd5e1',
                                                    background: isChecked ? BRAND : 'transparent',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#fff',
                                                    transition: 'all 0.15s',
                                                }}
                                            >
                                                {isChecked && <FaCheck size={12} />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions row */}
                                    <div
                                        className="px-4 py-2 d-flex gap-2 flex-wrap align-items-center"
                                        style={{ background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {canOpenReport(report) ? (
                                            <Link
                                                to={buildViewLink(report)}
                                                className="btn btn-sm rounded-pill d-inline-flex align-items-center gap-1 fw-semibold"
                                                style={{ ...btnBrand, fontSize: '0.78rem', padding: '4px 14px' }}
                                            >
                                                View report <HiOutlineArrowRight size={14} />
                                            </Link>
                                        ) : (
                                            <span className="small text-muted">
                                                Generate batch to unlock this report
                                            </span>
                                        )}
                                        {run?.download_url && (
                                            <a
                                                href={run.download_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="btn btn-sm rounded-pill d-inline-flex align-items-center gap-1"
                                                style={{ border: '1px solid #e2e8f0', fontSize: '0.78rem', padding: '4px 14px' }}
                                            >
                                                <MdOutlineFileDownload size={14} /> PDF
                                            </a>
                                        )}
                                        {isReady && (
                                            <span className="ms-auto d-flex align-items-center gap-1 small text-success fw-semibold">
                                                <MdOutlineCheckCircle size={16} /> Batch ready
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </Layout>
    )
}
