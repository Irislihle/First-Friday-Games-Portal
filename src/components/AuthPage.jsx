import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../data/supabaseClient'

const HIGH_SCORES = [
  { rank: 1, name: 'Team Red', points: 260 },
  { rank: 2, name: 'Team Black', points: 249 },
  { rank: 3, name: 'Team White', points: 246 },
]

// 'signin' | 'signup'|'forgot'
export default function AuthPage() {
  const [mode, setMode] = useState('signin') 
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [confirmSent, setConfirmSent] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const isSignup = mode === 'signup'
  const isForgot = mode === 'forgot'

  function switchMode(next) {
    setMode(next)
    setError('')
    setConfirmSent(false)
    setResetSent(false)
    setPassword('')
    setConfirmPassword('')
    setShowPassword(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if(isForgot){
      setSubmitting(true)
      try{
        const {error:resetError} = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })
        if(resetError)throw resetError
        setResetSent(true)
      }catch(err){
        setError(err.message || 'Connection lost. Try again')
      }finally{
        setSubmitting(false)
      }
      return
    }

    if (isSignup && password !== confirmPassword) {
      setError("Code do not match")
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
        if(data?.session){
          return
        }
        setConfirmSent(true)
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
        
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const heading =  isForgot
  ?'PASSWORD RECOVERY'
  :isSignup
  ?'MEW PLAYER SETUP'
  : 'INSERT CREDENTIALS TO CONTINUE'

  return (
   <div className='min-h-screen flex items-center justify-center bg-[#1a1a18] px-4 py-1 0'>

    <div className='w-full max-w-[420px]'>
    <div className='bg-[#2a2a28] rounded-2xl p-3.5 shadow-[insert_0_1px_0_rgba(255,255,255,0.06)]s'>
      <div className='relative bg-black rounded-md px-6 py-7 font-mono overflow-hidden'>
        <div
         className='absolute insert-0 pointer-events-none'
        style={{
          backgroundImage:'repeating-linear-gradient(0deg, rgba(0,184,221,0.05) 0px, rgba(0.184,221,0.05) 1px, transparent 1px, transparent 3px)',}}
        
        />
         <div className='relative'>
          <div className='text-center text-cyan text-[20px] font-medium tracking-[0.1 8em] mb-1'>
            F F G P
            </div> 
            <div className='text-center text-red text-[11px] tracking-[0.5em] mb-6'>
                 FIRST FRIDAY GAMES PORTAL
            </div>

           {!isForgot && !confirmSent &&(
           <div className='border border-[#143842] px-3.5 py-3 mb-5' >
            <div className='text-[#5f7d8c] text-[10px] tracking-[0.1em] mb-2'>
              LEADERBOARD
            </div>
            {
              HIGH_SCORES.map((s)=>(
                <div
                key={s.name}
                className={`flex justify-between text-[12px] py-0.5 ${s.rank === 1 ? 'text-cyan' : 'text-[#4a6b78]'}`}
                >
                  <span>{s.rank}.{s.name}</span>
                  <span>{s.points}</span>

                </div>
              ))}
           </div>
          )}

        {confirmSent ? (
         
         <div>
          <div className='text-cyan text-[13px] mb-2'>REGISTRATION RECEIVED</div>
          <p className='text-[#5f7d8c] text-[12px] leading-relaxed mb-5'>
             Confirmation code sent to <span className='text-cyan'>{email}</span>.
             Confirm your address, then sign in below.
          </p>
          <button
          onClick={() => switchMode('signin')}
          className='text-red text-[12px] tracking-[0.05em] hover:text-red-deep transition-colors'>
                   &lt; BACK TO SIGN IN
          </button>
         </div>

      ) : resetSent ? (
        <div>
          <div className='text-cyan text-[13px] mb-2'>RECOVERY CODE SENT</div>

           <p className='text-cyan text-[12px] leading-relaxed mb-5' >
            Check <span className='text-cyan'>{email}</span> for a link to set a new password.
           </p>
           <button
           onClick={() => switchMode('signin')}
           className='text-red text-[12px] tracking-[0.05em] hover:text-red-deep transition-colors'>
            &lt; BACK TO SIGN IN
           </button>
        </div>
      ) : (
        <>
        <div className='text-cyan text-[12px] tracking-[0.03em] mb-4'>
          {heading}
          <span className='inline-block w-[7px] h-[13px] bg-cyan ml-1 align-middle animate-pulse'/>
        </div>
        
        <form onSubmit={handleSubmit} className='flex flex-col gap-3.5'>
        {isSignup &&(
          <div>
            <label htmlFor="name" className='block text-[#4a6b78] text-[10px] tracking-[0.08em] mb-1'>
              NAME
            </label>
            <input
            id="name" type='text' required autoComplete='name'
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder="your name"
            className='w-full bg-transparent border-0 border-b border-[#143842] text-cyan text-[13px] py-1.5
            placeholder:text-[#2f4652] focus:outline-none focus:border-cyan transition-colors'/>
          </div>
        )}

       <div>
       <label htmlFor="email" className='block text-[#4a6b78] text-[10px] tracking-[0.08em] mb-1 '>
        EMAIL
       </label>
       <input 
       id="email" type='email' required autoComplete='email'
       value={email} onChange={(e) => setEmail(e.target.value)}
       placeholder='you@example.com'
       className='w-full bg-transparent border-0 border-b border-[#143842]  text-cyan text-[13px] py-1.5
       placeholder:text-[#2f4652] focus:outline-none focus:border-cyan transition-colors'/>
       </div>

       {!isForgot &&(
       <div>
        <div className='flex items-center justify-between mb-1'>
        <label htmlFor='password'className='block text-[#4a6b78] text-[10px] tracking-[0.08em]'>
          PASSWORD
        </label>
        {!isSignup && (
           <button
           type='button'
           onClick={() => switchMode('forgot')}
           className='text-[10px] tracking-[0.05em] text-red hover:text-red-deep transition-colors'>
            FORGOT CODE?
           </button>
        )}
   </div>

   <div className='relative'>
    <input
    id="password" type={showPassword ? 'text' : 'password'} required autoComplete= {isSignup ? 'new-password' : 'current-password'}
    value={password} onChange={(e) => setPassword(e.target.value)} placeholder='********'
    className='w-full bg-transparent border-0 border-b border-[#143842] text-cyan text-[13px] py-1.5 pr-8'/> 
   <button
   type='button'
   onClick={() => setShowPassword((prev) => !prev)}
   aria-label={showPassword ? 'Hide password' : 'Show password'}
   className='absolute right-0 top-1/2 -translate-y-1/2 text-[#4a6b78] hover:text-cyan transition-colors'>
   
    {showPassword ? <Eye size={14} /> : <EyeOff size={14} />}
   </button>
 </div>
</div>
)}

{isSignup && (
  <div>
   <label htmlFor='confirmPassword'
   className='block text-[#4a6b78] text-[10px] tracking-[0.08em] md-1'>
    CONFIRM PASSWORD
   </label>
   <input
   id='confirmPassword' type={showPassword ? 'text' : 'password'}
   required autoComplete='new-password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
   placeholder='*******'
   className='w-full bg-transparent border-0 border-b border-[#143842] text-cyan text-[13px] py-1.5
   placeholder:text-[#2f4652] focus:outline-none focus:border-cyan transition-colors'/></div>
)}

 {error && (
  <div className='text-red text-[11.5px]' role='alert'>
    ! {error}
  </div>
 )}

  <button
   type='submit' disabled={submitting}
   className='mt-2 bg-red hover:bg-red-deep disabled:opacity-50 text-black font-medium text-[12px]
   tracking-[0.1em] py-2.5 transition-colors'>
    {submitting
      ? (isForgot ? 'SENDING...' : isSignup ? 'REGISTERING...' : 'LOADING...')
     : (isForgot ? 'SEND RECOVERY CODE' : isSignup ? 'CREATE PLAYER' : 'PRESS START')
    }
   </button>
</form>

      <div className='flex items-center justify-between mt-5 text-[10px] tracking-[0.05em]'>
        {isForgot ? (
          <button onClick={() => switchMode('signin')} 
          className='text-[#4a6b78] hover:text-cyan transition-colors'>
            &lt; BACK TO SIGN IN
          </button>
        ) : isSignup ? (
          <span className='text-[#4a6b78]'>
           REGISTERED ? {' '}
           <button onClick={() => switchMode('signin')} className='text-red hover:text-red-deep transition-colors'>
            SIGN IN
           </button>
        </span>
        ) : (
          <span className='text-[#4a6b78]'>
            NEW CHALLENGE?{' '}
            <button onClick={() => switchMode('signup')} className='text-red hover:text-red-deep transition-colors'>
              REGISTER
            </button>
          </span>
      )}
   </div>
 </>
  )}
  </div>
 </div>
</div>

<div className='text-center mt-4 text-[10px] tracking-[0.1em] text-[#5f5e5a]'>
  BOARD GAME FRIDAY . PROPERLY KEPT SCORE
  </div>
 </div>
</div>
  )
}