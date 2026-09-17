import { useState, useEffect } from 'react'
import {supabase} from '../data/supabaseClient'

export function useAuth(){
 const [session, setSession] = useState(null)
 const [role, setRole] = useState(null)
 const [loading, setLoading] = useState(true)

 useEffect(() => {
    let mounted = true

    async function loadProfile(userId){
        const {data, error} = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
         
       if (!mounted) return
       if (!error && data){
        setRole(data.role)
       } else {
        setRole('player')
       }
        setLoading(false)
    }

    async function init(){
        const {
            data: {session: initialSession},
            } = await supabase.auth.getSession()

            if (initialSession?.user){
                setSession(initialSession)
                await loadProfile(initialSession.user.id)
            }else{
                setLoading(false)
            }
    }
       init()

    const {data: listener} = supabase.auth.onAuthStateChange(
        (_event, newSession) => {
            if(newSession?.user){
                setSession(newSession)
                loadProfile(newSession.user.id)
            }else{
                setRole(null)
                setLoading(false)
            }
        }
    )

    return () => {
        mounted = false
        listener.subscription.unsubscribe()
    }
},[])

   const canManage = role === 'admin' || role === 'organizer'
   return {session, role, canManage, loading}



}