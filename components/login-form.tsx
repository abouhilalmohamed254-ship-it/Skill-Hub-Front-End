"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { XSquare } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function LoginForm({
  setShowLoginForm,
}: {
  setShowLoginForm: (v: boolean) => void
}) {
  const router = useRouter()
  const supabase = createClient()

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [inputs, setInputs] = useState({ email: "", password: "" })

  function handleInputs(e: React.ChangeEvent<HTMLInputElement>) {
    setInputs({ ...inputs, [e.target.name]: e.target.value })
  }

  async function handleLogin() {
    setLoading(true)
    setError("")
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: inputs.email,
      password: inputs.password,
    })
    setLoading(false)

    if (authError) {
      setError("Invalid email or password")
      return
    }

    setShowLoginForm(false)
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <div className="relative w-full max-w-md bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-black rounded-2xl shadow-2xl p-8 sm:p-10">
        <button
          className="absolute top-6 right-6 p-2 rounded-lg bg-neutral-200/60 dark:bg-neutral-800/60 text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-500 transition-all duration-200 shadow-sm"
          onClick={() => setShowLoginForm(false)}
        >
          <XSquare className="w-5 h-5" />
        </button>

        <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-50 mb-8">
          Login
        </h2>

        <div className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-xl bg-white/80 dark:bg-neutral-800/60 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 shadow-sm"
            name="email"
            value={inputs.email}
            onChange={handleInputs}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl bg-white/80 dark:bg-neutral-800/60 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 shadow-sm"
            name="password"
            value={inputs.password}
            onChange={handleInputs}
          />

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50/80 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm text-center font-medium shadow-sm">
              {error}
            </div>
          )}

          <button
            className="w-full px-4 py-3 mt-2 rounded-xl bg-gradient-to-r from-green-900 via-neutral-900 to-black dark:from-green-800 dark:via-neutral-800 dark:to-neutral-900 text-neutral-50 font-semibold hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease-out shadow-lg hover:from-green-800 hover:via-neutral-800 hover:to-neutral-950 dark:hover:from-green-700 dark:hover:via-neutral-700 dark:hover:to-neutral-800 disabled:opacity-50"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  )
}
