import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axios'
import { IoIosArrowBack, IoMdPrint } from "react-icons/io";
import prodflow from '../../assets/img/prodflow_logo.png';
import { toast } from 'react-toastify';
import { IoArrowBackSharp } from 'react-icons/io5';

const SalesInvoice = () => {
    const { sale_number } = useParams();
    const [informations, setInformations] = useState([]);

    // Read Invoice Informations
    function getInvoiceInformations() {
        api.get(`/admin/invoice/${sale_number}`)
            .then(response => {
                setInformations(response.data);
            })
            .catch(() => {
                toast.error('Failed to fetch invoice informations.');
            });
    }

    useEffect(() => {
        getInvoiceInformations();
    }, [sale_number]);

    return (
        <>
            <div className="container my-5">
                <div className="d-print-none d-flex align-items-center justify-content-between mb-3">
                    <Link to='/sales' className='text-decoration-none text-dark d-flex align-items-center fw-semibold'><IoArrowBackSharp className='me-2'/> Turn Back</Link>
                    <button type='button' onClick={() => window.print()} className='btn btn-dark btn-sm'><IoMdPrint className='me-2'/>Print Delivery</button>
                </div>
                <div className="row align-items-center mb-4 g-4">
                    <div className="col-12 col-md-6 col-lg-6">
                        <img src={prodflow} alt="Prod Flow - Management System" className='rounded-4 bg-dark' style={{ maxWidth: '100%', height: '50px' }}/>
                    </div>
                    <div className="col-12 col-md-6 col-lg-6 text-start text-md-end">
                        <h3 className='fw-bold'>DELIVERY NOTE</h3>
                        <p className='mb-0'>Invoice #:<strong>{sale_number}</strong></p>
                        {informations.length > 0 && (
                            <p className='mb-0'>Date:
                                <strong>
                                    {informations[0].date
                                        ? new Date(informations[0].date).toLocaleDateString('en-GB', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                        })
                                    : '-'}
                                </strong>
                            </p>
                        )}
                    </div>
                </div>
                {informations.length > 0 && (
                    <>
                        <div className="row mb-4">
                            <div className="col-12">
                                <h6>Delivered To:</h6>
                                <h3 className='mb-0 fw-bold'>{informations[0].client}</h3>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12">
                                <div className="table-responsive">
                                    <table className="table table-bordered">
                                        <thead className="table-dark">
                                            <tr>
                                                <th className='text-nowrap'>Product</th>
                                                <th className='text-nowrap'>Unit</th>
                                                <th className='text-nowrap'>Quantity</th>
                                                <th className='text-nowrap text-end'>Price</th>
                                                <th className='text-nowrap text-end'>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {informations.map((item, index) => (
                                                <tr key={index}>
                                                    <td className='text-nowrap'>{item.product}</td>
                                                    <td className='text-nowrap'>{item.unit}</td>
                                                    <td className='text-nowrap'>{item.qty}</td>
                                                    <td className='text-nowrap text-end'>{item.price}€</td>
                                                    <td className='text-nowrap text-end'>{(item.price * item.qty).toFixed(2)}€</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            {(() => {
                                                const grandTotal = informations.reduce(
                                                    (sum, item) => sum + Number(item.price * item.qty),
                                                    0
                                                );
                                                const offerTotal = informations.reduce(
                                                    (sum, item) => sum + Number(item.total),
                                                    0
                                                );
                                                const isSame = grandTotal.toFixed(2) === offerTotal.toFixed(2);
                                                return (
                                                    <>
                                                        <tr>
                                                            <td colSpan="4" className="text-end fw-bold">
                                                                {isSame ? 'Grand Total:' : 'Subtotal:'}
                                                            </td>
                                                            <td className="fw-bold text-end">
                                                                {grandTotal.toFixed(2)}€
                                                            </td>
                                                        </tr>
                                                        {!isSame && (
                                                            <tr>
                                                                <td colSpan="4" className="text-end fw-bold">
                                                                    Offer:
                                                                </td>
                                                                <td className="fw-bold text-end">
                                                                    {offerTotal.toFixed(2)}€
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-4">
                            <div className="col-12 text-center">
                                <p className="text-muted">Thank you for your business!</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    )
}

export default SalesInvoice