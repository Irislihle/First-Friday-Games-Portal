import { useEffect } from "react";

export default function Modal({ isOpen, onClose, title, children}){
    useEffect(() =>{
        function handleEscape(e){
            if(e.key === 'Escape') onClose()
        }
        if (isOpen) document.addEventListener('keydown', handleEscape)
            return () => document.removeEventListener('keydown',handleEscape)
    }, [isOpen, onClose])
     if(!isOpen) return null

     return(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#091f2f]/50 px-4"
              onClick={onClose}
       >
      <div className="bg-white rounded-md shadow-card w-full max-w-sm p-6"
      onClick={(e) => e.stopPropagation()}>  
       <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[15px] text-[#091f2f]">{title}</h3>
        <button
        onClick={onClose}
        className="text-faint hover:text-[#091f2f] text-lg leading-none"
        arial-label="close"> &times; </button>
       </div>

         {children}
  </div>
</div>
 )
}