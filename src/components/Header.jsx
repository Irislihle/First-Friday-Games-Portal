import { useState, useRef, useEffect } from 'react'

function getFormattedDate() {
  const d = new Date()
  const weekday = d
    .toLocaleDateString('en-US', { weekday: 'short' })
    .toUpperCase()
  const day = String(d.getDate()).padStart(2, '0')
  const month = d
    .toLocaleDateString('en-US', { month: 'short' })
    .toUpperCase()
  const year = d.getFullYear()
  return `${weekday} · ${day} ${month} ${year}`
}

export default function Header({ userName = 'Iris M.', onLogout }) {
  const date = getFormattedDate()
  const initials = userName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [menuOpen])

  function handleLogout() {
    setMenuOpen(false)
    if (onLogout) {
      onLogout()
    } else {
      console.log(
        'Logout clicked — wire up real logout logic via the onLogout prop'
      )
    }
  }

  return (
    <div className="bg-navy text-white px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <div className="w-9 h-9 sm:w-[42px] sm:h-[42px] rounded-full bg-red flex items-center justify-center font-display text-[11px] sm:text-[13px] shadow-[inset_0_0_0_2px_rgba(255,255,255,0.18)] flex-shrink-0">
          FFGP
        </div>
        <div className="min-w-0">
          <div className="font-extrabold text-[13px] sm:text-[15px] tracking-tight truncate">
            First Friday Games Portal
          </div>
          <div className="text-[10px] sm:text-[12px] font-mono text-[#9FB2C0] mt-0.5">
            {date}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4">
        <div className="flex items-center gap-2 text-[13px] text-[#D3DDE4]">
          <div className="w-[26px] h-[26px] rounded-full bg-navy-soft flex items-center justify-center text-[11px] font-bold flex-shrink-0">
            {initials}
          </div>
          <span className="hidden sm:inline">{userName}</span>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Settings"
            aria-expanded={menuOpen}
            className="w-8 h-8 rounded-lg bg-navy-soft flex items-center justify-center text-[#9FB2C0] text-sm flex-shrink-0 hover:text-white transition-colors"
          >
            ⚙
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-card overflow-hidden z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-navy hover:bg-paper transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}