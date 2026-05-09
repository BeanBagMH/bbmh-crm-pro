import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { CRMTask, TaskStatus, Priority } from '../../types'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface TaskFormProps {
  initialData?: Partial<CRMTask>
  onSuccess: () => void
  onCancel: () => void
}

const TaskForm: React.FC<TaskFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [isSaving, setIsSaving] = useState(false)
  const [projects, setProjects] = useState<{id: string, title: string}[]>([])
  const [formData, setFormData] = useState<Partial<CRMTask>>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: new Date().toISOString().split('T')[0],
    project_id: '',
    ...initialData
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    const { data } = await supabase.from('projects').select('id, title')
    if (data) setProjects(data)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) return toast.error('Title is required')

    try {
      setIsSaving(true)
      if (initialData?.id) {
        const { error } = await supabase
          .from('tasks')
          .update(formData)
          .eq('id', initialData.id)
        if (error) throw error
        toast.success('Task updated successfully')
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert([formData])
        if (error) throw error
        toast.success('Task added successfully')
      }
      onSuccess()
    } catch (error: any) {
      toast.error('Error saving task: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="stat-card-label mb-2 block">Task Title</label>
          <input 
            type="text" 
            required 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none" 
            placeholder="e.g. Follow up with John" 
          />
        </div>
        <div>
          <label className="stat-card-label mb-2 block">Description</label>
          <textarea 
            value={formData.description || ''} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
            rows={3} 
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none resize-none" 
            placeholder="Task details..." 
          />
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
        <button type="button" onClick={onCancel} className="flex-1 px-6 py-3 rounded-xl border border-[var(--border)] font-bold text-dim hover:bg-[var(--surface2)] transition-all">Cancel</button>
        <button type="submit" disabled={isSaving} className="flex-1 btn-primary justify-center">
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'Save Task'}
        </button>
      </div>
    </form>
  )
}

export default TaskForm
