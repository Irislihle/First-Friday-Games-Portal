import {useState, useEffect} from 'react'
import{Eye, EyeOff} from 'lucide-react'
import { supabase } from '../data/supabaseClient'   

export default function ResetPasswordPage({oneDone = () => {} }){
    const [password, setPassword] = useState(' ')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [done, setDone] = useState(false)

const [checkingSession, setCheckingSession] = useState(true)
useEffect(() =>{
    let cancelled = false
    supabase.auth.getSession().then(({data: {session} }) => {
       if(cancelled) return
       if(!session){
        setError('Recovery link expired or missing. Request a new one.')
       }
       setCheckingSession(false)
    })
    return () => {cancelled = true}
},[])

async function handleSubmit(e){
    e.preventDefault()
    setError(' ')

    if(password !== confirmPassword){
        setError('Codes do not match.')
        return
    }
    if(password.length < 6){
        setError('Code must be at least 6 characters.')
        return
    }
    setSubmitting(true)
    try{
        const {error: updateError} = await supabase.auth.updateUser({password})
        if(updateError) throw updateError
        setDone(true)
    }catch(err){
        setError(err.message || 'Connection lost. Try again.')    
    }finally{
        setSubmitting(false)
    }
}


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a18] px-4 py-10">
      <div className="w-full max-w-[420px]">

        <div className="bg-[#2a2a28] rounded-2xl p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="relative bg-black rounded-md px-6 py-7 font-mono overflow-hidden">

            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(0,184,221,0.05) 0px, rgba(0,184,221,0.05) 1px, transparent 1px, transparent 3px)',
              }}
            />

            <div className="relative">
              <div className="text-center text-cyan text-[20px] font-medium tracking-[0.18em] mb-1">
                F F G P
              </div>
              <div className="text-center text-red text-[10px] tracking-[0.2em] mb-6">
                FIRST FRIDAY GAMES PORTAL
              </div>

              <div className="text-cyan text-[12px] tracking-[0.03em] mb-4">
                SET NEW ACCESS CODE
                <span className="inline-block w-[7px] h-[13px] bg-cyan ml-1 align-middle animate-pulse" />
              </div>

              {/* CHANGED: brief loading state while we verify the recovery session */}
              {checkingSession ? (
                <div className="text-[#5f7d8c] text-[12px]">VERIFYING LINK...</div>
              ) : done ? (
                <div>
                  <div className="text-cyan text-[13px] mb-2">CODE UPDATED</div>
                  <p className="text-[#5f7d8c] text-[12px] leading-relaxed mb-5">
                    You're signed in. Continue to the dashboard.
                  </p>
                  <button
                    onClick={onDone}
                    className="bg-red hover:bg-red-deep text-black font-medium text-[12px] tracking-[0.1em] py-2.5 px-5 transition-colors"
                  >
                    CONTINUE
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                  <div>
                    <label htmlFor="newPassword" className="block text-[#4a6b78] text-[10px] tracking-[0.08em] mb-1">
                      NEW PASSWORD
                    </label>
                    <div className="relative">
                      <input
                        id="newPassword" type={showPassword ? 'text' : 'password'} required autoComplete="new-password"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-transparent border-0 border-b border-[#143842] text-cyan text-[13px] py-1.5 pr-8
                        placeholder:text-[#2f4652] focus:outline-none focus:border-cyan transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-[#4a6b78] hover:text-cyan transition-colors"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmNewPassword" className="block text-[#4a6b78] text-[10px] tracking-[0.08em] mb-1">
                      CONFIRM NEW PASSWORD
                    </label>
                    <input
                      id="confirmNewPassword" type={showPassword ? 'text' : 'password'} required autoComplete="new-password"
                      value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent border-0 border-b border-[#143842] text-cyan text-[13px] py-1.5
                      placeholder:text-[#2f4652] focus:outline-none focus:border-cyan transition-colors"
                    />
                  </div>

                  {error && (
                    <div className="text-red text-[11.5px]" role="alert">
                      ! {error}
                    </div>
                  )}

                  {/* CHANGED: disable submit when there's no valid recovery session */}
                  <button
                    type="submit" disabled={submitting || !!error && error.includes('expired')}
                    className="mt-2 bg-red hover:bg-red-deep disabled:opacity-50 text-black font-medium text-[12px]
                    tracking-[0.1em] py-2.5 transition-colors"
                  >
                    {submitting ? 'UPDATING...' : 'UPDATE CODE'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mt-4 text-[10px] tracking-[0.1em] text-[#5f5e5a]">
          BOARD GAME NIGHT · PROPERLY KEPT SCORE
        </div>
      </div>
    </div>
  )
}








