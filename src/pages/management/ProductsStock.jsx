import React, { useEffect, useState } from 'react'
import Layout from '../../layouts/Layout'
import api from '../../api/axios'
import { toast } from 'react-toastify';
import { MdOutlineAddBox } from 'react-icons/md';
import Paginate from '../../components/Paginate';
import { FaSearch } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaEdit } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import { MdDeleteOutline } from "react-icons/md";

const ProductsStock = () => {
    const [productsStock, setProductsStock] = useState([]);
    const [pagination, setPagination] = useState({});
    const [search, setSearch] = useState('');
    const location = useLocation();

    // Read Products Stock
    function getProductsStock(page = 1, searchValue = '') {
        let url = `/admin/products_stock?page=${page}`;
        if (searchValue && searchValue.trim() !== '') {
            url += `&search=${encodeURIComponent(searchValue.trim())}`;
        }
        api.get(url)
            .then(response => {
                setProductsStock(response.data.data);
                setPagination(response.data);
            })
            .catch(() => {
                toast.error('Failed to fetch products stock.');
            });
    }

    // Search Products Stock
    const handleSearch = (e) => {
        e.preventDefault();
        const value = e.target.search.value.trim();
        const params = new URLSearchParams(location.search);
        params.set('search', value);
        params.set('page', 1);
        window.history.pushState({}, '', `?${params.toString()}`);
        getProductsStock(1, value);
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const page = params.get('page') || 1;
        const urlSearch = params.get('search') || '';
        getProductsStock(page, urlSearch);
        setSearch(urlSearch);
    }, [location.search]);

    return (
        <Layout>
            <h4 className='fw-bold'>Products Stock</h4>
            <small className='d-inline-block opacity-75'>Manage registered products stock</small>

            {/* Products List */}
            <div className="card rounded-4 my-4">
                <div className="card-header rounded-4">
                    <span className='fw-semibold'>Products List</span>
                </div>
                <div className="card-body">
                    <div className="mb-3">
                        <form onSubmit={handleSearch}>
                            <div className="input-group mb-3">
                                <input type="search" name='search' defaultValue={search} className="form-control rounded-start-4 shadow-none" placeholder="Search..." aria-describedby="button-addon2"/>
                                <button className="btn btn-primary rounded-end-4" type="submit" id="button-addon2"><FaSearch /></button>
                            </div>
                        </form>
                    </div>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th className='text-nowrap' scope="col">#</th>
                                    <th className='text-nowrap' scope="col">Product</th>
                                    <th className='text-nowrap text-end' scope="col">Stock(Units)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productsStock.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center">No data to show...</td>
                                    </tr>
                                ) : (
                                    productsStock.map((product, index) => (
                                        <tr key={product.pid}>
                                            <td className='text-nowrap'>{product.pid}</td>
                                            <td className='text-nowrap'>{product.product}</td>
                                            <td className={`text-nowrap text-end fw-semibold ${Number(product.product_stock) < 0 ? 'text-danger' : '' }`}>
                                                {product.product_stock} ({product.unit})
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <Paginate data={pagination} />
                </div>
            </div>
        </Layout>
    )
}

export default ProductsStock