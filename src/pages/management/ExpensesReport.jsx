import React, { useState } from 'react';
import Layout from '../../layouts/Layout';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaChartBar } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoImage from '../../assets/img/prodflow_logo.png';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ExpensesReport = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);

    const COLORS = ['#0d6efd', '#198754', '#dc3545', '#ffc107', '#0dcaf0', '#6610f2'];

    const handleGenerateReport = (e) => {
        e.preventDefault();

        if (!startDate || !endDate) {
            toast.error("Please select both dates!");
            return;
        }

        setLoading(true);

        api.get(`/admin/expenses_report?start_date=${startDate}&end_date=${endDate}`)
            .then(response => {
                const data = response.data.data || response.data;
                setReportData(Array.isArray(data) ? data : []);

                const total = Array.isArray(data)
                    ? data.reduce((sum, item) => sum + parseFloat(item.price || 0), 0)
                    : 0;

                setTotalAmount(total);

                if (!data || data.length === 0) {
                    toast.info("No expenses found for selected dates.");
                }
            })
            .catch(() => {
                toast.error('Failed to load report.');
            })
            .finally(() => setLoading(false));
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    const exportPDF = () => {
        const doc = new jsPDF();

        try {
            doc.addImage(logoImage, 'PNG', 14, 10, 40, 12);
        } catch (error) {
            console.error("Logo nuk mund të ngarkohej:", error);
        }

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Expenses Report", 14, 30);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Date Range: ${startDate} - ${endDate}`, 14, 37);
        doc.text(`Total: ${totalAmount.toFixed(2)} €`, 14, 43);

        autoTable(doc, {
            startY: 50,
            head: [["ID", "Date", "Comment", "Price"]],
            body: reportData.map(item => [
                item.id || item.eid,
                formatDate(item.date),
                item.comment || item.description || '-',
                `${parseFloat(item.price || 0).toFixed(2)} €`
            ]),
        });

        doc.save(`expenses_report_${startDate}_to_${endDate}.pdf`);
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
                            <button
                                className="btn btn-dark w-100 rounded-3"
                                disabled={loading}
                            >
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
                                <h4 className="fw-bold mb-0">{totalAmount.toFixed(2)} €</h4>
                            </div>
                        </div>

                        <button onClick={exportPDF} className="btn btn-danger rounded-3 px-4">
                            Export PDF
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
                                            value: parseFloat(item.price || 0)
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
                                                {parseFloat(e.price || 0).toFixed(2)} €
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        </div>
                    </div>

                </>
            )}

        </Layout>
    );
};

export default ExpensesReport;