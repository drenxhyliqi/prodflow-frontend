import React, { use, useEffect } from 'react'
import Layout from '../../layouts/Layout'
import api from '../../api/axios'
import { toast } from 'react-toastify';

const Companies = () => {

    // Get Companies
    function getCompanies() {
        api.get('/admin/companies')
            .then(response => {
                console.log(response.data);
            })
            .catch(error => {
                toast.error('Failed to fetch companies.');
            });
    };

    useEffect(() => {
        getCompanies();
    }, []);

    return (
        <Layout>
            <h4 className='fw-bold'>Companies</h4>
            <span className='d-inline-block opacity-75'>Companies overview...</span>
        </Layout>
    )
}

export default Companies