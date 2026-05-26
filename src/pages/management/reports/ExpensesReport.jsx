import { useState, useMemo } from 'react';
import Layout from '../../../layouts/Layout';
import api from '../../../api/axios';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaChartBar } from 'react-icons/fa';
import { MdOutlineFileDownload } from 'react-icons/md';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { exportToPDF } from '../../../utils/exportToPDF';
import ReportPDFTemplate from './ReportPDFTemplate';

const fmtMoney = n => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ExpensesReport = () => {
    const [startDate,  setStartDate]  = useState('');
    const [endDate,    setEndDate]    = useState('');
    const [reportData, setReportData] = useState([]);
    const [loading,    setLoading]    = useState(false);
    const [totalAmount,setTotalAmount]= useState(0);
    const [exporting,  setExporting]  = useState(false);

    const COLORS = ['#0d6efd', '#198754', '#dc3545', '#ffc107', '#0dcaf0', '#6610f2'];

    const handleGenerateReport = (e) => {
        e.preventDefault();
        if (!startDate || !endDate) { toast.error("Please select both dates!"); return; }
        setLoading(true);
        api.get(`/admin/expenses_report?start_date=${startDate}&end_date=${endDate}`)
            .then(response => {
                const data = response.data.data || response.data;
                setReportData(Array.isArray(data) ? data : []);
                const total = Array.isArray(data)
                    ? data.reduce((sum, item) => sum + parseFloat(item.price || 0), 0)
                    : 0;
                setTotalAmount(total);
                if (!data || data.length === 0) toast.info("No expenses found for selected dates.");
            })
            .catch(() => toast.error('Failed to load report.'))
            .finally(() => setLoading(false));
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    /* ── PDF props ───────────────────────────────────────────── */
    const pdfProps = useMemo(() => {
        if (!reportData.length) return null;
        const avg = totalAmount / reportData.length;
        return {
            reportTitle: 'Expenses Report',
            kpis: [
                { accent: '#dc2626', bg: '#fef2f2', value: `${fmtMoney(totalAmount)} €`,  label: 'Total Expenses',  sub: 'selected period' },
                { accent: '#2563EB', bg: '#eff6ff', value: String(reportData.length),       label: 'Expense Records', sub: 'entries' },
                { accent: '#d97706', bg: '#fffbeb', value: `${fmtMoney(avg)} €`,           label: 'Avg per Record',  sub: 'average amount' },
            ],
            panels: [
                {
                    title: 'Expenses by Date', subtitle: 'Amount per expense entry', type: 'bars',
                    data: reportData.map(e => ({ label: formatDate(e.date), value: parseFloat(e.price || 0) })),
                },
            ],
            tableTitle: 'Expense Records',
            tableColumns: [
                { label: 'ID',      align: 'center' },
                { label: 'Date',    align: 'left'   },
                { label: 'Comment', align: 'left'   },
                { label: 'Price',   align: 'right'  },
            ],
            tableRows: reportData.map(e => [
                String(e.id || e.eid),
                formatDate(e.date),
                e.comment || e.description || '—',
                `${fmtMoney(e.price || 0)} €`,
            ]),
            tableTotals: ['—', 'TOTAL', '—', `${fmtMoney(totalAmount)} €`],
        };
    }, [reportData, totalAmount]);

    /* ── Export handler ──────────────────────────────────────── */
    const handleExport = async () => {
        if (!pdfProps || exporting) return;
        setExporting(true);
        try {
            await exportToPDF('pdf-export-container', `expenses-report-${startDate}-${endDate}.pdf`);
            toast.success('Report exported successfully');
        } catch {
            toast.error('Failed to export report. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <Layout>

            {/* HEADER */}
            <div className="mb-4 p-4 rounded-4 text-white shadow"
                style={{ background: "linear-gradient(135deg, #0d6efd, #6610f2)" }}
            >
                <h3 className="fw-bold mb-0">Expenses Report</h3>
                <small>Analyze company expenses between selected dates</small>
            </div>

            {/* FILTER */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                    <form onSubmit={handleGenerateReport} className="row g-3">

                        <div className="col-md-4">
                            <label className="form-label">Start Date</label>
                            <input
                                type="date"
                                className="form-control rounded-3"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">End Date</label>
                            <input
                                type="date"
                                className="form-control rounded-3"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>

                        <div className="col-md-4 d-flex align-items-end">
                            <button className="btn btn-dark w-100 rounded-3" disabled={loading}>
                                <FaCalendarAlt className="me-2" />
                                {loading ? 'Loading...' : 'Generate Report'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>

            {reportData.length > 0 && (
                <>
                    {/* TOTAL + EXPORT */}
                    <div className="d-flex justify-content-between align-items-center mb-3">

                        <div className="card border-0 shadow-sm rounded-4 text-white"
                            style={{ background: "linear-gradient(135deg, #198754, #20c997)" }}
                        >
                            <div className="card-body py-3 px-4">
                                <h6 className="mb-1">Total Expenses</h6>
                                <h4 className="fw-bold mb-0">{fmtMoney(totalAmount)} €</h4>
                            </div>
                        </div>

                        <button
                            onClick={handleExport}
                            disabled={exporting}
                            className="btn rounded-3 px-4 d-flex align-items-center gap-2 fw-semibold"
                            style={{ background: 'white', border: '1px solid #e2e8f0', color: '#374151' }}
                        >
                            {exporting
                                ? <><span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14 }} /> Generating...</>
                                : <><MdOutlineFileDownload size={17} /> Export PDF</>
                            }
                        </button>

                    </div>

                    {/* CHART */}
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-header bg-white border-0">
                            <h5 className="mb-0 d-flex align-items-center gap-2">
                                <FaChartBar className="text-primary" />
                                Expenses Chart
                            </h5>
                        </div>
                        <div className="card-body">
                            <div style={{ height: 350 }}>
                                <ResponsiveContainer>
                                    <BarChart
                                        data={reportData.map(item => ({
                                            ...item,
                                            label: formatDate(item.date),
                                            value: parseFloat(item.price || 0),
                                        }))}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="label" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                            {reportData.map((_, i) => (
                                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-header bg-white border-0">
                            <h5 className="mb-0">Expenses List</h5>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover mb-0 align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>Date</th>
                                        <th>Comment</th>
                                        <th className="text-end">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.map((e, i) => (
                                        <tr key={i}>
                                            <td>{e.id || e.eid}</td>
                                            <td>{formatDate(e.date)}</td>
                                            <td>{e.comment || e.description || '-'}</td>
                                            <td className="text-end fw-semibold">
                                                {fmtMoney(e.price || 0)} €
                                            </td>
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

export default ExpensesReport;
