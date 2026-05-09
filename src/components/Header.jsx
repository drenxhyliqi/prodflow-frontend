import React, { useEffect, useState } from 'react'
import { FaAngleDown } from 'react-icons/fa6'
import { HiBuildingOffice2 } from 'react-icons/hi2'
import { LuMenu } from 'react-icons/lu'
import { PiSignOut, PiUserFocusBold } from 'react-icons/pi'
import api from '../api/axios'
import '../Global.css'
import { FaRegUserCircle } from 'react-icons/fa'
import { toast } from 'react-toastify';
import { Link, useNavigate } from "react-router-dom";

const Header = ({ menuVisible, setMenuVisible }) => {
    const [allCompanies, setAllCompanies] = useState([]);
    const [activeCompany, setActiveC] = useState(null);
    const navigate = useNavigate();
    const user = localStorage.getItem('user') ?? null;

    // Sign Out
    const handleSignOut = async () => {
        try {
            await api.post('/logout')
                .then(response => {
                    toast.success(response.data.message || 'Successfully signed out.');
                    localStorage.clear();
                    navigate('/');
                })
                .catch(error => {
                    toast.error(error.response?.data?.message || 'Sign out failed');
                })
        } catch (error) {
            toast.error(error);
            localStorage.clear();
            navigate('/');
        }
    };

    // Read Companies
    function getCompanies() {
        let url = `/admin/all_companies`;
        api.get(url)
            .then(response => {
                setAllCompanies(response.data);
            })
            .catch(() => {
                toast.error('Failed to fetch companies.');
            });
    }

    // Active Company
    function getActiveCompany() {
        let url = `/admin/active_company`;
        api.get(url)
            .then(response => {
                setActiveC(response.data);
                localStorage.setItem('active_company_id', response.data);
            })
            .catch(() => {
                toast.error('Failed to fetch active company.');
            });
    }

    // Activate Company
    function setActiveCompany(id) {
        api.post(`/admin/set_active_company/${id}`)
            .then(() => {
                const company = allCompanies.find(c => c.cid === id);
                setActiveC(id);
                localStorage.setItem('active_company_id', id);
                localStorage.setItem('active_company_name', company?.name || '');
                window.dispatchEvent(new CustomEvent('company-changed', {
                    detail: { companyId: id, companyName: company?.name || '' }
                }));
                navigate('/dashboard');
            })
            .catch(() => {
                toast.error('Failed to set active company.');
            });
    }

    useEffect(() => {
        getCompanies();
        getActiveCompany();
    }, []);

    return (
        <header className='border-bottom bg-white'>
            <div className="d-flex justify-content-between align-items-center p-3">
                <div>
                    <button className='btn btn-transparent border-0 opacity-75' onClick={() => setMenuVisible(!menuVisible)}>
                        <LuMenu size={28}/>
                    </button>
                </div>
                <div>
                    <div className="d-inline me-2 d-none d-md-inline">
                        <select className="rounded-4 shadow-sm py-1 px-3 bg-light border-secondary" value={activeCompany || ''} onChange={(e) => setActiveCompany(parseInt(e.target.value))}>
                            {allCompanies.length === 0 ? (
                                <option value="">Prod Flow</option>
                            ) : (
                                allCompanies.map((cmp) => (
                                    <option key={cmp.cid} value={cmp.cid}>{cmp.name}</option>
                                ))
                            )}
                        </select>
                    </div>
                    <div className="d-inline dropdown-end me-2 d-none d-md-inline">
                        <button className='btn btn-transparent border-0 opacity-75' type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <FaRegUserCircle size={28}/>
                        </button>
                        <ul className="dropdown-menu shadow-sm rounded-4">
                            <div className="pt-3 text-center">
                                <FaRegUserCircle size={40} />
                                <p className="mb-0 fw-semibold">{user ? JSON.parse(user).user : 'User'}</p>
                                <small>----------</small>
                            </div>
                            <li><Link to='/profile' className="dropdown-item d-flex align-items-center justify-content-center" type="button"><PiUserFocusBold size={18} className='me-2 txt-custom'/> My Profile</Link></li>
                            <li><button className="dropdown-item d-flex align-items-center justify-content-center mb-3" type="button" onClick={handleSignOut}><PiSignOut size={18} className='me-2 txt-custom'/> Sign Out</button></li>
                        </ul>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
