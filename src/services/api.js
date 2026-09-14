//Central data fetching All components import from here
import {supabase} from '../data/supabaseClient'
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

// CRUD USING SUPABASE
export async function addPlayer(teamId, playerName){
 if (USE_MOCK){
    return {
        id:`temp-${Date.now()}-${Math.random().toString(36).slice(2,9)}`,
        name:playerName }
 }

 const {data, error} = await supabase
    .from('players')
    .insert({team_id: teamId, name: playerName})
    .select()
    .single()

    if(error) throw error
    return data
}

export async function updatePlayer(teamId, playerId, newName){
    if(USE_MOCK){
        return {id: playerId, name: newName}
    }
    const {data, error} = await supabase
        .from('players')
        .update({name: newName})
        .eq('id', playerId)
        .eq('team_id', teamId)
        .select()
        .single()

    if(error) throw error
    return data
}

export async function deletePlayer(teamId, playerId){
    if(USE_MOCK){
        return {id: playerId}
    }

    const {error} = await supabase
        .from('players')
        .delete()
        .eq('id', playerId)
        .eq(team_id, teamId)

    if(error) throw error
    return {id:playerId}

}

//LIVE GAME

export async function addPoints(teamName, points){
   if(USE_MOCK){
    console.log(`[mock] would add "${points}" to team ${teamName}`)
    return {ok: true}
   }

   const {data, error} = await supabase
       .from('live_game_scores')
       .insert({team_name: teamName, points})
       .select()
       .single()

       if(error) throw error 
       return data
 
}