import { useEffect, useState } from "react"

export interface SavedCustomerInfo {
  customerName: string
  customerPhone: string
  deliveryAreaId: number | ""
  streetAddress: string
  landmarkDirections: string
}

const STORAGE_KEY = "koolfruits.customerInfo"

const empty: SavedCustomerInfo = {
  customerName: "",
  customerPhone: "",
  deliveryAreaId: "",
  streetAddress: "",
  landmarkDirections: "",
}

function load(): SavedCustomerInfo {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return empty
    return { ...empty, ...JSON.parse(raw) }
  } catch {
    return empty
  }
}

export function useReturningCustomer() {
  const [info, setInfo] = useState<SavedCustomerInfo>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(info))
    } catch {
      // storage unavailable (private browsing, etc.) — not critical
    }
  }, [info])

  return [info, setInfo] as const
}
