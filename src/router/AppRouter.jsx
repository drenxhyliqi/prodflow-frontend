import { BrowserRouter, Routes, Route } from "react-router-dom"
import Dashboard from "../pages/management/Dashboard"
import Companies from "../pages/management/Companies"
import Products from "../pages/management/Products"
import Materials from "../pages/management/Materials"
import Machines from "../pages/management/Machines"
import Production from "../pages/management/Production"
import Planification from "../pages/management/Planification"
import Login from "../pages/Login"

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
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter