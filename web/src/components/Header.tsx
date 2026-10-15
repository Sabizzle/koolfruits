import logo from "../assets/logo.jpeg"
import { useAppData } from "../context/AppDataContext"

export function Header() {
  const { config } = useAppData()

  return (
    <header className="flex flex-col items-center gap-1 bg-cream px-4 pt-6 pb-4 text-center">
      <img
        src={logo}
        alt={config?.name ?? "Kool Fruits"}
        className="h-32 w-32 rounded-full object-cover shadow-sm"
      />
      <h1 className="font-display text-2xl font-bold text-forest">{config?.name ?? "Kool Fruits"}</h1>
      <p className="text-sm font-medium tracking-wide text-leaf-dark uppercase">
        {config?.tagline ?? "Fresh • Tropical • Natural"}
      </p>
    </header>
  )
}
