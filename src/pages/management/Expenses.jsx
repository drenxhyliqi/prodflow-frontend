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

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [editExpense, setEditExpense] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [pagination, setPagination] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const location = useLocation();

    // Create Expense
    function createExpense(e) {
        e.preventDefault();
        setSubmitting(true);
        const comment = document.getElementById('comment').value;
        const price = document.getElementById('price').value;
        const date = document.getElementById('date').value;
        api.post('/admin/create_expense', { comment, price, date })
            .then(response => {
                toast.success(response.data.message);
                getExpenses();
                clearFields();
                setSubmitting(false);
            })
            .catch(error => {
                toast.error(error.response.data.message || 'Failed to create expense.');
                setSubmitting(false);
            });
    }

    // Read Expenses
    function getExpenses(page = 1, searchValue = '') {
        let url = `/admin/expenses?page=${page}`;
        if (searchValue && searchValue.trim() !== '') {
            url += `&search=${encodeURIComponent(searchValue.trim())}`;
        }
        api.get(url)
            .then(response => {
                setExpenses(response.data.data);
                setPagination(response.data);
            })
            .catch(() => {
                toast.error('Failed to fetch expenses.');
            });
    }

    // Search Expenses
    const handleSearch = (e) => {
        e.preventDefault();
        const value = e.target.search.value.trim();
        const params = new URLSearchParams(location.search);
        params.set('search', value);
        params.set('page', 1);
        window.history.pushState({}, '', `?${params.toString()}`);
        getExpenses(1, value);
    };

    // Edit Expense
    function checkEditExpense(id) {
        api.get(`/admin/edit_expense/${id}`)
            .then(response => {
                setEditExpense(response.data);
            })
            .catch(error => {
                toast.error(error.response.data.message || 'No information found.');
                setSubmitting(false);
            });
    }

    // Update Expense
    function updateExpense(e) {
        e.preventDefault();
        setSubmitting(true);
        const eid = document.getElementById('eid').value;
        const comment = document.getElementById('comment').value;
        const price = document.getElementById('price').value;
        const date = document.getElementById('date').value;
        api.post('/admin/update_expense', { eid, comment, price, date })
            .then(response => {
                toast.success(response.data.message);
                setSubmitting(false);
                setEditExpense(null)
                getExpenses();
            })
            .catch(error => {
                toast.error(error.response.data.message || 'Failed to update expense.');
                setSubmitting(false);
            });
    }

    // Delete Expense
    function handleDelete(){
        api.get(`/admin/delete_expense/${deleteId}`)
            .then(response => {
                toast.success(response.data.message);
                getExpenses();
                setDeleteId(null);
            })
            .catch(error => {
                toast.error(error.response.data.message || 'Failed to delete expense.');
                setDeleteId(null);
            });
    }

    // Clear Fields
    function clearFields() {
        document.getElementById('comment').value = '';
        document.getElementById('price').value = '';
        document.getElementById('date').value = '';
    }

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const page = params.get('page') || 1;
        const urlSearch = params.get('search') || '';
        getExpenses(page, urlSearch);
        setSearch(urlSearch);
    }, [location.search]);

    return (
        <Layout>
            {!editExpense && (
                <>
                    <h4 className='fw-bold'>Expenses</h4>
                    <small className='d-inline-block opacity-75'>Manage registered expenses by company</small>
                </>
            )}

            {editExpense && (
                <>
                    <button onClick={() => setEditExpense(null)} className='btn btn-transparent border-0 p-0 d-flex align-items-center fw-semibold'><IoIosArrowBack className='me-2'/>Turn back</button>
                </>
            )}

            {/* Edit Expense */}
            {editExpense && (
                <>
                    <div className="card rounded-4 mt-3">
                        <div className="card-header rounded-4">
                            <span className='fw-semibold'>Update Expense <strong>#ID:{editExpense.eid}</strong></span>
                        </div>
                        <div className="card-body">
                            <form method='post' onSubmit={updateExpense}>
                                <input type="hidden" id='eid' name='eid' value={editExpense.eid} required/>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="comment" className="form-label">Comment</label>
                                        <input type="text" defaultValue={editExpense.comment} className="form-control rounded-4 shadow-none" id="comment" placeholder="Enter comment" />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="price" className="form-label">Price</label>
                                        <input type="text" defaultValue={editExpense.price} className="form-control rounded-4 shadow-none" id="price" placeholder="Enter price" />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="date" className="form-label">Date</label>
                                        <input type="date" defaultValue={editExpense.date} className="form-control rounded-4 shadow-none" id="date" placeholder="Enter date" />
                                    </div>
                                    <div className="col-12">
                                        {submitting ? (
                                            <button type='button' className="btn btn-success rounded-4 d-flex align-items-center gap-1" disabled><FaEdit /> Updating...</button>
                                        ) : (
                                            <button type='submit' className="btn btn-success rounded-4 d-flex align-items-center gap-1"><FaEdit /> Update Expense</button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {/* Create Expense */}
            {!editExpense && (
                <>
                    <div className="card rounded-4 mt-3">
                        <div className="card-header rounded-4">
                            <span className='fw-semibold'>Register new Expense</span>
                        </div>
                        <div className="card-body">
                            <form method='post' onSubmit={createExpense}>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="comment" className="form-label">Comment</label>
                                        <input type="text" className="form-control rounded-4 shadow-none" id="comment" placeholder="Enter comment" />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="price" className="form-label">Price</label>
                                        <input type="text" className="form-control rounded-4 shadow-none" id="price" placeholder="Enter price" />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <label htmlFor="date" className="form-label">Date</label>
                                        <input type="date" className="form-control rounded-4 shadow-none" id="date" placeholder="Enter date" />
                                    </div>
                                    <div className="col-12">
                                        {submitting ? (
                                            <button type='button' className="btn btn-success rounded-4 d-flex align-items-center gap-1" disabled><MdOutlineAddBox /> Creating...</button>
                                        ) : (
                                            <button type='submit' className="btn btn-success rounded-4 d-flex align-items-center gap-1"><MdOutlineAddBox /> Create Expense</button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Expenses List */}
                    <div className="card rounded-4 my-4">
                        <div className="card-header rounded-4">
                            <span className='fw-semibold'>Expenses List</span>
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
                                            <th className='text-nowrap' scope="col">Date</th>
                                            <th className='text-nowrap' scope="col">Comment</th>
                                            <th className='text-nowrap' scope="col">Price</th>
                                            <th className='text-end text-nowrap' scope="col">Operations</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expenses.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="text-center">No data to show...</td>
                                            </tr>
                                        ) : (
                                            expenses.map((expense, index) => (
                                                <tr key={expense.eid}>
                                                    <td className='text-nowrap'>{expense.eid}</td>
                                                    <td className='text-nowrap'>
                                                        {expense.date
                                                            ? new Date(expense.date).toLocaleDateString('en-GB', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: '2-digit'
                                                            })
                                                            : '-'}
                                                    </td>
                                                    <td className='text-nowrap'>{expense.comment}</td>
                                                    <td className='text-nowrap'>{expense.price}€</td>
                                                    <td className='text-end text-nowrap'>
                                                        <button onClick={() => checkEditExpense(expense.eid)} className="btn btn-success btn-sm shadow-sm me-2"><FaEdit size={20} /></button>
                                                        <button onClick={() => setDeleteId(expense.eid)} className="btn btn-danger btn-sm shadow-sm"><MdDeleteOutline size={20} /></button>
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

                    {/* Delete Expense */}
                    {deleteId && (
                        <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4 px-3" style={{ zIndex: 1050, width: '100%', maxWidth: '500px' }}>
                            <div className="bg-white shadow-lg rounded-4 p-3 border">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>Confirm deletion</strong>
                                        <p className="mb-0 small text-muted">Are you sure you want to delete this expense with <strong>#ID: {deleteId}</strong>?</p>
                                    </div>
                                    <button className="btn-close ms-2 shadow-none" onClick={() => setDeleteId(null)}></button>
                                </div>
                                <div className="d-flex justify-content-end mt-3">
                                    <button className="btn btn-light me-2" onClick={() => setDeleteId(null)}>Cancel</button>
                                    <button className="btn btn-danger" onClick={handleDelete}>Confirm</button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </Layout>
    )
}

export default Expenses