import React, { useState } from 'react'
import { FaAngleDown } from 'react-icons/fa6'
import { HiBuildingOffice2 } from 'react-icons/hi2'
import { LuMenu } from 'react-icons/lu'
import { PiSignOut, PiUserFocusBold } from 'react-icons/pi'
import api from '../api/axios'
import '../Global.css'
import { FaRegUserCircle } from 'react-icons/fa'
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

const Header = ({ menuVisible, setMenuVisible }) => {
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

    return (
        <header className='border-bottom bg-white'>
            <div className="d-flex justify-content-between align-items-center p-3">
                <div>
                    <button className='btn btn-transparent border-0 opacity-75' onClick={() => setMenuVisible(!menuVisible)}>
                        <LuMenu size={28}/>
                    </button>
                </div>
                <div>
                    <div className="d-inline dropdown-center me-2 d-none d-md-inline">
                        <button className='btn btn-transparent bg-secondary bg-opacity-25 border-0 rounded-3' type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <small className='d-flex align-items-center'><HiBuildingOffice2 size={18} className='me-2 txt-custom'/> Alpha Fabric <FaAngleDown className='ms-1'/></small>
                        </button>
                        <ul className="dropdown-menu shadow-sm rounded-4">
                            <li><button className="dropdown-item" type="button"><HiBuildingOffice2 size={18} className='me-2 txt-custom'/> Beta Fabric</button></li>
                            <li><button className="dropdown-item" type="button"><HiBuildingOffice2 size={18} className='me-2 txt-custom'/> Gamma Fabric</button></li>
                        </ul>
                    </div>
                    <div className="d-inline dropdown-end me-2 d-none d-md-inline">
                        <button className='btn btn-transparent border-0 opacity-75' type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <FaRegUserCircle size={28}/>
                        </button>
                        <ul className="dropdown-menu shadow-sm rounded-4">
                            <div className="pt-3 text-center">
                                <FaRegUserCircle size={40} />
                                <p className="mb-0 fw-semibold">{user ? JSON.parse(user).name : 'User'}</p>
                                <small>----------</small>
                            </div>
                            <li><button className="dropdown-item d-flex align-items-center justify-content-center" type="button"><PiUserFocusBold size={18} className='me-2 txt-custom'/> My Profile</button></li>
                            <li><button className="dropdown-item d-flex align-items-center justify-content-center mb-3" type="button" onClick={handleSignOut}><PiSignOut size={18} className='me-2 txt-custom'/> Sign Out</button></li>
                        </ul>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
