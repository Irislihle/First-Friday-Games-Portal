// App.jsx
import { useState, useEffect } from 'react'
import Header from './components/Header'
import StatStrip from './components/StatStrip'
import ResultsChart from './components/ResultsChart'
import Leaderboard from './components/Leaderboard'
import LiveGame from './components/LiveGame'
import RosterGrid from './components/RosterGrid'
import {
  getStats,
  getChartData,
  getLeaderboard,
  getLiveGame,
  getRosters,
} from './services/api'
import { supabase } from './data/supabaseClient'
import { useAuth } from './hooks/useAuth'
import AuthPage from './components/AuthPage'
import ResetPasswordPage from './components/ResetPasswordPage'



const DEV_PREVIEW = null


export default function App() {
  if (DEV_PREVIEW === 'auth') return <AuthPage />
  if (DEV_PREVIEW === 'dashboard') return <DashboardPreview />
  return <RealApp />
}

function DashboardPreview() {
  const { data, loading } = useDashboardData()

  if (loading) return <LoadingScreen />

  return (
    <DashboardShell>
      <StatStrip stats={data.stats} />
      <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-5 items-start">
        <ResultsChart data={data.chartData} teams={data.rosters} />
        <div>
          <Leaderboard entries={data.leaderboard} />
        
          <LiveGame teams={data.rosters} game={data.liveGame} canManage={false} />
        </div>
      </div>
      <RosterGrid rosters={data.rosters} canManage={false} />
    </DashboardShell>
  )
}

function RealApp() {
  const { session, canManage, loading: authLoading } = useAuth()
  console.log('[RealApp] canManage:', canManage, 'session:', !!session)
  const [loggingOut, setLoggingOut] = useState(false)

  const [recovering, setRecovering] = useState(false)

   useEffect(() => {
    const {data: {subscription} } = supabase.auth.onAuthStateChange(
      (event) => {
        if(event === 'PASSWORD_RECOVERY') setRecovering(true)
      }
    )
    if(window.location.pathname === '/reset-password') setRecovering(true)
      return () => subscription.unsubscribe()
   }, [])

  async function handleLogout() {
    setLoggingOut(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
    } catch (err) {
      console.error('Logout failed:', err)
      setLoggingOut(false)
    }
  }

  if (authLoading) return <LoadingScreen />

  if(recovering){
    return(
      <ResetPasswordPage
        onDone={() =>{
          setRecovering(false)
          window.history.replaceState(null, '', '/')
        }}
        />
    )
  }

  if (!session) return <AuthPage />

  const userName = 
  session.user.user_metadata?.name ||
  session.user.email?.split('@')[0] ||
  'Player'

  return (
    <Dashboard
      onLogout={handleLogout}
      loggingOut={loggingOut}
      canManage={canManage}
      userName = {userName}
    />
  )
}


function Dashboard({ onLogout, canManage, userName }) {
  const { data, loading, setData, refetch } = useDashboardData()

   function handleTeamAdded(newTeam) {
    setData((prev) => ({ ...prev, rosters: [...prev.rosters, newTeam] }))
  }

  function handleTeamDeleted(teamId) {
  setData((prev) => ({ ...prev, rosters: prev.rosters.filter((t) => t.id !== teamId) }))
}

  if (loading) return <LoadingScreen />

  return (
    <DashboardShell onLogout={onLogout} userName={userName}>
      <StatStrip stats={data.stats} />
      <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-5 items-start">
        <ResultsChart data={data.chartData} teams={data.rosters} />
        <div>
          <Leaderboard entries={data.leaderboard} />
          <LiveGame teams={data.rosters} game={data.liveGame} canManage={canManage} onGameCreated={refetch}/>
        </div>
      </div>
      <RosterGrid rosters={data.rosters} canManage={canManage} onTeamAdded={handleTeamAdded} onTeamDeleted={handleTeamDeleted}/>
    </DashboardShell>
  )
}

function useDashboardData() {
  const [data, setData] = useState({
    stats: null, chartData: [], leaderboard: [], liveGame: null, rosters: [],
  })
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const [stats, chartData, leaderboard, liveGame, rosters] = await Promise.all([
        getStats(), getChartData(), getLeaderboard(), getLiveGame(), getRosters(),
      ])
      setData({ stats, chartData, leaderboard, liveGame, rosters })
    } catch (err) {
      console.error('[dashboard] load failed:', err)
    }
  }

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  return { data, setData, loading, refetch: load }
}

function DashboardShell({ children, onLogout, userName }) {
  return (
    <div className="min-h-screen bg-paper">
      <Header onLogout={onLogout} userName={userName} />
      <div className="max-w-[1200px] mx-auto px-8 py-7 pb-16">
        <div className="text-[11px] tracking-[0.14em] uppercase text-faint font-mono mb-1.5">
          Season overview
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight mb-6">
          Today's standing
        </h1>
        {children}
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper text-muted font-mono text-sm">
      Loading dashboard
    </div>
  )
}
