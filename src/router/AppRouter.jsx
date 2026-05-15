import { BrowserRouter, Routes, Route } from "react-router-dom"
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
import Sales from "../pages/management/Sales"
import Expenses from "../pages/management/Expenses"
import Suppliers from "../pages/management/Suppliers"
import Login from "../pages/Login"
import Profile from "../pages/management/Profile"
import Users from "../pages/management/Users"
import Warehouses from "../pages/management/Warehouses"
import Maintenances from "../pages/management/Maintenances"
import CreateSales from "../pages/management/CreateSales"
import SalesInvoice from "../pages/management/SalesInvoice"
import EditSales from "../pages/management/EditSales"
import ProductsStock from "../pages/management/ProductsStock"

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
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter