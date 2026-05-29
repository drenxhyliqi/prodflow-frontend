import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../api/axios'
import { validateReportBatchInput } from '../utils/reportValidation'

const BATCH_STORAGE_KEY = 'prodflow_active_report_batch'
const TOAST_ID = 'report-batch-generation'
const POLL_MS = 2000

const ReportBatchContext = createContext(null)

function loadStoredBatch() {
    try {
        const raw = sessionStorage.getItem(BATCH_STORAGE_KEY)
        return raw ? JSON.parse(raw) : null
    } catch {
        return null
    }
}

function saveStoredBatch(batch) {
    if (!batch) {
        sessionStorage.removeItem(BATCH_STORAGE_KEY)
        return
    }
    sessionStorage.setItem(BATCH_STORAGE_KEY, JSON.stringify(batch))
}

function updateProgressToast(completed, total) {
    const message = `Generating reports (${completed}/${total})`
    if (toast.isActive(TOAST_ID)) {
        toast.update(TOAST_ID, { render: message })
    } else {
        toast.info(message, { toastId: TOAST_ID, autoClose: false, icon: '⏳' })
    }
}

export function ReportBatchProvider({ children }) {
    const [batch, setBatch] = useState(() => loadStoredBatch())
    const [polling, setPolling] = useState(false)
    const pollRef = useRef(null)
    const lastToastState = useRef('idle')

    const applyBatchUpdate = useCallback((data) => {
        setBatch(data)
        saveStoredBatch(data)

        const completed = Number(data.completed_count ?? data.completed ?? 0)
        const total = Number(data.total_count ?? data.total ?? data.runs?.length ?? 0)
        const status = data.status

        if (status === 'processing' || status === 'queued') {
            updateProgressToast(completed, total)
            lastToastState.current = 'processing'
            return
        }

        toast.dismiss(TOAST_ID)

        if (status === 'completed') {
            if (lastToastState.current === 'processing') {
                toast.success(`All ${total} reports generated successfully.`, { autoClose: 4000 })
            }
            lastToastState.current = 'completed'
            return
        }

        if (status === 'partial') {
            toast.warning(`${completed}/${total} reports generated. Some failed.`, { autoClose: 6000 })
            lastToastState.current = 'partial'
            return
        }

        if (status === 'failed') {
            toast.error(data.message || 'Report generation failed.', { autoClose: 5000 })
            lastToastState.current = 'failed'
        }
    }, [])

    const fetchBatchStatus = useCallback(async (batchId) => {
        const { data } = await api.get(`/admin/reports/batch/${batchId}`)
        applyBatchUpdate(data)
        return data
    }, [applyBatchUpdate])

    const startPolling = useCallback((batchId) => {
        if (pollRef.current) clearInterval(pollRef.current)
        setPolling(true)

        const poll = async () => {
            try {
                const data = await fetchBatchStatus(batchId)
                if (['completed', 'failed', 'partial'].includes(data.status)) {
                    clearInterval(pollRef.current)
                    pollRef.current = null
                    setPolling(false)
                }
            } catch {
                // batch may still be starting
            }
        }

        poll()
        pollRef.current = setInterval(poll, POLL_MS)
    }, [fetchBatchStatus])

    const startBatch = useCallback(async ({ startDate, endDate, types }) => {
        const { valid, errors } = validateReportBatchInput({ startDate, endDate, types })
        if (!valid) {
            errors.forEach((msg) => toast.error(msg))
            return null
        }

        try {
            const { data } = await api.post('/admin/reports/batch', {
                start_date: startDate,
                end_date: endDate,
                types,
            })

            applyBatchUpdate(data)
            startPolling(data.batch_id)
            return data
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to start report generation.'
            toast.error(msg)
            return null
        }
    }, [applyBatchUpdate, startPolling])

    const clearBatch = useCallback(() => {
        setBatch(null)
        saveStoredBatch(null)
        toast.dismiss(TOAST_ID)
        lastToastState.current = 'idle'
        if (pollRef.current) {
            clearInterval(pollRef.current)
            pollRef.current = null
        }
        setPolling(false)
    }, [])

    useEffect(() => {
        const stored = loadStoredBatch()
        if (stored?.batch_id && ['queued', 'processing'].includes(stored.status)) {
            startPolling(stored.batch_id)
        }
        return () => {
            if (pollRef.current) clearInterval(pollRef.current)
        }
    }, [startPolling])

    const getRunForType = useCallback(
        (typeId) => batch?.runs?.find((r) => r.type === typeId) ?? null,
        [batch]
    )

    const value = useMemo(
        () => ({
            batch,
            polling,
            startBatch,
            clearBatch,
            getRunForType,
            isGenerating: polling || batch?.status === 'processing' || batch?.status === 'queued',
        }),
        [batch, polling, startBatch, clearBatch, getRunForType]
    )

    return (
        <ReportBatchContext.Provider value={value}>
            {children}
        </ReportBatchContext.Provider>
    )
}

export function useReportBatch() {
    const ctx = useContext(ReportBatchContext)
    if (!ctx) throw new Error('useReportBatch must be used within ReportBatchProvider')
    return ctx
}
