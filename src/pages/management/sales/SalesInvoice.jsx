import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom';
import api from '../../../api/axios'
import { IoMdPrint } from "react-icons/io";
import prodflowIcon from '../../../assets/img/prodflow_favicon.png';
import { toast } from 'react-toastify';
import { IoArrowBackSharp } from 'react-icons/io5';

const BRAND = '#035dad'
const fmtMoney = n => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const SalesInvoice = () => {
    const { sale_number } = useParams();
    const [informations, setInformations] = useState([]);

    // Read Invoice Informations
    function getInvoiceInformations() {
        api.get(`/admin/invoice/${sale_number}`)
            .then(response => setInformations(response.data))
            .catch(() => toast.error('Failed to fetch invoice informations.'));
    }

    useEffect(() => {
        getInvoiceInformations();
    }, [sale_number]);

    const invoiceDate = informations.length > 0 && informations[0].date
        ? new Date(informations[0].date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '—';

    const grandTotal = informations.reduce((sum, item) => sum + Number(item.price * item.qty), 0);
    const offerTotal = informations.reduce((sum, item) => sum + Number(item.total), 0);
    const isSame = grandTotal.toFixed(2) === offerTotal.toFixed(2);

    return (
        <>
            <style>{`
                @media print {
                    .invoice-card { box-shadow: none !important; border-radius: 0 !important; }
                    .invoice-accent { display: block !important; }
                }
            `}</style>

            <div style={{ minHeight: '100vh', background: '#f1f5f9', paddingTop: '2rem', paddingBottom: '3rem' }}>
                <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 1rem' }}>

                    {/* Toolbar */}
                    <div className="d-print-none d-flex align-items-center justify-content-between mb-4">
                        <Link
                            to="/sales"
                            className="d-flex align-items-center gap-2 text-decoration-none fw-semibold"
                            style={{ color: '#374151', fontSize: '0.875rem' }}
                        >
                            <IoArrowBackSharp size={16} /> Turn Back
                        </Link>
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="btn btn-sm d-flex align-items-center gap-2 fw-semibold"
                            style={{ backgroundColor: BRAND, color: 'white', border: 'none', borderRadius: 8, padding: '6px 16px' }}
                        >
                            <IoMdPrint size={16} /> Print
                        </button>
                    </div>

                    {/* Invoice Card */}
                    <div
                        className="invoice-card"
                        style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}
                    >
                        {/* Brand accent stripe */}
                        <div className="invoice-accent" style={{ height: 4, background: `linear-gradient(90deg, ${BRAND}, #1d4ed8)` }} />

                        {/* Header */}
                        <div style={{ padding: '2.5rem 3rem 2rem' }}>
                            <div className="d-flex justify-content-between align-items-start">
                                {/* Icon only */}
                                <img
                                    src={prodflowIcon}
                                    alt="ProdFlow"
                                    style={{ height: 48, width: 48, objectFit: 'contain' }}
                                />
                                {/* Invoice meta */}
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.62rem', letterSpacing: '0.18em', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
                                        Delivery Note
                                    </div>
                                    <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, letterSpacing: '-0.02em' }}>
                                        #{sale_number}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 6 }}>
                                        {invoiceDate}
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div style={{ height: 1, background: '#f1f5f9', margin: '2rem 0' }} />

                            {/* Delivered To */}
                            {informations.length > 0 && (
                                <div>
                                    <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
                                        Delivered To
                                    </div>
                                    <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                                        {informations[0].client}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Table */}
                        {informations.length > 0 && (
                            <div style={{ padding: '0 3rem 0' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderTop: `2px solid ${BRAND}15`, borderBottom: `1px solid #e5e7eb` }}>
                                            {['Product', 'Unit', 'Quantity', 'Price', 'Total'].map((h, i) => (
                                                <th key={h} style={{
                                                    padding: '12px 0',
                                                    paddingRight: i < 4 ? 24 : 0,
                                                    fontSize: '0.67rem',
                                                    fontWeight: 700,
                                                    letterSpacing: '0.1em',
                                                    textTransform: 'uppercase',
                                                    color: '#6b7280',
                                                    textAlign: i >= 3 ? 'right' : 'left',
                                                    whiteSpace: 'nowrap',
                                                }}>
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {informations.map((item, index) => (
                                            <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '14px 24px 14px 0', fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' }}>{item.product}</td>
                                                <td style={{ padding: '14px 24px 14px 0', fontSize: '0.875rem', color: '#6b7280', whiteSpace: 'nowrap' }}>{item.unit}</td>
                                                <td style={{ padding: '14px 24px 14px 0', fontSize: '0.875rem', color: '#374151', whiteSpace: 'nowrap' }}>{item.qty}</td>
                                                <td style={{ padding: '14px 24px 14px 0', fontSize: '0.875rem', color: '#374151', whiteSpace: 'nowrap', textAlign: 'right' }}>{fmtMoney(item.price)} €</td>
                                                <td style={{ padding: '14px 0', fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', textAlign: 'right' }}>{fmtMoney(item.price * item.qty)} €</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr style={{ borderTop: '2px solid #e5e7eb' }}>
                                            <td colSpan="4" style={{ padding: '16px 24px 16px 0', textAlign: 'right', fontSize: '0.82rem', color: '#6b7280', fontWeight: 600 }}>
                                                {isSame ? 'Grand Total' : 'Subtotal'}
                                            </td>
                                            <td style={{ padding: '16px 0', textAlign: 'right', fontSize: '1rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>
                                                {fmtMoney(grandTotal)} €
                                            </td>
                                        </tr>
                                        {!isSame && (
                                            <tr>
                                                <td colSpan="4" style={{ padding: '4px 24px 16px 0', textAlign: 'right', fontSize: '0.82rem', color: '#6b7280', fontWeight: 600 }}>
                                                    Offer Total
                                                </td>
                                                <td style={{ padding: '4px 0 16px', textAlign: 'right', fontSize: '1rem', fontWeight: 800, color: BRAND, whiteSpace: 'nowrap' }}>
                                                    {fmtMoney(offerTotal)} €
                                                </td>
                                            </tr>
                                        )}
                                    </tfoot>
                                </table>
                            </div>
                        )}

                        {/* Footer */}
                        <div style={{ padding: '2rem 3rem', marginTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.72rem', color: '#d1d5db', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
                                ProdFlow Management
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                                Thank you for your business
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}

export default SalesInvoice
