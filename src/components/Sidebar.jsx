import React from 'react'
import '../Global.css'
import { FaAngleDown, FaBoxesStacked, FaRegChartBar, FaTruckRampBox, FaUsers, FaWarehouse } from 'react-icons/fa6'
import { MdMiscellaneousServices, MdOutlineDashboard, MdOutlineShoppingCart } from 'react-icons/md'
import { HiBuildingOffice2 } from 'react-icons/hi2'
import prodflow from '../assets/img/prodflow_logo.png';
import { AiOutlineClose } from 'react-icons/ai'
import { Link, NavLink } from 'react-router-dom'
import { BsBoxes } from 'react-icons/bs'
import { IoSettingsOutline } from 'react-icons/io5'
import { LuCalendarCog, LuClipboardList } from 'react-icons/lu'
import { RiWallet3Line } from 'react-icons/ri'
import { CiDeliveryTruck } from 'react-icons/ci'
import { TbReport, TbReportMoney, TbUsers, TbUserScan } from 'react-icons/tb'
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
                    <NavLink to="/dashboard" className={({ isActive }) => "sidebar-link d-flex align-items-center" + (isActive ? " sidebar-link-active" : "")}><MdOutlineDashboard size={18} className='ms-2 me-2'/> Dashboard</NavLink>
                    <NavLink to="/companies" className={({ isActive }) => "sidebar-link d-flex align-items-center" + (isActive ? " sidebar-link-active" : "")}><HiBuildingOffice2 size={18} className='ms-2 me-2'/> Companies</NavLink>
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
                    <NavLink to="/products" className={({ isActive }) => "sidebar-link d-flex align-items-center" + (isActive ? " sidebar-link-active" : "")}><BsBoxes size={18} className='ms-2 me-2'/> Products</NavLink>
                    <NavLink to="/materials" className={({ isActive }) => "sidebar-link d-flex align-items-center" + (isActive ? " sidebar-link-active" : "")}><FaBoxesStacked size={18} className='ms-2 me-2'/> Materials</NavLink>
                    <NavLink to="/machines" className={({ isActive }) => "sidebar-link d-flex align-items-center" + (isActive ? " sidebar-link-active" : "")}><IoSettingsOutline size={18} className='ms-2 me-2'/> Machines</NavLink>
                    <NavLink to="/production" className={({ isActive }) => "sidebar-link d-flex align-items-center" + (isActive ? " sidebar-link-active" : "")}><FaTruckRampBox size={18} className='ms-2 me-2'/> Production</NavLink>
                    <NavLink to="/planification" className={({ isActive }) => "sidebar-link d-flex align-items-center" + (isActive ? " sidebar-link-active" : "")}><LuClipboardList size={18} className='ms-2 me-2'/> Planification</NavLink>
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
                    <NavLink to="#" className="sidebar-link d-flex align-items-center"><FaRegChartBar size={18} className='ms-2 me-2'/> Products Stock</NavLink>
                    <NavLink to="/materials_stock" className="sidebar-link d-flex align-items-center"><FaRegChartBar  size={18} className='ms-2 me-2'/> Materials Stock</NavLink>
                    <NavLink to="/warehouses" className={({ isActive }) => "sidebar-link d-flex align-items-center" + (isActive ? " sidebar-link-active" : "")}><FaWarehouse size={18} className='ms-2 me-2'/> Warehouses</NavLink>               </div>
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
                    <NavLink to="/clients" className={({ isActive }) => "sidebar-link d-flex align-items-center" + (isActive ? " sidebar-link-active" : "")}><FaUsers size={18} className='ms-2 me-2'/> Clients</NavLink>
                    <NavLink to="/sales" className={({ isActive }) => "sidebar-link d-flex align-items-center" + (isActive ? " sidebar-link-active" : "")}><MdOutlineShoppingCart size={18} className='ms-2 me-2'/>Sales</NavLink>
                    <NavLink to="/expenses" className={({ isActive }) => "sidebar-link d-flex align-items-center" + (isActive ? " sidebar-link-active" : "")}><RiWallet3Line size={18} className='ms-2 me-2'/> Expenses</NavLink>
                    <NavLink to="/suppliers" className={({ isActive }) => "sidebar-link d-flex align-items-center" + (isActive ? " sidebar-link-active" : "")}><CiDeliveryTruck size={18} className='ms-2 me-2'/> Suppliers</NavLink>
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
                    <NavLink to="/staff" className="sidebar-link d-flex align-items-center"><TbUsers size={18} className='ms-2 me-2'/> Staff</NavLink>
                    <NavLink to="/users" className="sidebar-link d-flex align-items-center"><TbUserScan size={18} className='ms-2 me-2'/> Users</NavLink>
                    <NavLink to="#" className="sidebar-link d-flex align-items-center"><TbReportMoney size={18} className='ms-2 me-2'/> Salaries</NavLink>
                    <NavLink to="#" className="sidebar-link d-flex align-items-center"><GrNotes size={18} className='ms-2 me-2'/> Contracts</NavLink>
                    <NavLink to="#" className="sidebar-link d-flex align-items-center"><LuCalendarCog size={18} className='ms-2 me-2'/> Vocations</NavLink>
                </div>
            </div>

            {/* Maintenance */}
            <div className="p-2">
                <button id="sidebarToggle" type="button" data-bs-toggle="collapse" data-bs-target="#maintenanceCollapse" aria-expanded="false" aria-controls="maintenanceCollapse">
                    <div className="d-flex justify-content-between align-items-center p-2">
                        <span>Maintenance</span>
                        <span><FaAngleDown /></span>
                    </div>
                </button>
                <div className="collapse show" id="maintenanceCollapse">
                    <NavLink to="#" className="sidebar-link d-flex align-items-center"><MdMiscellaneousServices size={18} className='ms-2 me-2'/> Maintenance</NavLink>
                </div>
            </div>

            {/* Reports */}
            <div className="p-2 mb-0 mb-md-3 mb-lg-3">
                <button id="sidebarToggle" type="button" data-bs-toggle="collapse" data-bs-target="#reportsCollapse" aria-expanded="false" aria-controls="reportsCollapse">
                    <div className="d-flex justify-content-between align-items-center p-2">
                        <span>Reports</span>
                        <span><FaAngleDown /></span>
                    </div>
                </button>
                <div className="collapse show" id="reportsCollapse">
                    <NavLink to="#" className="sidebar-link d-flex align-items-center"><TbReport size={18} className='ms-2 me-2'/> Production Report</NavLink>
                    <NavLink to="#" className="sidebar-link d-flex align-items-center"><TbReport size={18} className='ms-2 me-2'/> Sales Report</NavLink>
                    <NavLink to="#" className="sidebar-link d-flex align-items-center"><TbReport size={18} className='ms-2 me-2'/> Expenses Report</NavLink>
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
                    <NavLink to="#" className="sidebar-link d-flex align-items-center"><HiBuildingOffice2 size={18} className='ms-2 me-2'/> Alpha Fabric</NavLink>
                    <NavLink to="#" className="sidebar-link d-flex align-items-center"><HiBuildingOffice2 size={18} className='ms-2 me-2'/> Beta Fabric</NavLink>
                    <NavLink to="#" className="sidebar-link d-flex align-items-center"><HiBuildingOffice2 size={18} className='ms-2 me-2'/> Gamma Fabric</NavLink>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
