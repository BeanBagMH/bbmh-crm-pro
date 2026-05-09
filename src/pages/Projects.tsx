import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Project, ProjectStage, ProjectStatus, Priority } from '../types'
import { Plus, Search, LayoutGrid, List, Loader2 } from 'lucide-react'
import KanbanColumn from '../components/KanbanColumn'
import SlideOver from '../components/ui/SlideOver'
import { toast } from 'sonner'

const stages: ProjectStage[] = ['discovery', 'proposal', 'active', 'revision', 'delivered', 'invoiced']

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Record<string, { name: string, id: string }>>({})
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  
  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    client_id: '',
    description: '',
    status: 'active',
    stage: 'discovery',
    priority: 'medium',
    value: 0,
    paid: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const [projectsRes, clientsRes] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('clients').select('id, name')
      ])

      if (projectsRes.error) throw projectsRes.error
      if (clientsRes.error) throw clientsRes.error

      setProjects(projectsRes.data || [])
      
      const clientMap: Record<string, { name: string, id: string }> = {}
      clientsRes.data?.forEach(c => clientMap[c.id] = { name: c.name, id: c.id })
      setClients(clientMap)
    } catch (error: any) {
      toast.error('Failed to load projects: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDrawer = (project?: Project) => {
    if (project) {
      setEditingProject(project)
      setFormData(project)
    } else {
      setEditingProject(null)
      setFormData({
        title: '',
        client_id: Object.keys(clients)[0] || '',
        description: '',
        status: 'active',
        stage: 'discovery',
        priority: 'medium',
        value: 0,
        paid: 0
      })
    }
    setIsDrawerOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) return toast.error('Title is required')
    if (!formData.client_id) return toast.error('Client is required')

    try {
      setIsSaving(true)
      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(formData)
          .eq('id', editingProject.id)
        if (error) throw error
        toast.success('Project updated successfully')
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([formData])
        if (error) throw error
        toast.success('Project added successfully')
      }
      setIsDrawerOpen(false)
      fetchData()
    } catch (error: any) {
      toast.error('Error saving project: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast.success('Project deleted')
      fetchData()
    } catch (error: any) {
      toast.error('Error deleting project: ' + error.message)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-8 pb-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="page-title">Projects</h1>
            <p className="page-subtitle">Track active work and deliverables across your client base.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[var(--surface)] border border-[var(--border)] p-1 rounded-xl flex gap-1">
              <button 
                onClick={() => setView('kanban')}
                className={`p-2 rounded-lg transition-all ${view === 'kanban' ? 'bg-[var(--accent)] text-white shadow-md' : 'text-dim hover:bg-[var(--surface2)]'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setView('list')}
                className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-[var(--accent)] text-white shadow-md' : 'text-dim hover:bg-[var(--surface2)]'}`}
              >
                <List size={18} />
              </button>
            </div>
            <button 
              onClick={() => handleOpenDrawer()}
              className="btn-primary"
            >
              <Plus size={18} />
              New Project
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto px-8 pb-8">
        <div className="flex gap-6 h-full min-w-max">
          {loading ? (
             <div className="flex gap-6 h-full w-full">
               {[1, 2, 3, 4].map(i => (
                 <div key={i} className="w-80 h-full bg-[var(--surface2)]/40 rounded-2xl animate-pulse border border-[var(--border)]" />
               ))}
             </div>
          ) : (
            stages.map(stage => (
              <KanbanColumn 
                key={stage} 
                stage={stage} 
                projects={projects.filter(p => p.stage === stage)} 
                clients={Object.fromEntries(Object.entries(clients).map(([id, c]) => [id, c.name]))}
                onEdit={handleOpenDrawer}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Drawer */}
      <SlideOver 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        title={editingProject ? 'Edit Project' : 'New Project'}
      >
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
                {Object.values(clients).map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="stat-card-label mb-2 block">Description</label>
              <textarea 
                value={formData.description || ''}
                onChange={e => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all resize-none"
                placeholder="Brief project summary..."
              />
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
                <label className="stat-card-label mb-2 block">Stage</label>
                <select 
                  value={formData.stage}
                  onChange={e => setFormData({...formData, stage: e.target.value as ProjectStage})}
                  className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all capitalize"
                >
                  {stages.map(s => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label className="stat-card-label mb-2 block">Deadline</label>
                <input 
                  type="date" 
                  value={formData.deadline || ''}
                  onChange={e => setFormData({...formData, deadline: e.target.value})}
                  className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="stat-card-label mb-2 block">Total Value (₹)</label>
                <input 
                  type="number" 
                  value={formData.value}
                  onChange={e => setFormData({...formData, value: Number(e.target.value)})}
                  className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all"
                />
              </div>
              <div>
                <label className="stat-card-label mb-2 block">Amount Paid (₹)</label>
                <input 
                  type="number" 
                  value={formData.paid}
                  onChange={e => setFormData({...formData, paid: Number(e.target.value)})}
                  className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 flex gap-3">
            <button 
              type="button"
              onClick={() => setIsDrawerOpen(false)}
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
      </SlideOver>
    </div>
  )
}

export default Projects
