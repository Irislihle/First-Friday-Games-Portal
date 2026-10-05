import { useState } from 'react'
import RosterCard from './RosterCard.jsx'
import Modal from './Modal.jsx'
import { createTeam } from '../services/api'
import { Plus } from 'lucide-react'

const COLOR_PRESETS = ['#ED1940', '#a8b9c5', '#202020', '#00B8DD', '#F59B32', '#6B3FA1']

export default function RosterGrid({ rosters, canManage = false, onTeamAdded, onTeamDeleted }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLOR_PRESETS[0])
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  function openModal() {
    setName('')
    setColor(COLOR_PRESETS[rosters.length % COLOR_PRESETS.length])
    setError('')
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return

    setCreating(true)
    setError('')
    try {
      const newTeam = await createTeam(name.trim(), color)
      onTeamAdded?.(newTeam)
      setModalOpen(false)
    } catch (err) {
      setError(err.message || 'Could not create team.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <div className="mt-9 mb-3.5 flex items-center gap-2.5 ">
        <h2 className="font-extrabold text-[16px]">Team rosters</h2>
        <div className="flex-1 h-px bg-line" />
        {canManage && (
          <button
            onClick={openModal}
            className="flex items-center gap-1.5 text-[12px] font-bold text-red hover:text-red-deep transition-colors"
          >
            <Plus size={14} />
            Add team
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ">
        {rosters.map((team) => (
          <RosterCard key={team.id} team={team} canManage={canManage} onTeamDeleted={onTeamDeleted} />
        ))}
      </div>

      {canManage && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add a new team">
          <form onSubmit={handleSubmit}>
            <label className="block text-[12px] font-semibold text-muted mb-1.5">Team name</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Team Blue"
              className="w-full border border-line text-[#091f2f] rounded-lg px-3 py-2 text-[13px] mb-4 focus:outline-none focus:border-red"
            />

            <label className="block text-[12px] font-semibold text-muted mb-1.5">Team color</label>
            <div className="flex items-center gap-2 mb-4">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Choose color ${c}`}
                  className={`w-7 h-7 rounded-full flex-shrink-0 transition-transform ${
                    color === c ? 'ring-2 ring-offset-2 ring-navy scale-105' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-7 h-7 rounded-full border border-line cursor-pointer"
                aria-label="Custom color"
              />
            </div>

            {error && <div className="text-[12.5px] text-red font-medium mb-3">{error}</div>}

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
                disabled={creating || !name.trim()}
                className="bg-red hover:bg-red-deep disabled:opacity-60 text-white text-[12.5px] font-bold rounded px-4 py-2 transition-colors"
              >
                {creating ? 'Adding...' : 'Add team'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}