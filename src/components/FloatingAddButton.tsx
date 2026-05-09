import React from 'react'
import { Plus } from 'lucide-react'
import { useQuickAdd } from '../context/QuickAddContext'

const FloatingAddButton: React.FC = () => {
  const { open } = useQuickAdd()
  
  return (
    <button 
      onClick={() => open('menu')}
      className="fixed bottom-8 right-8 w-14 h-14 bg-[var(--accent)] text-white rounded-2xl shadow-2xl shadow-[var(--accent)]/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group"
    >
      <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
    </button>
  )
}

export default FloatingAddButton
