import { BrowserRouter, Routes, Route } from "react-router-dom"
import Dashboard from "../pages/management/Dashboard"
import Companies from "../pages/management/Companies"

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/companies" element={<Companies />} />
        {/* <Route path="/products" element={<Products />} />
        <Route path="/materials" element={<Materials />} />
        <Route path="/machines" element={<Machines />} />
        <Route path="/planification" element={<Planification />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/sales" element={<Sales />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter