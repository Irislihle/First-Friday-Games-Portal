import { useState, useEffect } from 'react'
import Modal from './Modal'
import ConfirmModal from './ConfirmModal'
import { addPlayer, updatePlayer, deletePlayer, deleteTeam } from '../services/api'
import { Pencil, Trash2 } from 'lucide-react'

export default function RosterCard({ team, canManage = false, onTeamDeleted }) {
  const [players, setPlayers] = useState(team.players ?? [])

  // Add player
  const [adding, setAdding] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')

  // Edit player
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [editName, setEditName] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  // Delete player (confirm modal)
  const [playerToDelete, setPlayerToDelete] = useState(null)
  const [deletingPlayerId, setDeletingPlayerId] = useState(null)
  const [deletePlayerError, setDeletePlayerError] = useState('')

  // Delete team (confirm modal)
  const [deleteTeamOpen, setDeleteTeamOpen] = useState(false)
  const [deletingTeam, setDeletingTeam] = useState(false)
  const [deleteTeamError, setDeleteTeamError] = useState('')

  useEffect(() => {
    setPlayers(team.players ?? [])
  }, [team.id, team.players])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setAdding(true)
    try {
      const created = await addPlayer(team.id, name.trim())
      const newPlayer = created?.id
        ? created
        : {
            id:
              typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            name: name.trim(),
          }
      setPlayers((prev) => [...prev, newPlayer])
      setName('')
      setModalOpen(false)
    } finally {
      setAdding(false)
    }
  }

  function openEdit(player) {
    setEditingPlayer(player)
    setEditName(player.name)
  }

  async function handleEditSubmit(e) {
    e.preventDefault()
    if (!editName.trim() || !editingPlayer) return
    setSavingEdit(true)
    try {
      await updatePlayer(team.id, editingPlayer.id, editName.trim())
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === editingPlayer.id ? { ...p, name: editName.trim() } : p
        )
      )
      setEditingPlayer(null)
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleConfirmDeletePlayer() {
    if (!playerToDelete) return
    setDeletingPlayerId(playerToDelete.id)
    setDeletePlayerError('')
    try {
      await deletePlayer(team.id, playerToDelete.id)
      setPlayers((prev) => prev.filter((p) => p.id !== playerToDelete.id))
      setPlayerToDelete(null)
    } catch (err) {
      console.error('deletePlayer failed:', err)
      setDeletePlayerError(err.message || 'Could not remove the player.')
    } finally {
      setDeletingPlayerId(null)
    }
  }

  async function handleDeleteTeam() {
    setDeletingTeam(true)
    setDeleteTeamError('')
    try {
      await deleteTeam(team.id)
      onTeamDeleted?.(team.id)
    } catch (err) {
      console.error('deleteTeam failed:', err)
      setDeleteTeamError(err.message || 'Could not delete the team.')
      setDeletingTeam(false)
    }
  }

  return (
    <div className="bg-white border border-line rounded-md shadow-card overflow-hidden transition-shadow duration-200 hover:shadow-lg">
      <div className="h-1" style={{ backgroundColor: team.color }} />

      <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-3 border-b border-line">
        <div
          className="w-3.5 h-3.5 rounded"
          style={{ backgroundColor: team.color }}
        />
        <div className="font-bold text-[14px]">{team.name}</div>
        <div className="ml-auto flex items-center gap-2">
          <span className="font-mono text-[11px] text-faint">
            {players.length} players
          </span>
          {canManage && (
            <button
              onClick={() => {
                setDeleteTeamError('')
                setDeleteTeamOpen(true)
              }}
              disabled={deletingTeam}
              aria-label={`Delete ${team.name}`}
              title="Delete team"
              className="text-faint hover:text-red p-1 rounded transition-colors disabled:opacity-50"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <ul className="px-4 py-3 flex flex-col gap-2.5">
        {players.map((p, i) => (
          <li key={p.id} className="flex items-center gap-2.5 text-[13px] group">
            <span className="w-[18px] h-[18px] rounded bg-paper text-[#5B6D7B] font-mono text-[10px] font-bold flex items-center justify-center flex-shrink-0">
              {i + 1}
            </span>
            <span className="truncate flex-1">{p.name}</span>
            {canManage && (
              <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(p)}
                  aria-label={`Edit ${p.name}`}
                  className="text-faint hover:text-navy p-1 rounded transition-colors"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => {
                    setDeletePlayerError('')
                    setPlayerToDelete(p)
                  }}
                  disabled={deletingPlayerId === p.id}
                  aria-label={`Remove ${p.name}`}
                  className="text-faint hover:text-red p-1 rounded transition-colors disabled:opacity-50"
                >
                  <Trash2 size={13} />
                </button>
              </span>
            )}
          </li>
        ))}
      </ul>

      {canManage && (
        <button
          onClick={() => setModalOpen(true)}
          className="block w-[calc(100%-32px)] mx-4 mb-4 bg-red hover:bg-red-deep disabled:opacity-60 text-white font-bold text-[12.5px] rounded-lg py-2.5 transition-colors"
        >
          + Add a player
        </button>
      )}

      {/* Add player modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Add a player to ${team.name}`}
      >
        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            type="text"
            value={name}
            name="playerName"
            autoComplete="off"
            onChange={(e) => setName(e.target.value)}
            placeholder="Player name"
            className="w-full border border-line text-[#091f2f] rounded-lg px-3 py-2 text-[13px] mb-4 focus:outline-none focus:border-red"
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-[12.5px] font-semibold text-muted hover:text-[#091f2f] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={adding}
              className="bg-red hover:bg-red-deep disabled:opacity-60 text-white text-[12.5px] font-bold rounded px-4 py-2 transition-colors"
            >
              {adding ? 'Adding...' : 'Add player'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit player modal */}
      <Modal
        isOpen={!!editingPlayer}
        onClose={() => setEditingPlayer(null)}
        title="Edit player"
      >
        <form onSubmit={handleEditSubmit}>
          <input
            autoFocus
            type="text"
            value={editName}
            name="editPlayerName"
            autoComplete="off"
            onChange={(e) => setEditName(e.target.value)}
            className="w-full border border-line text-[#091f2f] rounded-lg px-3 py-2 text-[13px] mb-4 focus:outline-none focus:border-red"
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setEditingPlayer(null)}
              className="px-4 py-2 text-[12.5px] font-semibold text-muted hover:text-[#091f2f] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingEdit}
              className="bg-red hover:bg-red-deep disabled:opacity-60 text-white text-[12.5px] font-bold rounded px-4 py-2 transition-colors"
            >
              {savingEdit ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {canManage && (
        <>
          {/* Remove player confirmation */}
          <ConfirmModal
            isOpen={!!playerToDelete}
            onClose={() => setPlayerToDelete(null)}
            onConfirm={handleConfirmDeletePlayer}
            title="Remove player?"
            message={`Remove ${playerToDelete?.name ?? ''} from ${team.name}? This can't be undone.`}
            confirmLabel="Remove player"
            loading={deletingPlayerId !== null}
            error={deletePlayerError}
          />

          {/* Delete team confirmation */}
          <ConfirmModal
            isOpen={deleteTeamOpen}
            onClose={() => setDeleteTeamOpen(false)}
            onConfirm={handleDeleteTeam}
            title={`Delete ${team.name}?`}
            message={`This removes ${team.name}, all of its players, and its past results from the season standings. This can't be undone.`}
            confirmLabel="Delete team"
            loading={deletingTeam}
            error={deleteTeamError}
          />
        </>
      )}
    </div>
  )
}
