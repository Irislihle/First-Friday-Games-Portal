import {useState} from 'react'
import Modal from './Modal'
import {addPlayer} from '../services/api'


export default function RosterCard({team}){

       const [players, setPlayers] = useState(team.players)
       const [adding, setAdding] = useState(false)
       const [modalOpen, setModalOpen] = useState(false)
       const [name, setName] = useState(' ')

       async function handleSubmit(e){
         e.preventDefault()
         if(!name.trim()) return
         setAdding(true)
         try{
            await addPlayer(team.id, name.trim())
            setPlayers((prev) => [...prev, name.trim()])
            setName('')
            setModalOpen(false)
         }finally{
            setAdding(false)
         }
       }


    return(
        <div className='bg-white border border-line rounded-md shadow-card overflow-hidden' >

        <div className='h-1' style={{backgroundColor: team.color}} />
        <div className='flex items-center gap-2.5 px-4 pt-3.5 pb-3 border-b border-line'>
            <div className='w-3.5 h-3.5 rounded' style={{backgroundColor: team.color}} />
             <div className='font-bold text-[14px]'>{team.name}</div>
             <div className='ml-auto font-mono text-[11px] text-faint' >{players.length} players</div>
        </div>
        
        <ul className='px-4 py-3 flex flex-col gap-2.5'>
           {players.map((n, i) => (
            <li key={n} className='flex items-center gap-2.5 text-[13px]'>
               <span className='w-[18px] h-[18px] rounded bg-paper text-[#5B6D7B] font-mono 
               text-[10px] font-bold flex items-center justify-center flex-shrink-0'>
                  {i + 1}
               </span>
               <span className='truncate'>{n}</span>
            </li>
           ))}
        </ul>
        
        <button
        onClick={() => setModalOpen(true)}
        className='block w-[calc(100%-32px)] mx-4 mb-4 bg-red hover:bg-red-deep
        disabled:opacity-60 text-white font-bold text-[12.5px] rounded-lg py-2.5 transition-colors'
        >
         + Add a player
        </button>

       <Modal isOpen={modalOpen} onClose={() => setModalOpen (false)} title={`Add a player to ${team.name}`} >
           <form onSubmit={handleSubmit}>
             <input autoFocus type="" value={name} name="playerName" autoComplete='off' onChange={(e) => setName(e.target.value)}
              placeholder="Player name"
             className='w-full border border-line rounded-lg px-3 py-2 text-[13px]
       mb-4 focus:outline-none focus:border-red'/>
               <div className='flex gap-2 justify-end'>
               <button type="button"
               onClick={() => setModalOpen(false)}
               className='px-4 py-2 text-[12.px] font-semibold text-muted hover:text-[#091f2f] transition-colors'>
                  Cancel
               </button>   
               <button
                type="submit"
                disabled={adding}
                className='bg-red hover:bg-red-deep disabled:opacity-60 text-white text-[12.5px] font-bold rounded px-4 py-2 transition-colors'>
                  {adding ? 'Adding...' : 'Add player'}
               </button>
            </div>
         </form>
     </Modal>
</div>
    )
}