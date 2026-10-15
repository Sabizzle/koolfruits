import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { api } from "../api/client"
import type { BusinessConfig, DeliveryArea, Product } from "../types"

interface AppData {
  config: BusinessConfig | null
  products: Product[]
  areas: DeliveryArea[]
  loading: boolean
  error: string | null
  retry: () => void
}

const AppDataContext = createContext<AppData | undefined>(undefined)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<BusinessConfig | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [areas, setAreas] = useState<DeliveryArea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([api.getConfig(), api.getProducts(), api.getDeliveryAreas()])
      .then(([configRes, productsRes, areasRes]) => {
        if (cancelled) return
        setConfig(configRes)
        setProducts(productsRes)
        setAreas(areasRes)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Could not load the menu. Please try again.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [attempt])

  const retry = () => setAttempt((a) => a + 1)

  return (
    <AppDataContext.Provider value={{ config, products, areas, loading, error, retry }}>
      {children}
    </AppDataContext.Provider>
  )
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider")
  return ctx
}
