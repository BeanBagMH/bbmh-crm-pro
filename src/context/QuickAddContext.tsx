import React, { createContext, useContext, useState } from 'react'

export type QuickAddType = 'client' | 'project' | 'task' | 'transaction' | 'person' | 'menu' | 'none'

interface QuickAddContextType {
  activeType: QuickAddType
  initialData: any
  open: (type: QuickAddType, data?: any) => void
  close: () => void
}

const QuickAddContext = createContext<QuickAddContextType | undefined>(undefined)

export const QuickAddProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeType, setActiveType] = useState<QuickAddType>('none')
  const [initialData, setInitialData] = useState<any>(null)

  const open = (type: QuickAddType, data: any = null) => {
    setActiveType(type)
    setInitialData(data)
  }

  const close = () => {
    setActiveType('none')
    setInitialData(null)
  }

  return (
    <QuickAddContext.Provider value={{ activeType, initialData, open, close }}>
      {children}
    </QuickAddContext.Provider>
  )
}

export const useQuickAdd = () => {
  const context = useContext(QuickAddContext)
  if (!context) {
    throw new Error('useQuickAdd must be used within a QuickAddProvider')
  }
  return context
}
