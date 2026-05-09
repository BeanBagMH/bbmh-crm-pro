import React from 'react'
import { 
  Users, 
  Target, 
  CheckSquare, 
  TrendingDown, 
  TrendingUp, 
  X,
  Plus
} from 'lucide-react'
import { useQuickAdd } from '../context/QuickAddContext'

const QuickAddMenu: React.FC = () => {
  const { activeType, close, open } = useQuickAdd()

  if (activeType !== 'menu') return null

  const actions = [
    { id: 'client', label: 'New Client', icon: Users, color: 'var(--blue)', desc: 'Add a business relationship' },
    { id: 'project', label: 'New Project', icon: Target, color: 'var(--accent)', desc: 'Start a new client project' },
    { id: 'task', label: 'New Task', icon: CheckSquare, color: 'var(--purple)', desc: 'Assign a task to someone' },
    { id: 'person', label: 'New Person', icon: Users, color: 'var(--blue)', desc: 'Add a team member or vendor' },
    { id: 'expense', label: 'New Expense', icon: TrendingDown, color: 'var(--red)', desc: 'Record a business outgoing', type: 'transaction', data: { type: 'expense' } },
    { id: 'income', label: 'New Income', icon: TrendingUp, color: 'var(--green)', desc: 'Record revenue received', type: 'transaction', data: { type: 'income' } },
  ]

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div 
        onClick={close}
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" 
      />

      {/* Menu Card */}
      <div className="relative w-full max-w-2xl bg-[var(--surface)] border border-[var(--border)] rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-serif italic font-bold mb-2">Quick Actions</h2>
              <p className="text-dim text-sm">Select an action to get started immediately.</p>
            </div>
            <button 
              onClick={close}
              className="w-12 h-12 rounded-full bg-[var(--surface2)] flex items-center justify-center text-dim hover:bg-[var(--surface3)] transition-all"
            >
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => open(action.type as any || action.id as any, action.data)}
                className="group flex items-center gap-5 p-6 rounded-3xl bg-[var(--surface2)] hover:bg-[var(--accent)] border border-[var(--border)] transition-all text-left"
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110"
                  style={{ backgroundColor: `${action.color}15`, color: action.color }}
                >
                  <action.icon size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-lg group-hover:text-white transition-colors">{action.label}</h3>
                  <p className="text-xs text-dim group-hover:text-white/60 transition-colors">{action.desc}</p>
                </div>
                <Plus className="ml-auto w-5 h-5 text-faint group-hover:text-white/40 group-hover:rotate-90 transition-all" />
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-[var(--surface2)] p-6 border-t border-[var(--border)] flex justify-center">
          <p className="text-[10px] font-mono text-dim uppercase tracking-widest">BBMh Business Hub — Quick Add System</p>
        </div>
      </div>
    </div>
  )
}

export default QuickAddMenu
