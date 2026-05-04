import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom';
import { IoIosArrowBack } from "react-icons/io";

const SalesInvoice = () => {
    const { sale_number } = useParams();
    const [informations, setInformations] = useState([]);

    return (
        <>
            <h4 className='fw-bold'>Companies</h4>
            <small className='d-inline-block opacity-75'>Manage registered companies</small>
            <div className="container my-5">
                <Link to='/sales'>Turn Back</Link>
                <p>Invoice for: {sale_number}</p>
            </div>
        </>
    )
}

export default SalesInvoice