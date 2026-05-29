import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import AiChatWidget from "../components/AiChatWidget"
import Dashboard from "../pages/management/Dashboard"
import Companies from "../pages/management/Companies"
import Products from "../pages/management/Products"
import Materials from "../pages/management/Materials"
import MaterialsStock from "../pages/management/MaterialsStock"
import Machines from "../pages/management/Machines"
import Production from "../pages/management/Production"
import Staff from "../pages/management/Staff"
import Planification from "../pages/management/Planification"
import Clients from "../pages/management/Clients"
import Sales from "../pages/management/sales/Sales"
import Expenses from "../pages/management/Expenses"
import Suppliers from "../pages/management/Suppliers"
import Login from "../pages/Login"
import Profile from "../pages/management/Profile"
import Users from "../pages/management/Users"
import Warehouses from "../pages/management/Warehouses"
import Maintenances from "../pages/management/Maintenances"
import CreateSales from "../pages/management/sales/CreateSales"
import SalesInvoice from "../pages/management/sales/SalesInvoice"
import EditSales from "../pages/management/sales/EditSales"
import ProductsStock from "../pages/management/ProductsStock"
import Vacations from "../pages/management/Vacations"
import Contracts from "../pages/management/Contracts"
import Salaries from "../pages/management/Salaries"
import ExpensesReport from "../pages/management/reports/ExpensesReport"
import SalesReport from "../pages/management/reports/SalesReport"
import ProductionReport from "../pages/management/reports/ProductionReport"
import Orders from "../pages/management/Orders"
import NotFound from "../pages/NotFound"
import MaterialsStockReport from "../pages/management/reports/MaterialStockReport"
import ReportsHub from "../pages/management/reports/ReportsHub"
import Trucks from "../pages/management/Trucks"
import AccpetInvite from "../pages/management/AccpetInvite"
import Signup from "../pages/Signup"

const PersistentWidgets = () => {
  const { pathname } = useLocation();
  if (pathname === "/" || pathname === "/login") return null;
  return <AiChatWidget />;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/products" element={<Products />} />
        <Route path="/materials" element={<Materials />} />
        <Route path="/products_stock" element={<ProductsStock />} />
        <Route path="/materials_stock" element={<MaterialsStock />} />
        <Route path="/machines" element={<Machines />} />
        <Route path="/warehouses"element={<Warehouses />} />
        <Route path="/maintenances" element={<Maintenances />} />
        <Route path="/contracts" element={<Contracts />} />
        <Route path="/production" element={<Production />} />
        <Route path="/planification" element={<Planification />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/users" element={<Users />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/salesInvoice/:sale_number" element={<SalesInvoice />} />
        <Route path="/editSale/:sale_number" element={<EditSales />} />
        <Route path="/createSale" element={<CreateSales />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/trucks" element={<Trucks />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/vacations" element={<Vacations />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/salaries" element={<Salaries />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/reports" element={<ReportsHub />} />
        <Route path="/expensesReport" element={<ExpensesReport />} />
        <Route path="/salesReport" element={<SalesReport />} />
        <Route path="/productionReport" element={<ProductionReport />} />
        <Route path="/materialsStockReport" element={<MaterialsStockReport />} />
        <Route path="/accept-invite" element={<AccpetInvite />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <PersistentWidgets />
    </BrowserRouter>
  )
}

export default AppRouter