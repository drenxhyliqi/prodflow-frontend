import React, { useEffect, useState } from 'react'
import '../Global.css'
import { FaAngleDown, FaBoxesStacked, FaRegChartBar, FaTruckRampBox, FaUsers, FaWarehouse } from 'react-icons/fa6'
import { MdMiscellaneousServices, MdOutlineDashboard, MdOutlineShoppingCart } from 'react-icons/md'
import { HiBuildingOffice2 } from 'react-icons/hi2'
import prodflow from '../assets/img/prodflow_logo.png'
import { AiOutlineClose } from 'react-icons/ai'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { BsBoxes } from 'react-icons/bs'
import { IoSettingsOutline } from 'react-icons/io5'
import { LuCalendarCog, LuClipboardList } from 'react-icons/lu'
import { RiWallet3Line } from 'react-icons/ri'
import { CiDeliveryTruck } from 'react-icons/ci'
import { TbReport, TbReportMoney, TbUsers, TbUserScan } from 'react-icons/tb'
import { GrNotes } from 'react-icons/gr'
import api from '../api/axios.jsx'
import { PiInvoice } from 'react-icons/pi'

const Sidebar = ({ menuVisible, setMenuVisible }) => {
    const navigate = useNavigate()
    const location = useLocation()
    const [role, setRole] = useState(null)

    useEffect(() => {
        api.get('/me')
            .then((res) => {
                setRole(res.data.role)
            })
            .catch((error) => {
                if (error.response?.status === 401 || error.response?.status === 403) {
                    localStorage.removeItem('token')
                    navigate('/404')
                }
            })
    }, [navigate])

    const isAdmin = role === 'admin'

    const reportPages = [
        '/reports',
        '/productionReport',
        '/salesReport',
        '/expensesReport',
        '/materialsStockReport',
    ]

    const adminOnlyPages = [
        '/companies',
        '/products_stock',
        '/expenses',
        '/users',
        ...reportPages,
    ]

    const isReportsArea = reportPages.includes(location.pathname)

    useEffect(() => {
        if (
            role &&
            adminOnlyPages.includes(location.pathname) &&
            role !== 'admin'
        ) {
            navigate('/404')
        }
    }, [role, location.pathname, navigate])

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

            <div className="p-2">
                <button id="sidebarToggle" type="button" data-bs-toggle="collapse" data-bs-target="#mainCollapse">
                    <div className="d-flex justify-content-between align-items-center p-2">
                        <span>Main</span>
                        <span><FaAngleDown /></span>
                    </div>
                </button>
                <div className="collapse show" id="mainCollapse">
                    <NavLink to="/dashboard" className={({ isActive }) => "sidebar-link d-flex align-items-center" + (isActive ? " sidebar-link-active" : "")}><MdOutlineDashboard size={18} className='ms-2 me-2'/> Dashboard</NavLink>
                    {isAdmin && (
                        <NavLink to="/companies" className={({ isActive }) => "sidebar-link d-flex align-items-center" + (isActive ? " sidebar-link-active" : "")}><HiBuildingOffice2 size={18} className='ms-2 me-2'/> Companies</NavLink>
                    )}
                </div>
            </div>

            <div className="p-2">
                <button id="sidebarToggle" type="button" data-bs-toggle="collapse" data-bs-target="#productionCollapse">
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

            <div className="p-2">
                <button id="sidebarToggle" type="button" data-bs-toggle="collapse" data-bs-target="#stockCollapse">
                    <div className="d-flex justify-content-between align-items-center p-2">
                        <span>Stock</span>
                        <span><FaAngleDown /></span>
                    </div>
                </button>
                <div className="collapse show" id="stockCollapse">
                    {isAdmin && (
                        <NavLink to="/products_stock" className={({ isActive }) => "sidebar-link d-flex align-items-center" + (isActive ? " sidebar-link-active" : "")}><FaRegChartBar size={18} className='ms-2 me-2'/> Products Stock</NavLink>
                    )}

                    <NavLink to="/materials_stock" className={({ isActive }) => "sidebar-link d-flex align-items-center" + (isActive ? " sidebar-link-active" : "")}><FaRegChartBar size={18} className='ms-2 me-2'/> Materials Stock</NavLink>
                    <NavLink to="/warehouses" className={({ isActive }) => "sidebar-link d-flex align-items-center" + (isActive ? " sidebar-link-active" : "")}><FaWarehouse size={18} className='ms-2 me-2'/> Warehouses</NavLink>
                </div>
            </div>

            <div className="p-2">
                <button id="sidebarToggle" type="button" data-bs-toggle="collapse" data-bs-target="#salesFinanceCollapse">
                    <div className="d-flex justify-content-between align-items-center p-2">
                        <span>Sales & Finance</span>
                        <span><FaAngleDown /></span>
                    </div>
                </button>
                <div className="collapse show" id="salesFinanceCollapse">
                    <NavLink to="/clients" className={({ isActive }) => "sidebar-link d-flex align-items-center" + (isActive ? " sidebar-link-active" : "")}><FaUsers size={18} className='ms-2 me-2'/> Clients</NavLink>
                    <NavLink to="/orders" className={({ isActive }) => "sidebar-link d-flex align-items-center" + (isActive ? " sidebar-link-active" : "")}><PiInvoice size={18} className='ms-2 me-2'/> Orders</NavLink>
                    <NavLink to="/sales" className={({ isActive }) => "sidebar-link d-flex align-items-center" + (isActive ? " sidebar-link-active" : "")}><MdOutlineShoppingCart size={18} className='ms-2 me-2'/> Sales</NavLink>

                    {isAdmin && (
                        <NavLink to="/expenses" className={({ isActive }) => "sidebar-link d-flex align-items-center" + (isActive ? " sidebar-link-active" : "")}><RiWallet3Line size={18} className='ms-2 me-2'/> Expenses</NavLink>
                    )}

                    <NavLink to="/suppliers" className={({ isActive }) => "sidebar-link d-flex align-items-center" + (isActive ? " sidebar-link-active" : "")}><FaTruckRampBox size={18} className='ms-2 me-2'/> Suppliers</NavLink>
                    <NavLink to="/trucks" className={({ isActive }) => "sidebar-link d-flex align-items-center" + (isActive ? " sidebar-link-active" : "")}><CiDeliveryTruck size={18} className='ms-2 me-2'/> Trucks</NavLink>
                </div>
            </div>

            <div className="p-2">
                <button id="sidebarToggle" type="button" data-bs-toggle="collapse" data-bs-target="#humanResourcesCollapse">
                    <div className="d-flex justify-content-between align-items-center p-2">
                        <span>Human Resources</span>
                        <span><FaAngleDown /></span>
                    </div>
                </button>
                <div className="collapse show" id="humanResourcesCollapse">
                    <NavLink to="/staff" className={({ isActive }) => "sidebar-link d-flex align-items-center" + (isActive ? " sidebar-link-active" : "")}><TbUsers size={18} className='ms-2 me-2'/> Staff</NavLink>

                    {isAdmin && (
                        <NavLink to="/users" className={({ isActive }) => "sidebar-link d-flex align-items-center" + (isActive ? " sidebar-link-active" : "")}><TbUserScan size={18} className='ms-2 me-2'/> Users</NavLink>
                    )}

                    <NavLink to="/salaries" className={({ isActive }) => "sidebar-link d-flex align-items-center" + (isActive ? " sidebar-link-active" : "")}><TbReportMoney size={18} className='ms-2 me-2'/> Salaries</NavLink>
                    <NavLink to="/vacations" className={({ isActive }) => "sidebar-link d-flex align-items-center" + (isActive ? " sidebar-link-active" : "")}><LuCalendarCog size={18} className='ms-2 me-2'/> Vacations</NavLink>
                    <NavLink to="/contracts" className={({ isActive }) => "sidebar-link d-flex align-items-center" + (isActive ? " sidebar-link-active" : "")}><GrNotes size={18} className='ms-2 me-2'/> Contracts</NavLink>
                </div>
            </div>

            <div className="p-2">
                <button id="sidebarToggle" type="button" data-bs-toggle="collapse" data-bs-target="#maintenanceCollapse">
                    <div className="d-flex justify-content-between align-items-center p-2">
                        <span>Maintenance</span>
                        <span><FaAngleDown /></span>
                    </div>
                </button>
                <div className="collapse show" id="maintenanceCollapse">
                    <NavLink to="/maintenances" className={({ isActive }) => "sidebar-link d-flex align-items-center" + (isActive ? " sidebar-link-active" : "")}><MdMiscellaneousServices size={18} className='ms-2 me-2'/> Maintenance</NavLink>
                </div>
            </div>

            {isAdmin && (
                <div className="p-2 mb-0 mb-md-3 mb-lg-3">
                    <NavLink
                        to="/reports"
                        className={'sidebar-link d-flex align-items-center' + (isReportsArea ? ' sidebar-link-active' : '')}
                    >
                        <TbReport size={18} className="ms-2 me-2" /> Reports
                    </NavLink>
                </div>
            )}
        </aside>
    )
}

export default Sidebar