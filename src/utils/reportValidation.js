/**
 * Client-side report validations (UX only — backend must enforce the same rules).
 * See docs/BACKEND_REPORTS_VALIDATION_AND_ACCESS.md
 */

export const MAX_REPORT_RANGE_DAYS = 366
export const REPORT_TYPE_VALUES = ['production', 'sales', 'expenses', 'materials_stock']

export const todayStr = () => new Date().toISOString().slice(0, 10)

export function daysBetween(startDate, endDate) {
    const start = new Date(`${startDate}T12:00:00`)
    const end = new Date(`${endDate}T12:00:00`)
    return Math.round((end - start) / 86400000) + 1
}

/**
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateReportBatchInput({ startDate, endDate, types }) {
    const errors = []
    const today = todayStr()

    if (!startDate) errors.push('Start date is required.')
    if (!endDate) errors.push('End date is required.')

    if (startDate && endDate) {
        if (startDate > endDate) errors.push('End date must be on or after start date.')
        if (endDate > today) errors.push('End date cannot be in the future.')
        if (startDate > today) errors.push('Start date cannot be in the future.')

        const span = daysBetween(startDate, endDate)
        if (span > MAX_REPORT_RANGE_DAYS) {
            errors.push(`Date range cannot exceed ${MAX_REPORT_RANGE_DAYS} days.`)
        }
        if (span < 1) errors.push('Date range must be at least 1 day.')
    }

    if (!types?.length) errors.push('Select at least one report.')
    if (types?.length > 4) errors.push('Maximum 4 reports per batch.')

    const unique = new Set(types || [])
    if (types?.length && unique.size !== types.length) {
        errors.push('Duplicate report type selected.')
    }

    for (const t of types || []) {
        if (!REPORT_TYPE_VALUES.includes(t)) {
            errors.push(`Invalid report type: ${t}.`)
        }
    }

    return { valid: errors.length === 0, errors }
}
