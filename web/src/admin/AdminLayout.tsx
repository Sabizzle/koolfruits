import { NavLink, Outlet, useNavigate } from "react-router-dom"
import logo from "../assets/logo.jpeg"
import { useAdminAuth } from "./context/AdminAuthContext"
import { AdminOrdersProvider, useAdminOrders } from "./context/AdminOrdersContext"

function NavTab({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `rounded-full px-4 py-2 text-sm font-bold transition ${
          isActive ? "bg-leaf text-white" : "text-forest hover:bg-leaf/10"
        }`
      }
    >
      {children}
    </NavLink>
  )
}

function Chrome() {
  const { admin, logout } = useAdminAuth()
  const { newOrderCount, clearNewOrderBadge } = useAdminOrders()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-cream">
      <header className="flex items-center gap-3 border-b border-black/5 bg-white px-3 py-3">
        <img src={logo} alt="Kool Fruits" className="h-9 w-9 shrink-0 rounded-full object-cover" />

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          <div onClick={clearNewOrderBadge}>
            <NavTab to="/admin">
              Board
              {newOrderCount > 0 && (
                <span className="ml-1.5 rounded-full bg-pineapple px-1.5 py-0.5 text-xs text-forest">
                  {newOrderCount}
                </span>
              )}
            </NavTab>
          </div>
          <NavTab to="/admin/today">Today</NavTab>
          <NavTab to="/admin/customers">Customers</NavTab>
          <NavTab to="/admin/sales">Sales</NavTab>
          <NavTab to="/admin/products">Products</NavTab>
          <NavTab to="/admin/areas">Areas</NavTab>
          <NavTab to="/admin/orders/new">+ New order</NavTab>
        </nav>

        <div className="flex shrink-0 items-center gap-3 text-sm text-gray-500">
          <span className="hidden sm:inline">{admin?.username}</span>
          <button
            type="button"
            onClick={() => {
              void logout().then(() => navigate("/admin/login"))
            }}
            className="rounded-full border border-black/10 px-3 py-1.5 font-bold text-forest"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="p-3 sm:p-4">
        <Outlet />
      </main>
    </div>
  )
}

export function AdminLayout() {
  return (
    <AdminOrdersProvider>
      <Chrome />
    </AdminOrdersProvider>
  )
}
