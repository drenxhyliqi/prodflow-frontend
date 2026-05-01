import { BrowserRouter, Routes, Route } from "react-router-dom"
import Dashboard from "../pages/management/Dashboard"
import Companies from "../pages/management/Companies"
import Products from "../pages/management/Products"
import Materials from "../pages/management/Materials"
import Machines from "../pages/management/Machines"
import Production from "../pages/management/Production"
import Staff from "../pages/management/Staff"
import Planification from "../pages/management/Planification"
import Clients from "../pages/management/Clients"
import Expenses from "../pages/management/Expenses"
import Suppliers from "../pages/management/Suppliers"
import Login from "../pages/Login"
import Profile from "../pages/management/Profile"
import Users from "../pages/management/Users"

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/products" element={<Products />} />
        <Route path="/materials" element={<Materials />} />
        <Route path="/machines" element={<Machines />} />
        <Route path="/production" element={<Production />} />
        <Route path="/planification" element={<Planification />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/users" element={<Users />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter