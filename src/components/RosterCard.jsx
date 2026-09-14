import {useState, useEffect} from 'react'
import Modal from './Modal'
import {addPlayer, updatePlayer, deletePlayer} from '../services/api'
import {Pencil, Trash2} from 'lucide-react'


export default function RosterCard({team, canManage = false}){

       const [players, setPlayers] = useState(team.players)
       const [adding, setAdding] = useState(false)
       const [modalOpen, setModalOpen] = useState(false)
       const [name, setName] = useState(' ')

       const [editingPlayer, setEditingPlayer] = useState(null)
       const [editName, setEditName] = useState('')
       const [savingEdit, setSavingEdit] = useState(false)

       const [deletingId, setDeletingId] = useState(null)

       useEffect(() => {
         setPlayers(team.players)
       }, [team.players])

       async function handleSubmit(e){
         e.preventDefault()
         if(!name.trim()) return
         setAdding(true)
         try{
            const created = await addPlayer(team.id, name.trim())
            const newPlayer = created?.id
            ? created
            : {
               id:
               typeof crypto !== 'undefined' && crypto.randomUUID
               ? crypto.randomUUID
               : `temp-${Date.now()}-${Math.random().toString(36).slice(2,9)}`,
               name: name.trim(),
            }
            setPlayers((prev) => [...prev, newPlayer])
            setName('')
            setModalOpen(false)
         }finally{
            setAdding(false)
         }
       }

       function openEdit(player){
         setEditingPlayer(player)
         setEditName(player.name)
       }

       async function handleEditSubmit(e){
         e.preventDefault()
         if(!editName.trim() || !editingPlayer) return
         setSavingEdit(true)
       
       try{
         await updatePlayer(team.id, editingPlayer.id, editName.trim())
         setPlayers((prev) =>
         prev.map((p) =>
          p.id === editingPlayer.id ? {...p, name: editName.trim()} : p 
          )
         )
         setEditingPlayer(null)
       }finally{
         setSavingEdit(false)
       }
      }

      async function handleDelete(player){
         const confirmed = window.confirm(
            `Remove ${player.name} from ${team.name}?`
         )
         if(!confirmed) return
         setDeletingId(player.id)
         try{
            await deletePlayer(team.id, player.id)
            setPlayers((prev) => prev.filter((p) => p.id !== player.id))
         }finally{
            setDeletingId(null)
         }
      }


    return(
     <div className="bg-white border border-line rounded-md shadow-card overflow-hidden transition-shadow duration-200 hover:shadow-lg">
      <div className="h-1" style={{ backgroundColor: team.color }} />

      <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-3 border-b border-line">
        <div
          className="w-3.5 h-3.5 rounded"
          style={{ backgroundColor: team.color }}
        />
        <div className="font-bold text-[14px]">{team.name}</div>
        <div className="ml-auto font-mono text-[11px] text-faint">
          {players.length} players
        </div>
      </div>

      <ul className="px-4 py-3 flex flex-col gap-2.5">
        {players.map((p, i) => (
          <li
            key={p.id}
            className="flex items-center gap-2.5 text-[13px] group"
          >
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
                  onClick={() => handleDelete(p)}
                  disabled={deletingId === p.id}
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
            className="w-full border border-line rounded-lg px-3 py-2 text-[13px] mb-4 focus:outline-none focus:border-red"
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
            className="w-full border border-line rounded-lg px-3 py-2 text-[13px] mb-4 focus:outline-none focus:border-red"
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
    </div>
    )
}