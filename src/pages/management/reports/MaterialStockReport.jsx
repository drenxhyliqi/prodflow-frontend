import { useState, useMemo } from 'react';
import Layout from '../../../layouts/Layout';
import api from '../../../api/axios';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaChartBar } from 'react-icons/fa';
import { MdOutlineFileDownload } from 'react-icons/md';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { exportToPDF } from '../../../utils/exportToPDF';
import ReportPDFTemplate from './ReportPDFTemplate';

const fmtQty = n => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const MaterialsStockReport = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    const totals = useMemo(() => {
        let totalIn = 0;
        let totalOut = 0;
        if (Array.isArray(reportData)) {
            reportData.forEach(item => {
                if (item && item.type === 'IN') totalIn += parseFloat(item.qty || 0);
                if (item && item.type === 'OUT') totalOut += parseFloat(item.qty || 0);
            });
        }
        return { totalIn, totalOut, balance: totalIn - totalOut };
    }, [reportData]);

    const handleGenerateReport = (e) => {
        e.preventDefault();
        if (!startDate || !endDate) { toast.error("Please select both dates!"); return; }
        setLoading(true);

        api.get(`/admin/materials_stock_report?start_date=${startDate}&end_date=${endDate}`)
            .then(response => {
                const data = response.data?.data || response.data;
                setReportData(Array.isArray(data) ? data : []);
                if (!data || data.length === 0) toast.info("No stock movements found for selected dates.");
            })
            .catch(() => toast.error('Failed to load stock report.'))
            .finally(() => setLoading(false));
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    const chartData = useMemo(() => {
        const groups = {};
        if (Array.isArray(reportData)) {
            reportData.forEach(item => {
                if (!item) return;
                const name = item.material_name || item.material || (item.material_id ? `ID: ${item.material_id}` : 'N/A');
                if (!groups[name]) {
                    groups[name] = { name, IN: 0, OUT: 0 };
                }
                if (item.type === 'IN' || item.type === 'OUT') {
                    groups[name][item.type] += parseFloat(item.qty || 0);
                }
            });
        }
        return Object.values(groups);
    }, [reportData]);

    /* ── PDF Props ── */
    const pdfProps = useMemo(() => {
        if (!Array.isArray(reportData) || !reportData.length) return null;

        const pdfChartData = [];
        chartData.forEach(c => {
            if (c.IN > 0) {
                pdfChartData.push({ label: `${c.name} (IN)`, value: c.IN });
            }
            if (c.OUT > 0) {
                pdfChartData.push({ label: `${c.name} (OUT)`, value: c.OUT });
            }
        });

        return {
            reportTitle: 'Materials Stock Report',
            kpis: [
                { accent: '#10b981', bg: '#ecfdf5', value: `${fmtQty(totals.totalIn)} Pcs`, label: 'Total Stock IN', sub: 'entries' },
                { accent: '#ef4444', bg: '#fef2f2', value: `${fmtQty(totals.totalOut)} Pcs`, label: 'Total Stock OUT', sub: 'exits' },
                { accent: '#3b82f6', bg: '#eff6ff', value: `${fmtQty(totals.balance)} Pcs`, label: 'Net Balance', sub: 'in stock' },
            ],
            panels: [
                {
                    title: 'Stock Movements by Material',
                    subtitle: 'Quantities entered (IN) and exited (OUT)',
                    type: 'bars',
                    data: pdfChartData,
                },
            ],
            tableTitle: 'Material Stock Ledger',
            tableColumns: [
                { label: 'ID', align: 'center' },
                { label: 'Date', align: 'left' },
                { label: 'Material', align: 'left' },
                { label: 'Type', align: 'center' },
                { label: 'Quantity', align: 'right' },
            ],
            tableRows: reportData.map(e => [
                String(e?.msid || ''),
                formatDate(e?.date),
                e?.material_name || e?.material || (e?.material_id ? `ID: ${e.material_id}` : '—'),
                e?.type || '',
                `${fmtQty(e?.qty)}`,
            ]),
            tableTotals: ['—', 'TOTALS', '—', `IN: ${fmtQty(totals.totalIn)}`, `OUT: ${fmtQty(totals.totalOut)}`],
        };
    }, [reportData, totals, chartData]);

    const handleExport = async () => {
        if (!pdfProps || exporting) return;
        setExporting(true);
        try {
            await exportToPDF('pdf-export-container', `materials-stock-report-${startDate}-${endDate}.pdf`);
            toast.success('Report exported successfully');
        } catch {
            toast.error('Failed to export report.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <Layout>
            {/* HEADER */}
            <div className="mb-4 p-4 rounded-4 text-white shadow" style={{ background: "linear-gradient(135deg, #4f46e5, #06b6d4)" }}>
                <h3 className="fw-bold mb-0">Materials Stock Report</h3>
                <small>Track material movements (IN/OUT) within a date range</small>
            </div>

            {/* FILTER FORM */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                    <form onSubmit={handleGenerateReport} className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label">Start Date</label>
                            <input type="date" className="form-control rounded-3" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">End Date</label>
                            <input type="date" className="form-control rounded-3" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                        <div className="col-md-4 d-flex align-items-end">
                            <button type="submit" className="btn btn-dark w-100 rounded-3" disabled={loading}>
                                <FaCalendarAlt className="me-2" />
                                {loading ? 'Loading...' : 'Generate Report'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {Array.isArray(reportData) && reportData.length > 0 && (
                <>
                    {/* STATS CARDS & EXPORT */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm rounded-4 bg-success text-white py-3 px-4">
                                <h6 className="mb-1">Total IN</h6>
                                <h4 className="fw-bold mb-0">{fmtQty(totals.totalIn)}</h4>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm rounded-4 bg-danger text-white py-3 px-4">
                                <h6 className="mb-1">Total OUT</h6>
                                <h4 className="fw-bold mb-0">{fmtQty(totals.totalOut)}</h4>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm rounded-4 bg-primary text-white py-3 px-4">
                                <h6 className="mb-1">Net Balance</h6>
                                <h4 className="fw-bold mb-0">{fmtQty(totals.balance)}</h4>
                            </div>
                        </div>
                        <div className="col-md-3 d-flex align-items-center justify-content-end">
                            <button onClick={handleExport} disabled={exporting} className="btn rounded-3 px-4 d-flex align-items-center gap-2 fw-semibold shadow-sm w-100 py-3 justify-content-center" style={{ background: 'white', border: '1px solid #e2e8f0', color: '#374151' }}>
                                {exporting ? <><span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14 }} /> Generating...</> : <><MdOutlineFileDownload size={17} /> Export PDF</>}
                            </button>
                        </div>
                    </div>

                    {/* CHART */}
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="mb-0 d-flex align-items-center gap-2">
                                <FaChartBar className="text-primary" /> Stock Volume by Material
                            </h5>
                        </div>
                        <div className="card-body">
                            <div style={{ height: 350 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="IN" fill="#198754" name="Stock IN" radius={[5, 5, 0, 0]} />
                                        <Bar dataKey="OUT" fill="#dc3545" name="Stock OUT" radius={[5, 5, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="mb-0">Transaction List</h5>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover mb-0 align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th className="text-center">ID</th>
                                        <th>Date</th>
                                        <th>Material</th>
                                        <th className="text-center">Type</th>
                                        <th className="text-end">Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.map((e, i) => (
                                        <tr key={i}>
                                            <td className="text-center">{e?.msid}</td>
                                            <td>{formatDate(e?.date)}</td>
                                            <td className="fw-semibold">
                                                {e?.material_name || e?.material || (e?.material_id ? `ID: ${e.material_id}` : '—')}
                                            </td>
                                            <td className="text-center">
                                                <span className={`badge rounded-pill px-3 py-2 ${e?.type === 'IN' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                                    {e?.type}
                                                </span>
                                            </td>
                                            <td className="text-end fw-bold">{fmtQty(e?.qty)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

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
    );
};

export default MaterialsStockReport;