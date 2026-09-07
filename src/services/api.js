//Central data fetching All components import from here
import{
    stats as mockStats,
    chartData as mockChartData,
    leaderboard as mockLeaderboard,
    liveGame as mockLiveGame,
    rosters as mockRosters
} from '../data/mockData'

const USE_MOCK = true
const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

//fetch function
async function get(path){
    const res = await fetch(`${BASE_URL}${path}`)
    if (!res.ok) throw new error(`API error ${res.status} on ${path}`)
        return res.json
}

//Fetching the mock data
export async function getStats(){
    if (USE_MOCK) return mockStats
    return get('/api/stats')
}

export async function getChartData(){
    if(USE_MOCK) return mockChartData
    return get('/api/results')
}

export async function getLeaderboard(){
    if(USE_MOCK) return mockLeaderboard
    return get('/api/leaderboard')
}

export async function getLiveGame(){
    if(USE_MOCK) return mockLiveGame
    return get('/api/live-game')
}

export async function getRosters(){
    if(USE_MOCK) return mockRosters
    return get('/api/rosters')
}

export async function addPlayer(teamId, playerName){
 if (USE_MOCK){
    console.log(`[mock] would add "${playerName}" to team ${teamId}`)
    return {ok:true}
 }
const res = await fetch(`${BASE_URL}/api/teams/${teamId}/players`,{
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body:JSON.stringify({name: playerName}),
})
   if(!res.ok) throw new Error('Failed to add player')
    return res.json
}

export async function addPoints(teamName, points){
   if(USE_MOCK){
    console.log(`[mock] would add "${points}" to team ${teamName}`)
    return {ok: true}
   }

   const res = await fetch(`${BASE_URL}/api/live-game/points`,
    {method:'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({teamName, points})
     }
   )

   if(!res.ok) throw new error('Failed to add points')
    return res.json()
}