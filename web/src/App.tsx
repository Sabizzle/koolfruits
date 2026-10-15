import { Outlet, Route, Routes } from "react-router-dom"
import { AdminLayout } from "./admin/AdminLayout"
import { AdminAuthProvider } from "./admin/context/AdminAuthContext"
import { Areas } from "./admin/pages/Areas"
import { Board } from "./admin/pages/Board"
import { Customers } from "./admin/pages/Customers"
import { Login } from "./admin/pages/Login"
import { NewOrder } from "./admin/pages/NewOrder"
import { Products } from "./admin/pages/Products"
import { Sales } from "./admin/pages/Sales"
import { Today } from "./admin/pages/Today"
import { RequireAdmin } from "./admin/RequireAdmin"
import { Checkout } from "./pages/Checkout"
import { Confirmation } from "./pages/Confirmation"
import { Home } from "./pages/Home"
import { NotFound } from "./pages/NotFound"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/confirmation/:orderNumber" element={<Confirmation />} />

      <Route
        path="/admin"
        element={
          <AdminAuthProvider>
            <Outlet />
          </AdminAuthProvider>
        }
      >
        <Route path="login" element={<Login />} />
        <Route
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<Board />} />
          <Route path="today" element={<Today />} />
          <Route path="customers" element={<Customers />} />
          <Route path="sales" element={<Sales />} />
          <Route path="products" element={<Products />} />
          <Route path="areas" element={<Areas />} />
          <Route path="orders/new" element={<NewOrder />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
