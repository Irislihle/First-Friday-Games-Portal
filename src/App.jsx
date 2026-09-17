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
        <ResultsChart data={data.chartData} />
        <div>
          <Leaderboard entries={data.leaderboard} />
          {/* canManage defaults to false in preview */}
          <LiveGame game={data.liveGame} canManage={false} />
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
  if (!session) return <AuthPage />

  return (
    <Dashboard
      onLogout={handleLogout}
      loggingOut={loggingOut}
      canManage={canManage}
    />
  )
}


function Dashboard({ onLogout, canManage }) {
  const { data, loading } = useDashboardData()

  if (loading) return <LoadingScreen />

  return (
    <DashboardShell onLogout={onLogout}>
      <StatStrip stats={data.stats} />
      <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-5 items-start">
        <ResultsChart data={data.chartData} />
        <div>
          <Leaderboard entries={data.leaderboard} />
          <LiveGame game={data.liveGame} canManage={canManage} />
        </div>
      </div>
      <RosterGrid rosters={data.rosters} canManage={canManage} />
    </DashboardShell>
  )
}

function useDashboardData() {
  const [data, setData] = useState({
    stats: null,
    chartData: [],
    leaderboard: [],
    liveGame: null,
    rosters: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    Promise.all([
      getStats(),
      getChartData(),
      getLeaderboard(),
      getLiveGame(),
      getRosters(),
    ])
      .then(([stats, chartData, leaderboard, liveGame, rosters]) => {
        if (cancelled) return
        setData({ stats, chartData, leaderboard, liveGame, rosters })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading }
}

function DashboardShell({ children, onLogout }) {
  return (
    <div className="min-h-screen bg-paper">
      <Header onLogout={onLogout} />
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
