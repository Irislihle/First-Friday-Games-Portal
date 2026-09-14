import {useState} from 'react';
import React, { useEffect } from 'react';
import Header from './components/Header';
import StatStrip from './components/StatStrip';
import ResultsChart from './components/ResultsChart';
import Leaderboard from './components/Leaderboard'
import LiveGame from './components/LiveGame';
import RosterGrid from './components/RosterGrid';
import {getStats,getChartData,getLeaderboard,getLiveGame,getRosters} from './services/api'
import { Wind } from 'lucide-react'
import {supabase} from './data/supabaseClient'


export default function App() {
    console.log(supabase)
   //State variables - store data from API
 const [stats, setStats] = useState(null)
 const [chartData, setChartData] = useState([])
 const [leaderboard, setLeaderboard] = useState([])
 const [liveGame, setLiveGame] = useState(null)
 const [rosters, setRosters] = useState([])
 const [loading, setLoading] = useState(true)

 function handleLogout(){
  window.print('User logged out!')
 }

 useEffect(() => {
  Promise.all([
    getStats(),
    getChartData(),
    getLeaderboard(),
    getLiveGame(),
    getRosters()
  ])
  .then(([s, c, l, g, r]) => {
    setStats(s)
    setChartData(c)
    setLeaderboard(l)
    setLiveGame(g)
    setRosters(r)
  })
  .finally(() => setLoading(false))
 }, [])

 if(loading){
  return(
    <div className='min-h-screen flex items-center justify-center bg-paper text-muted
    font-mono text-sm'>
      Loading dashboard
    </div>
  )
 }

   return (
        <div className="min-h-screen bg-paper">
          <Header onLogout={handleLogout}/>
           
          <div className='max-w-[1200px] mx-auto px-8 py-7 pb-16'>
            <div className='text-[11px] tracking-[0.14em] uppercase text-faint 
            font-mono mb-1.5'>
                Season overview
            </div>
             <h1 className='text-2xl font-extrabold tracking-tight mb-6'>
                Today's standing
            </h1>   
            
          <StatStrip stats={stats} />

          <div className='grid grid-cols-1 lg:grid-cols-[1.7fr_1fr]
          gap-5 items-start'>
           <ResultsChart data={chartData} />
           <div>
              <Leaderboard entries={leaderboard} />
              <LiveGame game={liveGame} />
           </div>
        </div>

        <RosterGrid rosters={rosters} />

          </div>
            
        </div>
   );
}


