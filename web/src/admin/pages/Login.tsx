import { useState, type FormEvent } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import logo from "../../assets/logo.jpeg"
import { useAdminAuth } from "../context/AdminAuthContext"

export function Login() {
  const { admin, loading, login } = useAdminAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && admin) {
    return <Navigate to="/admin" replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(username, password)
      navigate("/admin")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-cream px-4">
      <div className="flex flex-col items-center gap-1">
        <img src={logo} alt="Kool Fruits" className="h-16 w-16 rounded-full object-cover shadow-sm" />
        <h1 className="font-display text-xl font-bold text-forest">Kool Fruits Admin</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-bold text-forest">Username</span>
          <input
            required
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-bold text-forest">Password</span>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </label>

        {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-leaf py-3 text-base font-bold text-white shadow-md transition active:scale-[0.98] disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  )
}
