import {useState} from 'react'
import Modal from './Modal'
import {addPoints} from '../services/api'
import {Pencil} from 'lucide-react'

export default function LiveGame({game, canManage = false}){
  
    const [teams,setTeams] = useState(game.teams)
    const [saving, setSaving] = useState(null)
    const [modalTeam, setModalTeam] = useState(null)
    const [pointsInput, setPointsInput] = useState('1')
    const [isEditing, setIsEditing] = useState(false)

async function handleSubmit(e){
e.preventDefault()
const amount = Number(pointsInput)
if(!amount || amount <= 0) return
setSaving(true)
try{
    await addPoints(modalTeam,amount)
    setTeams((prev) =>
    prev.map((t) => 
      t.name === modalTeam ? {...t,points:t.points + amount} : t
      )
    )
    setModalTeam(null)
    setPointsInput('1')
}finally{
    setSaving(false) 
}
    
}

return(
     <div className="mt-5 bg-[#091f2f] rounded-md shadow-card p-5 text-white">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-bold text-[15px] text-white">Current game</h2>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-cyan/15 text-cyan font-mono text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_0_3px_rgba(0,184,221,0.25)]" />
            Live
          </span>
          {canManage && (
            <button
              onClick={() => setIsEditing((prev) => !prev)}
              aria-label="Edit current game"
              aria-pressed={isEditing}
              className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
                isEditing
                  ? 'bg-cyan/20 text-cyan'
                  : 'text-[#9FB2C0] hover:bg-navy-soft hover:text-white'
              }`}
            >
              <Pencil size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="font-bold text-[16px] mb-3.5">{game.name}</div>

      <div className="flex flex-col gap-2">
        {teams.map((t) => (
          <div
            key={t.name}
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
                  onClick={() => setModalTeam(t.name)}
                  disabled={saving === t.name}
                  className="bg-red hover:bg-red-deep disabled:opacity-60 text-white text-[11px] font-bold rounded-md px-2.5 py-1.5 transition-colors"
                >
                  + Points
                </button>
              )}
            </span>
          </div>
        ))}
      </div>

      {canManage && (
        <Modal
          isOpen={!!modalTeam}
          onClose={() => setModalTeam(null)}
          title={`Add points to ${modalTeam}`}
        >
          <form onSubmit={handleSubmit}>
            <input
              autoFocus
              type="number"
              value={pointsInput}
              min="1"
              onChange={(e) => setPointsInput(e.target.value)}
              className="w-full border border-line rounded-lg px-3 py-2 text-[13px] mb-4 focus:outline-none focus:border-red"
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
                {saving ? 'Adding...' : 'Add points'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
 )
}