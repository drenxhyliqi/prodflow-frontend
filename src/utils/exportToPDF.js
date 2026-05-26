import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Captures a DOM element by id and saves it as a multi-page A4 PDF.
 * @param {string} elementId  - id of the element to capture
 * @param {string} fileName   - filename including .pdf extension
 */
export async function exportToPDF(elementId, fileName) {
    const element = document.getElementById(elementId)
    if (!element) throw new Error(`Element #${elementId} not found`)

    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
    })

    const pdf          = new jsPDF('p', 'mm', 'a4')
    const pdfWidth     = pdf.internal.pageSize.getWidth()
    const pageHeightPx = (297 * canvas.width) / pdfWidth
    let yOffset = 0
    let page    = 0

    while (yOffset < canvas.height) {
        const sliceH     = Math.min(pageHeightPx, canvas.height - yOffset)
        const pageCanvas = document.createElement('canvas')
        pageCanvas.width  = canvas.width
        pageCanvas.height = sliceH
        pageCanvas.getContext('2d').drawImage(canvas, 0, -yOffset)

        if (page > 0) pdf.addPage()
        pdf.addImage(
            pageCanvas.toDataURL('image/png'), 'PNG',
            0, 0, pdfWidth, (sliceH * pdfWidth) / canvas.width,
        )
        yOffset += pageHeightPx
        page++
    }

    pdf.save(fileName)
}
