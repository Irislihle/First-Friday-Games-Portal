import { useState, useEffect } from 'react'
import Modal from './Modal'
import ConfirmModal from './ConfirmModal'
import { setTeamPoints, createLiveGame, endLiveGame, deleteLiveGame } from '../services/api'
import { Pencil, Plus } from 'lucide-react'

export default function LiveGame({
  game,
  teams: rosterTeams = [],
  canManage = false,
  onGameCreated,
}) {
  const [liveGame, setLiveGame] = useState(
    game ? { ...game, teams: game.teams ?? [] } : null
  )
  const [isEditing, setIsEditing] = useState(false)

  // Score modal
  const [saving, setSaving] = useState(false)
  const [modalTeam, setModalTeam] = useState(null)
  const [pointsInput, setPointsInput] = useState('1')
  const [scoreMode, setScoreMode] = useState('add')

  // Create game modal
  const [createOpen, setCreateOpen] = useState(false)
  const [newGameName, setNewGameName] = useState('')
  const [selectedTeamIds, setSelectedTeamIds] = useState([])
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  // End / delete game (confirm modals)
  const [endOpen, setEndOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [ending, setEnding] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    setLiveGame(game ? { ...game, teams: game.teams ?? [] } : null)
  }, [game])

  function openCreateModal() {
    if (liveGame) return
    setNewGameName('')
    setSelectedTeamIds(rosterTeams.map((t) => t.id))
    setCreateError('')
    setCreateOpen(true)
  }

  function toggleTeamSelected(id) {
    setSelectedTeamIds((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    )
  }

  async function handleCreateGame(e) {
    e.preventDefault()
    if (!newGameName.trim() || selectedTeamIds.length === 0) return

    setCreating(true)
    setCreateError('')
    try {
      const chosenTeams = rosterTeams.filter((t) => selectedTeamIds.includes(t.id))
      const created = await createLiveGame(newGameName.trim(), chosenTeams)
      setLiveGame(created)
      setIsEditing(true)
      setCreateOpen(false)
      onGameCreated?.()
    } catch (err) {
      setCreateError(err.message || 'Could not create game.')
    } finally {
      setCreating(false)
    }
  }

  function openScoreModal(team) {
    setModalTeam(team)
    setScoreMode('add')
    setPointsInput('1')
  }

  function currentPointsFor(team) {
    // Read from live state, not the snapshot stored when the modal opened.
    const current = liveGame?.teams.find((t) => t.id === team.id)
    return current?.points ?? team.points ?? 0
  }

  function switchScoreMode(mode) {
    setScoreMode(mode)
    if (mode === 'set' && modalTeam) {
      setPointsInput(String(currentPointsFor(modalTeam)))
    } else {
      setPointsInput('1')
    }
  }

  async function handleScoreSubmit(e) {
    e.preventDefault()
    if (!modalTeam) return

    const value = Number(pointsInput)
    if (Number.isNaN(value)) return

    const nextPoints =
      scoreMode === 'add' ? currentPointsFor(modalTeam) + value : value
    if (nextPoints < 0) return

    setSaving(true)
    try {
      await setTeamPoints(liveGame.id, modalTeam.id, nextPoints)
      setLiveGame((prev) => ({
        ...prev,
        teams: prev.teams.map((t) =>
          t.id === modalTeam.id ? { ...t, points: nextPoints } : t
        ),
      }))
      setModalTeam(null)
    } catch (err) {
      console.error('setTeamPoints failed:', err)
    } finally {
      setSaving(false)
    }
  }

  // Runs only when "End game" is confirmed inside the modal.
  async function handleConfirmEndGame() {
    if (!liveGame) return
    setEnding(true)
    setActionError('')
    try {
      await endLiveGame(liveGame.id, liveGame.teams)
      setLiveGame(null)
      setIsEditing(false)
      setEndOpen(false)
      onGameCreated?.()
    } catch (err) {
      console.error('endLiveGame failed:', err)
      setActionError(err.message || 'Could not end the game.')
    } finally {
      setEnding(false)
    }
  }

  // Runs only when "Delete game" is confirmed inside the modal.
  async function handleConfirmDeleteGame() {
    if (!liveGame) return
    setDeleting(true)
    setActionError('')
    try {
      await deleteLiveGame(liveGame.id)
      setLiveGame(null)
      setIsEditing(false)
      setDeleteOpen(false)
      onGameCreated?.()
    } catch (err) {
      console.error('deleteLiveGame failed:', err)
      setActionError(err.message || 'Could not delete the game.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="mt-5 bg-[#091f2f] rounded-md shadow-card p-5 text-white">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-bold text-[15px] text-white">Current game</h2>
        <div className="flex items-center gap-2">
          {liveGame && (
            <span className="inline-flex items-center gap-1.5 bg-cyan/15 text-cyan font-mono text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_0_3px_rgba(0,184,221,0.25)]" />
              Live
            </span>
          )}

          {canManage && (
            <>
              {!liveGame && (
                <button
                  onClick={openCreateModal}
                  aria-label="Start a new game"
                  title="Start a new game"
                  className="w-7 h-7 flex items-center justify-center rounded-md text-[#9FB2C0] hover:bg-navy-soft hover:text-white transition-colors"
                >
                  <Plus size={14} />
                </button>
              )}

              {liveGame && (
                <>
                  <button
                    onClick={() => setIsEditing((prev) => !prev)}
                    aria-label="Edit current game"
                    aria-pressed={isEditing}
                    title="Edit current game"
                    className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
                      isEditing
                        ? 'bg-cyan/20 text-cyan'
                        : 'text-[#9FB2C0] hover:bg-navy-soft hover:text-white'
                    }`}
                  >
                    <Pencil size={14} />
                  </button>

                  {/* Opens the confirmation modal — does NOT end the game itself. */}
                  <button
                    onClick={() => {
                      setActionError('')
                      setEndOpen(true)
                    }}
                    disabled={ending}
                    aria-label="End current game"
                    title="End current game and save results"
                    className="text-[11px] font-bold text-[#9FB2C0] hover:text-red disabled:opacity-50 transition-colors px-1.5"
                  >
                    End game
                  </button>

                  {/* Opens the confirmation modal — does NOT delete the game itself. */}
                  <button
                    onClick={() => {
                      setActionError('')
                      setDeleteOpen(true)
                    }}
                    disabled={deleting}
                    aria-label="Delete current game"
                    title="Delete current game without saving results"
                    className="text-[11px] font-bold text-[#9FB2C0] hover:text-red disabled:opacity-50 transition-colors px-1.5"
                  >
                    Delete
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {!liveGame ? (
        <div className="text-center py-6">
          <p className="text-[13px] text-[#9FB2C0] mb-3">No live game right now.</p>
          {canManage && (
            <button
              onClick={openCreateModal}
              className="bg-red hover:bg-red-deep text-white text-[12px] font-bold rounded-md px-4 py-2 transition-colors"
            >
              + Start a new game
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="font-bold text-[16px] mb-3.5">{liveGame.name}</div>

          <div className="flex flex-col gap-2">
            {liveGame.teams.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between bg-navy-soft rounded-lg pl-3 pr-2.5 py-2.5"
              >
                <span className="text-[13px] font-semibold text-[#E4E9ED]">
                  {t.name}
                </span>
                <span className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-cyan text-[14px]">
                    {t.points}
                  </span>

                  {canManage && isEditing && (
                    <button
                      onClick={() => openScoreModal(t)}
                      disabled={saving}
                      className="bg-red hover:bg-red-deep disabled:opacity-60 text-white text-[11px] font-bold rounded-md px-2.5 py-1.5 transition-colors"
                    >
                      Update
                    </button>
                  )}
                </span>
              </div>
            ))}

            {(liveGame.teams ?? []).length === 0 && (
              <div className="text-[12.5px] text-[#9FB2C0] py-2">
                No teams in this game yet
              </div>
            )}
          </div>
        </>
      )}

      {/* Add / set score modal */}
      {canManage && (
        <Modal
          isOpen={!!modalTeam}
          onClose={() => setModalTeam(null)}
          title={`Update score — ${modalTeam?.name ?? ''}`}
        >
          <form onSubmit={handleScoreSubmit}>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => switchScoreMode('add')}
                className={`flex-1 text-[12px] font-bold rounded-md py-2 transition-colors ${
                  scoreMode === 'add' ? 'bg-red text-white' : 'bg-paper text-muted'
                }`}
              >
                Add points
              </button>
              <button
                type="button"
                onClick={() => switchScoreMode('set')}
                className={`flex-1 text-[12px] font-bold rounded-md py-2 transition-colors ${
                  scoreMode === 'set' ? 'bg-red text-white' : 'bg-paper text-muted'
                }`}
              >
                Set exact score
              </button>
            </div>

            <label className="block text-[12px] font-semibold text-muted mb-1.5">
              {scoreMode === 'add' ? 'Points to add' : 'New total score'}
            </label>
            <input
              autoFocus
              type="number"
              value={pointsInput}
              min={scoreMode === 'add' ? '1' : '0'}
              onChange={(e) => setPointsInput(e.target.value)}
              className="w-full border border-line text-[#091f2f] rounded-lg px-3 py-2 text-[13px] mb-4 focus:outline-none focus:border-red"
            />

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setModalTeam(null)}
                className="px-4 py-2 text-[12.5px] font-semibold text-muted hover:text-[#091f2f] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-red hover:bg-red-deep disabled:opacity-60 text-white text-[12.5px] font-bold rounded px-4 py-2 transition-colors"
              >
                {saving
                  ? 'Saving...'
                  : scoreMode === 'add'
                  ? 'Add points'
                  : 'Set score'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create game modal */}
      {canManage && (
        <Modal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          title="Start a new game"
        >
          <form onSubmit={handleCreateGame}>
            <label className="block text-[12px] font-semibold text-muted mb-1.5">
              Game name
            </label>
            <input
              autoFocus
              type="text"
              value={newGameName}
              onChange={(e) => setNewGameName(e.target.value)}
              placeholder="e.g. Maths Quiz"
              className="w-full border border-line rounded-lg px-3 py-2 text-[13px] text-[#091f2f] mb-4 focus:outline-none focus:border-red"
            />

            <label className="block text-[12px] font-semibold text-muted mb-1.5">
              Teams playing
            </label>
            <div className="flex flex-col gap-2 mb-4 max-h-[160px] overflow-y-auto">
              {rosterTeams.map((t) => (
                <label
                  key={t.id}
                  className="flex items-center gap-2 text-[13px] text-[#091f2f] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedTeamIds.includes(t.id)}
                    onChange={() => toggleTeamSelected(t.id)}
                    className="accent-red"
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: t.color }}
                  />
                  {t.name}
                </label>
              ))}
              {rosterTeams.length === 0 && (
                <span className="text-[12.5px] text-faint">
                  No teams found — add teams first.
                </span>
              )}
            </div>

            {createError && (
              <div className="text-[12.5px] text-red font-medium mb-3">
                {createError}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="px-4 py-2 text-[12.5px] font-semibold text-muted hover:text-[#091f2f] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || !newGameName.trim() || selectedTeamIds.length === 0}
                className="bg-red hover:bg-red-deep disabled:opacity-60 text-white text-[12.5px] font-bold rounded px-4 py-2 transition-colors"
              >
                {creating ? 'Starting...' : 'Start game'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* End / delete confirmation modals */}
      {canManage && liveGame && (
        <>
          <ConfirmModal
            isOpen={endOpen}
            onClose={() => setEndOpen(false)}
            onConfirm={handleConfirmEndGame}
            title="End this game?"
            message={`End "${liveGame.name}" and save these scores to the season standings? This can't be undone.`}
            confirmLabel="End game"
            loading={ending}
            error={actionError}
          />
          <ConfirmModal
            isOpen={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            onConfirm={handleConfirmDeleteGame}
            title="Delete this game?"
            message={`Delete "${liveGame.name}" entirely? All current scores are discarded and nothing is saved to the season standings. Use "End game" instead if you want to keep them.`}
            confirmLabel="Delete game"
            loading={deleting}
            error={actionError}
          />
        </>
      )}
    </div>
  )
}