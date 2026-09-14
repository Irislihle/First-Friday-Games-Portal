import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../data/supabaseClient'

const PREVIEW_STANDINGS = [
  { name: 'Team Red', points: 260 },
  { name: 'Team White', points: 246 },
  { name: 'Team Black', points: 249 },
]

export default function AuthPage() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [confirmSent, setConfirmSent] = useState(false)

  const isSignup = mode === 'signup'

  function switchMode(next) {
    setMode(next)
    setError('')
    setConfirmSent(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (isSignup && password !== confirmPassword) {
      setError("Passwords don't match.")
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setSubmitting(true)
    try {
      if (isSignup) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: name.trim() } },
        })
        if (signUpError) throw signUpError
        setConfirmSent(true)
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
        // On success, the onAuthStateChange listener in useAuth picks up
        // the new session and App.jsx swaps to the dashboard automatically.
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-paper">

      {/* Branding panel */}
      <div className="lg:w-[42%] bg-navy text-white px-8 py-10 lg:py-14 lg:px-12 flex flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-[42px] h-[42px] rounded-full bg-red flex items-center justify-center font-display text-[13px] font-semibold flex-shrink-0">
            FFGP
          </div>
          <div className="font-bold text-[15px] tracking-tight">
            First Friday Games Portal
          </div>
        </div>

        <div className="mt-10 lg:mt-0">
          <h1 className="text-[28px] lg:text-[34px] font-extrabold tracking-tight leading-tight mb-3">
            Board game night,<br />properly kept score.
          </h1>
          <p className="text-[14px] text-[#9FB2C0] max-w-[36ch]">
            Rosters, live points, and standings for the group — updated as the night happens.
          </p>
        </div>

        <div className="mt-10 lg:mt-14 bg-navy-soft rounded-md p-4">
          <div className="text-[11px] tracking-wider uppercase text-[#9FB2C0] font-semibold mb-3">
            Tonight's standings
          </div>
          <div className="flex flex-col gap-2">
            {PREVIEW_STANDINGS.map((t, i) => (
              <div key={t.name} className="flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-2.5">
                  <span className={`w-[20px] h-[20px] rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${i === 0 ? 'bg-red text-white' : 'bg-white/10 text-[#9FB2C0]'}`}>
                    {i + 1}
                  </span>
                  <span className="font-semibold text-[#E4E9ED]">{t.name}</span>
                </span>
                <span className="font-mono font-bold text-cyan">{t.points}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-14">
        <div className="w-full max-w-[380px]">
          <h2 className="text-2xl font-extrabold tracking-tight mb-1.5">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-[13.5px] text-muted mb-7">
            {isSignup
              ? 'Join the roster to track games and scores.'
              : "Sign in to see tonight's standings."}
          </p>

          {confirmSent ? (
            <div className="border border-line rounded-md p-4 bg-white">
              <div className="font-semibold text-[13.5px] mb-1">Check your email</div>
              <p className="text-[13px] text-muted mb-4">
                We sent a confirmation link to <span className="font-semibold text-[#091f2f]">{email}</span>.
                Confirm your address, then sign in below.
              </p>
              <button
                onClick={() => switchMode('signin')}
                className="text-[13px] font-semibold text-red hover:text-red-deep transition-colors"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {isSignup && (
                <div>
                  <label className="block text-[12px] font-semibold text-muted mb-1.5" htmlFor="name">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full border border-line rounded-lg px-3 py-2.5 text-[13.5px]
                    focus:outline-none focus:border-red transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-[12px] font-semibold text-muted mb-1.5" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-line rounded-lg px-3 py-2.5 text-[13.5px]
                  focus:outline-none focus:border-red transition-colors"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-muted mb-1.5" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full border border-line rounded-lg px-3 py-2.5 pr-10 text-[13.5px]
                    focus:outline-none focus:border-red transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-navy transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {isSignup && (
                <div>
                  <label className="block text-[12px] font-semibold text-muted mb-1.5" htmlFor="confirmPassword">
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full border border-line rounded-lg px-3 py-2.5 text-[13.5px]
                    focus:outline-none focus:border-red transition-colors"
                  />
                </div>
              )}

              {error && (
                <div className="text-[13px] text-red font-medium" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-1 bg-red hover:bg-red-deep disabled:opacity-60 text-white
                font-bold text-[13.5px] rounded-lg py-2.5 transition-colors"
              >
                {submitting
                  ? (isSignup ? 'Creating account...' : 'Signing in...')
                  : (isSignup ? 'Create account' : 'Sign in')}
              </button>
            </form>
          )}

          {!confirmSent && (
            <div className="mt-6 text-[13px] text-muted">
              {isSignup ? (
                <>
                  Already have an account?{' '}
                  <button onClick={() => switchMode('signin')} className="font-semibold text-red hover:text-red-deep transition-colors">
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  New here?{' '}
                  <button onClick={() => switchMode('signup')} className="font-semibold text-red hover:text-red-deep transition-colors">
                    Create an account
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}