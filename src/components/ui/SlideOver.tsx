import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface SlideOverProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

const SlideOver: React.FC<SlideOverProps> = ({ isOpen, onClose, title, children }) => {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay */}
      <div 
        ref={overlayRef}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" 
      />
      
      {/* Panel */}
      <div className="relative w-full max-w-md h-full bg-[var(--surface)] shadow-2xl border-l border-[var(--border)] flex flex-col animate-in slide-in-from-right duration-300 ease-out">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <h2 className="text-xl font-bold font-serif italic">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[var(--surface2)] rounded-xl transition-all text-dim hover:text-[var(--accent)]"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export default SlideOver
