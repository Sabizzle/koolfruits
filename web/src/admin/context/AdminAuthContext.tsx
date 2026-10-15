import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { ApiError } from "../../api/client"
import { adminApi } from "../api"
import type { AdminUser } from "../../types"

interface AdminAuthApi {
  admin: AdminUser | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthApi | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi
      .me()
      .then(setAdmin)
      .catch(() => setAdmin(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const user = await adminApi.login(username, password)
      setAdmin(user)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        throw new Error("Incorrect username or password.")
      }
      throw err
    }
  }

  const logout = async () => {
    await adminApi.logout()
    setAdmin(null)
  }

  return <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider")
  return ctx
}
