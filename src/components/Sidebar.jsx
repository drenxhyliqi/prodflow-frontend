import React from 'react'
import '../Global.css'
import { FaAngleDown, FaBoxesStacked, FaRegChartBar, FaTruckRampBox, FaWarehouse } from 'react-icons/fa6'
import { MdMiscellaneousServices, MdOutlineDashboard, MdOutlineShoppingCart } from 'react-icons/md'
import { HiBuildingOffice2 } from 'react-icons/hi2'
import prodflow from '../assets/img/prodflow.png';
import { AiOutlineClose } from 'react-icons/ai'
import { Link } from 'react-router-dom'
import { BsBoxes } from 'react-icons/bs'
import { IoSettingsOutline } from 'react-icons/io5'
import { LuCalendarCog, LuClipboardList } from 'react-icons/lu'
import { RiWallet3Line } from 'react-icons/ri'
import { CiDeliveryTruck } from 'react-icons/ci'
import { TbReportMoney, TbUsers, TbUserScan } from 'react-icons/tb'
import { GrNotes } from 'react-icons/gr'

const Sidebar = ({ menuVisible, setMenuVisible }) => {
    return (
        <aside className="aside text-light">
            <div className="p-3 bg-custom shadow-sm border-btm sticky-top">
                <div className="d-flex justify-content-between">
                    <img src={prodflow} alt="Prod Flow - Management System" className='logo'/>
                    <button className='btn bg-secondary btn-sm text-light bg-opacity-25 border-0 d-flex justify-content-center align-items-center d-md-none' onClick={() => setMenuVisible(!menuVisible)}>
                        <AiOutlineClose size={20}/>
                    </button>
                </div>
            </div>

            {/* Main */}
            <div className="p-2">
                <button id="sidebarToggle" type="button" data-bs-toggle="collapse" data-bs-target="#mainCollapse" aria-expanded="false" aria-controls="mainCollapse">
                    <div className="d-flex justify-content-between align-items-center p-2">
                        <span>Main</span>
                        <span><FaAngleDown /></span>
                    </div>
                </button>
                <div className="collapse show" id="mainCollapse">
                    <Link to="/" className="sidebar-link d-flex align-items-center"><MdOutlineDashboard size={18} className='ms-2 me-2'/> Dashboard</Link>
                    <Link to="/companies" className="sidebar-link d-flex align-items-center"><HiBuildingOffice2 size={18} className='ms-2 me-2'/> Companies</Link>
                </div>
            </div>

            {/* Production */}
            <div className="p-2">
                <button id="sidebarToggle" type="button" data-bs-toggle="collapse" data-bs-target="#productionCollapse" aria-expanded="false" aria-controls="productionCollapse">
                    <div className="d-flex justify-content-between align-items-center p-2">
                        <span>Production</span>
                        <span><FaAngleDown /></span>
                    </div>
                </button>
                <div className="collapse show" id="productionCollapse">
                    <a href="#" className="sidebar-link d-flex align-items-center"><BsBoxes size={18} className='ms-2 me-2'/> Products</a>
                    <a href="#" className="sidebar-link d-flex align-items-center"><FaBoxesStacked size={18} className='ms-2 me-2'/> Materials</a>
                    <a href="#" className="sidebar-link d-flex align-items-center"><IoSettingsOutline size={18} className='ms-2 me-2'/> Machines</a>
                    <a href="#" className="sidebar-link d-flex align-items-center"><FaTruckRampBox size={18} className='ms-2 me-2'/> Production</a>
                    <a href="#" className="sidebar-link d-flex align-items-center"><LuClipboardList size={18} className='ms-2 me-2'/> Planification</a>
                </div>
            </div>

            {/* Stock */}
            <div className="p-2">
                <button id="sidebarToggle" type="button" data-bs-toggle="collapse" data-bs-target="#stockCollapse" aria-expanded="false" aria-controls="stockCollapse">
                    <div className="d-flex justify-content-between align-items-center p-2">
                        <span>Stock</span>
                        <span><FaAngleDown /></span>
                    </div>
                </button>
                <div className="collapse show" id="stockCollapse">
                    <a href="#" className="sidebar-link d-flex align-items-center"><FaRegChartBar size={18} className='ms-2 me-2'/> Products Stock</a>
                    <a href="#" className="sidebar-link d-flex align-items-center"><FaRegChartBar  size={18} className='ms-2 me-2'/> Materials Stock</a>
                    <a href="#" className="sidebar-link d-flex align-items-center"><FaWarehouse size={18} className='ms-2 me-2'/> Warehouses</a>
                </div>
            </div>

            {/* Sales & Finance */}
            <div className="p-2">
                <button id="sidebarToggle" type="button" data-bs-toggle="collapse" data-bs-target="#salesFinanceCollapse" aria-expanded="false" aria-controls="salesFinanceCollapse">
                    <div className="d-flex justify-content-between align-items-center p-2">
                        <span>Sales & Finance</span>
                        <span><FaAngleDown /></span>
                    </div>
                </button>
                <div className="collapse show" id="salesFinanceCollapse">
                    <a href="#" className="sidebar-link d-flex align-items-center"><MdOutlineShoppingCart size={18} className='ms-2 me-2'/> Sales</a>
                    <a href="#" className="sidebar-link d-flex align-items-center"><RiWallet3Line size={18} className='ms-2 me-2'/> Expenses</a>
                    <a href="#" className="sidebar-link d-flex align-items-center"><CiDeliveryTruck size={18} className='ms-2 me-2'/> Suppliers</a>
                </div>
            </div>

            {/* Human Resources */}
            <div className="p-2">
                <button id="sidebarToggle" type="button" data-bs-toggle="collapse" data-bs-target="#humanResourcesCollapse" aria-expanded="false" aria-controls="humanResourcesCollapse">
                    <div className="d-flex justify-content-between align-items-center p-2">
                        <span>Human Resources</span>
                        <span><FaAngleDown /></span>
                    </div>
                </button>
                <div className="collapse show" id="humanResourcesCollapse">
                    <a href="#" className="sidebar-link d-flex align-items-center"><TbUsers size={18} className='ms-2 me-2'/> Employees</a>
                    <a href="#" className="sidebar-link d-flex align-items-center"><TbUserScan size={18} className='ms-2 me-2'/> Users</a>
                    <a href="#" className="sidebar-link d-flex align-items-center"><TbReportMoney size={18} className='ms-2 me-2'/> Salaries</a>
                    <a href="#" className="sidebar-link d-flex align-items-center"><GrNotes size={18} className='ms-2 me-2'/> Contracts</a>
                    <a href="#" className="sidebar-link d-flex align-items-center"><LuCalendarCog size={18} className='ms-2 me-2'/> Vocations</a>
                </div>
            </div>

            {/* Maintenance */}
            <div className="p-2 mb-0 mb-md-3 mb-lg-3">
                <button id="sidebarToggle" type="button" data-bs-toggle="collapse" data-bs-target="#maintenanceCollapse" aria-expanded="false" aria-controls="maintenanceCollapse">
                    <div className="d-flex justify-content-between align-items-center p-2">
                        <span>Maintenance</span>
                        <span><FaAngleDown /></span>
                    </div>
                </button>
                <div className="collapse show" id="maintenanceCollapse">
                    <a href="#" className="sidebar-link d-flex align-items-center"><MdMiscellaneousServices size={18} className='ms-2 me-2'/> Maintenance</a>
                </div>
            </div>

            {/* Companies in SM */}
            <div className="p-2 mb-3 d-md-none d-lg-none">
                <button id="sidebarToggle" type="button" data-bs-toggle="collapse" data-bs-target="#companiesInSMCollapse" aria-expanded="false" aria-controls="companiesInSMCollapse">
                    <div className="d-flex justify-content-between align-items-center p-2">
                        <span>Companies</span>
                        <span><FaAngleDown /></span>
                    </div>
                </button>
                <div className="collapse show" id="companiesInSMCollapse">
                    <a href="#" className="sidebar-link d-flex align-items-center"><HiBuildingOffice2 size={18} className='ms-2 me-2'/> Alpha Fabric</a>
                    <a href="#" className="sidebar-link d-flex align-items-center"><HiBuildingOffice2 size={18} className='ms-2 me-2'/> Beta Fabric</a>
                    <a href="#" className="sidebar-link d-flex align-items-center"><HiBuildingOffice2 size={18} className='ms-2 me-2'/> Gamma Fabric</a>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
