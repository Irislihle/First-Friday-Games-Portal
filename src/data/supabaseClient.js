import {createClient} from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_APP_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_APP_PUBLISHABLE_KEY

if(!supabaseUrl || !supabasePublishableKey){
    throw new Error(
            'Missing Supabase env vars. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local'
    )
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey)



