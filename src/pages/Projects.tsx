import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Project, ProjectStage, ProjectStatus, Priority } from '../types'
import { Plus, Search, LayoutGrid, List, Loader2 } from 'lucide-react'
import KanbanColumn from '../components/KanbanColumn'
import SlideOver from '../components/ui/SlideOver'
import { toast } from 'sonner'
import ProjectForm from '../components/forms/ProjectForm'

const stages: ProjectStage[] = ['discovery', 'proposal', 'active', 'revision', 'delivered', 'invoiced']

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Record<string, { name: string, id: string }>>({})
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  
  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
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
    } else {
      setEditingProject(null)
    }
    setIsDrawerOpen(true)
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

// ... inside component ...

      {/* Add/Edit Drawer */}
      <SlideOver 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        title={editingProject ? 'Edit Project' : 'New Project'}
      >
        <ProjectForm 
          initialData={editingProject || undefined}
          onSuccess={() => {
            setIsDrawerOpen(false)
            fetchData()
          }}
          onCancel={() => setIsDrawerOpen(false)}
        />
      </SlideOver>
    </div>
  )
}

export default Projects
