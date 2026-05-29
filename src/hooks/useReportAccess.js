import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../api/axios'

/**
 * Guards report detail pages: requires run_id in URL and backend access check.
 * Direct URL without batch → redirect to /reports.
 */
export function useReportAccess(expectedType) {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const runId = searchParams.get('run_id')

    const [access, setAccess] = useState(null)
    const [checking, setChecking] = useState(true)
    const [denied, setDenied] = useState(false)

    useEffect(() => {
        if (!runId) {
            toast.error('Generate this report from Reports Center first.')
            navigate('/reports', { replace: true })
            setDenied(true)
            setChecking(false)
            return
        }

        let cancelled = false
        setChecking(true)

        api.get(`/admin/reports/runs/${runId}/access`)
            .then(({ data }) => {
                if (cancelled) return
                if (expectedType && data.type && data.type !== expectedType) {
                    toast.error('Report type mismatch.')
                    navigate('/reports', { replace: true })
                    setDenied(true)
                    return
                }
                setAccess(data)
                setDenied(false)
            })
            .catch((err) => {
                if (cancelled) return
                const msg =
                    err.response?.data?.message ||
                    'Report access denied. Generate from Reports Center first.'
                toast.error(msg)
                navigate('/reports', { replace: true })
                setDenied(true)
            })
            .finally(() => {
                if (!cancelled) setChecking(false)
            })

        return () => {
            cancelled = true
        }
    }, [runId, expectedType, navigate])

    const querySuffix = runId ? `run_id=${encodeURIComponent(runId)}` : ''

    return {
        runId,
        access,
        checking,
        denied,
        startDate: access?.start_date ?? searchParams.get('start_date'),
        endDate: access?.end_date ?? searchParams.get('end_date'),
        /** Append run_id to report API query strings */
        withRunId: (baseQuery = '') => {
            const sep = baseQuery.includes('?') ? '&' : baseQuery ? '&' : ''
            if (!baseQuery) return `run_id=${encodeURIComponent(runId)}`
            return `${baseQuery}${sep}run_id=${encodeURIComponent(runId)}`
        },
        querySuffix,
    }
}
