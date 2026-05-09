import React, { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      />
      <div className="bg-[var(--s1)] border border-[var(--border)] w-full max-w-xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between p-8 border-b border-[var(--border)]">
          <h2 className="font-serif text-3xl italic">{title}</h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[var(--s2)] flex items-center justify-center hover:bg-[var(--red)]/10 hover:text-[var(--red)] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
