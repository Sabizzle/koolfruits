import { Link } from "react-router-dom"

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-4 text-center">
      <h1 className="font-display text-2xl font-bold text-forest">Page not found</h1>
      <p className="text-gray-500">That page doesn't exist.</p>
      <Link to="/" className="rounded-full bg-leaf px-5 py-2.5 text-sm font-bold text-white">
        Back to menu
      </Link>
    </div>
  )
}
