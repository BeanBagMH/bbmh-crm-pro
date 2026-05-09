import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Project, ProjectStage, ProjectStatus, Priority } from '../../types'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ProjectFormProps {
  initialData?: Partial<Project>
  onSuccess: () => void
  onCancel: () => void
}

const stages: ProjectStage[] = ['discovery', 'proposal', 'active', 'revision', 'delivered', 'invoiced']

const ProjectForm: React.FC<ProjectFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [isSaving, setIsSaving] = useState(false)
  const [clients, setClients] = useState<{id: string, name: string}[]>([])
  
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    client_id: '',
    description: '',
    status: 'active',
    stage: 'discovery',
    priority: 'medium',
    value: 0,
    paid: 0,
    ...initialData
  })

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients() {
    const { data } = await supabase.from('clients').select('id, name')
    if (data) setClients(data)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) return toast.error('Title is required')
    if (!formData.client_id) return toast.error('Client is required')

    try {
      setIsSaving(true)
      if (initialData?.id) {
        const { error } = await supabase
          .from('projects')
          .update(formData)
          .eq('id', initialData.id)
        if (error) throw error
        toast.success('Project updated successfully')
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([formData])
        if (error) throw error
        toast.success('Project added successfully')
      }
      onSuccess()
    } catch (error: any) {
      toast.error('Error saving project: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="stat-card-label mb-2 block">Project Title</label>
          <input 
            type="text" 
            required
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all"
            placeholder="e.g. Website Rebrand"
          />
        </div>
        <div>
          <label className="stat-card-label mb-2 block">Select Client</label>
          <select 
            required
            value={formData.client_id}
            onChange={e => setFormData({...formData, client_id: e.target.value})}
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all"
          >
            <option value="">Select a client...</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="stat-card-label mb-2 block">Status</label>
            <select 
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value as ProjectStatus})}
              className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all capitalize"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="complete">Complete</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="stat-card-label mb-2 block">Priority</label>
            <select 
              value={formData.priority}
              onChange={e => setFormData({...formData, priority: e.target.value as Priority})}
              className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all capitalize"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-6 flex gap-3">
        <button 
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 rounded-xl border border-[var(--border)] font-bold text-dim hover:bg-[var(--surface2)] transition-all"
        >
          Cancel
        </button>
        <button 
          type="submit"
          disabled={isSaving}
          className="flex-1 btn-primary justify-center"
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'Save Project'}
        </button>
      </div>
    </form>
  )
}

export default ProjectForm
