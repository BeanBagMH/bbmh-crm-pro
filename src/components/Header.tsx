import React, { useState, useEffect } from 'react'
import { Search, Moon, Sun, Plus } from 'lucide-react'
import { useQuickAdd } from '../context/QuickAddContext'

const Header: React.FC = () => {
  const { open } = useQuickAdd()
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')

  return (
    <header className="header">
      <input 
        type="text" 
        placeholder="Search clients, projects, invoices..." 
        className="header-search"
      />

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl bg-[var(--surface2)] hover:bg-[var(--surface3)] border border-[var(--border)] flex items-center justify-center text-dim hover:text-[var(--text)] transition-all"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <button 
          onClick={() => open('menu')}
          className="btn-quick-add"
        >
          <Plus size={18} />
          Quick Add
        </button>
      </div>
    </header>
  )
}

export default Header
