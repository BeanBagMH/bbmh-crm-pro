import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CRMTask, TaskStatus, Priority } from '../types'
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertTriangle, 
  User, 
  Loader2, 
  Trash2, 
  Edit3 
} from 'lucide-react'
import Badge from '../components/ui/Badge'
import SlideOver from '../components/ui/SlideOver'
import { toast } from 'sonner'

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<CRMTask[]>([])
  const [loading, setLoading] = useState(true)
  
  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<CRMTask | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<CRMTask>>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true })

      if (error) throw error
      setTasks(data || [])
    } catch (error: any) {
      toast.error('Failed to load tasks: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDrawer = (task?: CRMTask) => {
    if (task) {
      setEditingTask(task)
      setFormData(task)
    } else {
      setEditingTask(null)
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        due_date: new Date().toISOString().split('T')[0]
      })
    }
    setIsDrawerOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) return toast.error('Title is required')

    try {
      setIsSaving(true)
      if (editingTask) {
        const { error } = await supabase
          .from('tasks')
          .update(formData)
          .eq('id', editingTask.id)
        if (error) throw error
        toast.success('Task updated')
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert([formData])
        if (error) throw error
        toast.success('Task added')
      }
      setIsDrawerOpen(false)
      fetchTasks()
    } catch (error: any) {
      toast.error('Error saving: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
      toast.success('Task removed')
      fetchTasks()
    } catch (error: any) {
      toast.error('Error deleting: ' + error.message)
    }
  }

  const toggleStatus = async (task: CRMTask) => {
    const nextStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done'
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: nextStatus, completed_at: nextStatus === 'done' ? new Date().toISOString() : null })
        .eq('id', task.id)
      if (error) throw error
      fetchTasks()
    } catch (error: any) {
      toast.error('Failed to update status')
    }
  }

  const overdueTasks = tasks.filter(t => 
    t.status !== 'done' && 
    t.due_date && 
    new Date(t.due_date) < new Date()
  )

  const taskColumns: { status: TaskStatus; label: string }[] = [
    { status: 'todo', label: 'To Do' },
    { status: 'in_progress', label: 'In Progress' },
    { status: 'done', label: 'Done' }
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">Stay on top of your daily operations and deadlines.</p>
        </div>
        <button 
          onClick={() => handleOpenDrawer()}
          className="btn-primary"
        >
          <Plus size={18} />
          Add Task
        </button>
      </div>

      {overdueTasks.length > 0 && (
        <div className="mb-10 bg-[var(--red-dim)] border border-[var(--red)]/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-[var(--red)] mb-4">
            <AlertTriangle size={20} />
            <h2 className="font-bold">Overdue Attention Required ({overdueTasks.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overdueTasks.map(task => (
              <div key={task.id} className="bg-[var(--surface)] border border-[var(--red)]/20 p-4 rounded-xl flex items-start gap-3">
                <Circle size={18} className="text-[var(--red)] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold truncate">{task.title}</h4>
                  <p className="text-[10px] text-[var(--red)] font-mono uppercase mt-1">
                    Due {new Date(task.due_date!).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        {taskColumns.map(col => (
          <div key={col.status} className="flex flex-col">
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="font-bold text-lg lowercase">{col.label}</h3>
              <span className="nav-badge">{tasks.filter(t => t.status === col.status).length}</span>
            </div>
            
            <div className="space-y-4">
              {tasks.filter(t => t.status === col.status).map(task => (
                <div key={task.id} className="stat-card p-5 group relative">
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenDrawer(task)} className="p-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:text-[var(--accent)]"><Edit3 size={12}/></button>
                    <button onClick={() => handleDelete(task.id)} className="p-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:text-[var(--red)]"><Trash2 size={12}/></button>
                  </div>

                  <div className="flex items-start gap-4 mb-4">
                    <button 
                      onClick={() => toggleStatus(task)}
                      className="mt-1 text-dim hover:text-[var(--accent)] transition-colors"
                    >
                      {task.status === 'done' ? <CheckCircle2 size={20} className="text-[var(--green)]" /> : <Circle size={20} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold text-sm leading-tight mb-1 ${task.status === 'done' ? 'line-through text-dim' : ''}`}>
                        {task.title}
                      </h4>
                      {task.description && <p className="text-xs text-dim line-clamp-2">{task.description}</p>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                    <div className="flex items-center gap-1.5 text-[10px] text-dim font-bold uppercase tracking-wider">
                      <Clock size={14} />
                      {task.due_date ? new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'No date'}
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[var(--surface2)] border border-[var(--border)] flex items-center justify-center">
                      <User size={12} className="text-dim" />
                    </div>
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.status === col.status).length === 0 && (
                <div className="py-12 text-center border-2 border-dashed border-[var(--border)] rounded-3xl">
                  <p className="text-sm text-dim italic">No tasks {col.label.toLowerCase()}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Drawer */}
      <SlideOver 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        title={editingTask ? 'Edit Task' : 'New Task'}
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="stat-card-label mb-2 block">Task Title</label>
              <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none" placeholder="e.g. Follow up with John" />
            </div>
            <div>
              <label className="stat-card-label mb-2 block">Description</label>
              <textarea value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none resize-none" placeholder="Task details..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="stat-card-label mb-2 block">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as TaskStatus})} className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none">
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div>
                <label className="stat-card-label mb-2 block">Priority</label>
                <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as Priority})} className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div>
              <label className="stat-card-label mb-2 block">Due Date</label>
              <input type="date" value={formData.due_date || ''} onChange={e => setFormData({...formData, due_date: e.target.value})} className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none" />
            </div>
          </div>

          <div className="pt-6 flex gap-3">
            <button type="button" onClick={() => setIsDrawerOpen(false)} className="flex-1 px-6 py-3 rounded-xl border border-[var(--border)] font-bold text-dim hover:bg-[var(--surface2)] transition-all">Cancel</button>
            <button type="submit" disabled={isSaving} className="flex-1 btn-primary justify-center">
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'Save Task'}
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  )
}

export default Tasks
