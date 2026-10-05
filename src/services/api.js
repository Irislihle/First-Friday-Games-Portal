

import {supabase} from '../data/supabaseClient'



export async function getStats(){
    const [teamsRes, playerRes, gamesRes, resultsRes] = await Promise.all([
        supabase.from('teams').select('id,name'),
        supabase.from('players').select('id',{count:'exact',head:true}),
        supabase.from('games').select('id', {count:'exact', head:true}),
        supabase.from('results').select('team_id, points'),
    ])

    if(teamsRes.error) throw teamsRes.error
    if(playerRes.error) throw playerRes.error
    if(gamesRes.error) throw gamesRes.error
    if(resultsRes.error) throw resultsRes.error

    const totals = new Map()
    for(const row of resultsRes.data ?? []){
        totals.set(row.team_id, (totals.get(row.team_id) ?? 0) + (row.points ?? 0))
    }

    let leader = {name: '-', points: 0}
    for(const team of teamsRes.data ?? []){
        const pts = totals.get(team.id) ?? 0
        if(pts > leader.points) leader = {name: team.name, points: pts}
    }

    return{
        totalTeams: teamsRes.data?.length ?? 0,
        players: playerRes.count ?? 0,
        gamesPlayed: gamesRes.count ?? 0,
        leader,
    }
}

export async function getChartData() {
  const { data:games, error:gErr} = await supabase
  .from('games')
  .select('id, label, event_date')
  .order('event_date', {ascending: true})
  if(gErr) throw gErr

  const {data: results, error: sErr} = await supabase
  .from('results')
  .select('game_id,points, team:teams(name)')
  if(sErr) throw sErr
  

  const byGame = new Map()
  for (const row of results ?? []) {
    if(!row.team) continue
    if (!byGame.has(row.game_id)) byGame.set(row.game_id, {})
    byGame.get(row.game_id)[row.team.name] = row.points ?? 0
  }

  return (games ?? []).map((g, i) => ({
    season: `FFG ${i + 1}`,
    gameName: g.label,
    ...(byGame.get(g.id) ?? {}),
  }))
}

// Every team that has scored, ranked. Ties share a rank.
export async function getLeaderboard() {
  const { data: teams, error: tErr } = await supabase
  .from('teams')
  .select('id, name, color')
  if (tErr) throw tErr

  const { data: results, error: rErr } = await supabase
  .from('results')
  .select('team_id, points')
  if (rErr) throw rErr

  const totals = new Map()
  for (const row of results ?? []) {
    totals.set(row.team_id, (totals.get(row.team_id) ?? 0) + (row.points ?? 0))
  }

  const rows = (teams ?? [])
    .map((t) => ({ id: t.id, name: t.name, color: t.color, points: totals.get(t.id) ?? 0 }))
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name))

  let lastPoints = null
  let lastRank = 0
  return rows.map((row, i) => {
    const rank = row.points === lastPoints ? lastRank : i + 1
    lastPoints = row.points
    lastRank = rank
    return { ...row, rank }
  })
}

export async function getLiveGame() {
  const { data: game, error: gErr } = await supabase
    .from('games')
    .select('id, label')
    .eq('is_live', true)
    .maybeSingle()
  if (gErr) throw gErr
  if (!game) return null

const { data: liveGameRow, error: lgErr } = await supabase
  .from('live_games')
  .select('id')
  .eq('game_id', game.id)
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle()
if (lgErr) throw lgErr
if (!liveGameRow) return null

  const { data: rows, error: rErr } = await supabase
    .from('live_game_teams')
    .select('id, points, team:teams(id, name, color)')
    .eq('live_game_id', liveGameRow.id)
  if (rErr) throw rErr

  return {
    id: liveGameRow.id,
    name: game.label,
    status: 'LIVE',
    teams: (rows ?? [])
      .filter((r) => r.team)
      .map((r) => ({
        rowId: r.id,
        id: r.team.id,
        name: r.team.name,
        color: r.team.color,
        points: r.points ?? 0,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  }
}


export async function getRosters() {
  const { data, error } = await supabase
    .from('teams')
    .select('id, name, color, players(id, name)')
    .order('name', { ascending: true })
  if (error) throw error

  return (data ?? []).map((team) => ({
    ...team,
    players: [...(team.players ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
  }))
}

// --- players CRUD ---

export async function addPlayer(teamId, playerName) {
  const { data, error } = await supabase
    .from('players')
    .insert({ team_id: teamId, name: playerName })
    .select('id, name')
    .single()
  if (error) throw error
  return data
}

export async function updatePlayer(teamId, playerId, newName) {
  const { data, error } = await supabase
    .from('players')
    .update({ name: newName })
    .eq('id', playerId)
    .eq('team_id', teamId)
    .select('id, name')
    .single()
  if (error) throw error
  return data
}

export async function deletePlayer(teamId, playerId) {
  const { error } = await supabase
    .from('players')
    .delete()
    .eq('id', playerId)
    .eq('team_id', teamId)
  if (error) throw error
  return { id: playerId }
}

export async function createTeam(name, color) {
  const { data, error } = await supabase
    .from('teams')
    .insert({ name, color })
    .select('id, name, color')
    .single()
  if (error) throw error

  return {
    ...data,
    players: [], 
  }
}

export async function createLiveGame(name, selectedTeams){

  if(!name?.trim()) throw new Error('Game name is required.')
  if(!selectedTeams?.length) throw new Error('Pick at least one team.')

    const {error:retireError} = await supabase
    .from('games')
    .update({is_live:false})
    .eq('is_live',true)
    if(retireError) throw retireError

    const today = new Date().toISOString().slice(0,10)
    const {data: gameRow, error:gameError} = await supabase
    .from('games')
    .insert({label: name.trim(), event_date:today, is_live:true})
    .select('id, label')
    .single()
    if(gameError) throw gameError
    console.log('[createLiveGame] gameRow:', gameRow, 'error:', gameError)

    const {data: liveGameRow, error: liveGameError} = await supabase
   .from('live_games')
   .insert({ game_id: gameRow.id, game_name: gameRow.label, status: 'in_progress' })
   .select('id')
   .single()
   if(liveGameError) throw liveGameError


    const rows = selectedTeams.map((t) => ({
      live_game_id: liveGameRow.id,
      team_id: t.id,
      points: 0
    }))

    const {error: teamsError} = await supabase
    .from('live_game_teams')
    .insert(rows)

    if(teamsError){
      await supabase.from('games').delete().eq('id', gameRow.id)
      throw teamsError
    }

    return{
      id: liveGameRow.id,
      name: gameRow.label,
      teams: selectedTeams.map((t) => ({id: t.id, name: t.name, points: 0}))
    }

  }

  export async function setTeamPoints(gameId, teamId, points){
 
    const {error} = await supabase
    .from('live_game_teams')
    .update({points})
    .eq('live_game_id', gameId)
    .eq('team_id', teamId)
    if(error) throw error

    return {teamId, points}

  }

export async function endLiveGame(liveGameId, teams) {
  if (!liveGameId) throw new Error('No active game to end.')

  const { data: liveGameRow, error: lookupError } = await supabase
    .from('live_games')
    .select('game_id')
    .eq('id', liveGameId)
    .single()
  if (lookupError) throw lookupError

  const gameId = liveGameRow.game_id

  const rows = (teams ?? []).map((t) => ({
    game_id: gameId,
    team_id: t.id,
    points: t.points ?? 0,
  }))

  if (rows.length > 0) {
   const { error: resultsError } = await supabase
  .from('results')
  .upsert(rows, { onConflict: 'game_id,team_id' })
  if (resultsError) throw resultsError
  }

  const { error: statusError } = await supabase
    .from('live_games')
    .update({ status: 'completed' })
    .eq('id', liveGameId)
  if (statusError) throw statusError

  const { error: gameError } = await supabase
    .from('games')
    .update({ is_live: false })
    .eq('id', gameId)
  if (gameError) throw gameError

  return { id: gameId }
}
export async function deleteLiveGame(liveGameId){
    if(!liveGameId) throw new Error('No active game to delete. ')

      const {data: liveGameRow, error: lookupError} = await supabase
          .from('live_games')
          .select('game_id')
          .eq('id', liveGameId)
          .single()
          if(lookupError) throw lookupError
          
    const { error: teamsError } = await supabase
    .from('live_game_teams')
    .delete()
    .eq('live_game_id', liveGameId)
  if (teamsError) throw teamsError

   const { error: liveGameError } = await supabase
    .from('live_games')
    .delete()
    .eq('id', liveGameId)
  if (liveGameError) throw liveGameError

    const { error: gameError } = await supabase
    .from('games')
    .delete()
    .eq('id', liveGameRow.game_id)
  if (gameError) throw gameError

  return { id: liveGameId }


}

export async function deleteTeam(teamId) {
  const { error: playersError } = await supabase
    .from('players')
    .delete()
    .eq('team_id', teamId)
  if (playersError) throw playersError

  const { error: liveGameTeamsError } = await supabase
    .from('live_game_teams')
    .delete()
    .eq('team_id', teamId)
  if (liveGameTeamsError) throw liveGameTeamsError

  const { error: resultsError } = await supabase
    .from('results')
    .delete()
    .eq('team_id', teamId)
  if (resultsError) throw resultsError

  const { error: teamError } = await supabase
    .from('teams')
    .delete()
    .eq('id', teamId)
  if (teamError) throw teamError

  return { id: teamId }
}