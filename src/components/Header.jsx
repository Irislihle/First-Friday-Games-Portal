import { Settings } from "lucide-react"
import {useState, useRef, useEffect} from 'react'

function getFormattedDate(){
 const d = new Date()
 const weekday = d.toLocaleDateString('en-US',{weekday:'short'}).toUpperCase()
 const day = String(d.getDate()).padStart(2,'0')
 const month = d.toLocaleDateString('en-US',{month:'short'}).toUpperCase()
 const year = d.getFullYear()
 return `${weekday} ' ${day} ${month} ${year}`
}

export default function Header({userName='Mokgadi M.', onLogout})
{ 
    const date = getFormattedDate()
    //Extracting initials from userName
    const initials = userName.split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()

    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(e){
            if(menuRef.current && !menuRef.current.contains(e.target)){
                setMenuOpen(false)
            }
        }
        function handleEscape(e){
            if(e.key === 'Escape') setMenuOpen(false)
        }
       if(menuOpen){
        document.addEventListener('mousedown',handleClickOutside)
        document.addEventListener('keydown',handleEscape)
       }
       
       return () =>{
        document.removeEventListener('mousedown',handleClickOutside)
        document.removeEventListener('keydown',handleClickOutside)
       }
    }, [menuOpen])

    function handleLogout(){
        setMenuOpen(false)
        if(onLogout){
            onLogout()
        }else{
            console.log('Logout clicked - wire up real logout logic via the onlogout prop')
        }
    }

    return(
    <div className="bg-[#091f2f] text-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-[42px] h-[42px] rounded-full bg-[#ED1940] flex items-center justify-center font-display
            text-[13px] font-semibold">
                FFGP
            </div>
            <div>
            <div className="font-bold text-[15px] tracking-tight">
                First Friday Games Portal 
            </div>
            <div className="text-[12px] font-mono text-[#9FB2C0] mt-0.5 ">
                {date}
            </div>
            </div>
        </div>

        {/*User avatar*/}
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[13px] text-[#D3DDE4">
                <div className="w-[26px] h-[26px] rounded-full bg-[#9cb1be] flex items-center justify-center text-[11px] font-bold">
                    {initials}
                </div>
                 {userName}
            </div>
             
             <div className="relative" ref={menuRef}>
             <button
             onClick={() => setMenuOpen((prev) => !prev)}
             aria-label="settings"
             aria-expanded={menuOpen}   
            className="w-8 h-8 flex items-centre justify-center ">
                <Settings size={24} color='#9cb1be' strokeWidth={2} className="hover:bg-white transition-colors"/>
            </button>
            {menuOpen &&(
                <div className="asbsolute right-0 top-full mt-2 w-40 bg-white rounded-lg shado w-card overflow-hidden z-50">
           
                <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text=[13px
                        font-semibold text-[#091f2f] hover:bg-paper transition-colors">
                    Logout
                </button>
             </div>
            
            )}
          </div>

           
        </div>
</div>
    )
}