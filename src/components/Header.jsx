import React, { useState } from 'react'
import { FaAngleDown } from 'react-icons/fa6'
import { HiBuildingOffice2 } from 'react-icons/hi2'
import { LuMenu } from 'react-icons/lu'
import { PiUserFocusBold } from 'react-icons/pi'
import '../Global.css'

const Header = ({ menuVisible, setMenuVisible }) => {
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
                    <button className='btn btn-transparent border-0 txt-custom'>
                        <PiUserFocusBold size={28}/>
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header
