import React from 'react'
import { Project, ProjectStage } from '../types'
import Badge from '../components/ui/Badge'
import { Calendar, MoreVertical, AlertCircle, Edit3, Trash2 } from 'lucide-react'

interface KanbanColumnProps {
  stage: ProjectStage
  projects: Project[]
  clients: Record<string, string>
  onEdit: (project: Project) => void
  onDelete: (id: string) => void
}

const stageLabels: Record<ProjectStage, string> = {
  discovery: 'Discovery',
  proposal: 'Proposal',
  active: 'Active Work',
  revision: 'Revision',
  delivered: 'Delivered',
  invoiced: 'Invoiced'
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ stage, projects, clients, onEdit, onDelete }) => {
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error'
      case 'high': return 'warning'
      case 'medium': return 'info'
      default: return 'default'
    }
  }

  return (
    <div className="flex-shrink-0 w-80 flex flex-col h-full bg-[var(--surface2)]/40 rounded-2xl border border-[var(--border)] overflow-hidden">
      <div className="p-4 border-b border-[var(--border)] bg-[var(--surface)]/50 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm lowercase">{stageLabels[stage]}</h3>
          <span className="nav-badge">
            {projects.length}
          </span>
        </div>
      </div>

      <div className="p-3 space-y-3 overflow-y-auto flex-1">
        {projects.map((project) => (
          <div 
            key={project.id} 
            className="stat-card p-4 group relative"
          >
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => onEdit(project)}
                className="p-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:text-[var(--accent)] transition-all"
              >
                <Edit3 size={12} />
              </button>
              <button 
                onClick={() => onDelete(project.id)}
                className="p-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:text-[var(--red)] transition-all"
              >
                <Trash2 size={12} />
              </button>
            </div>

            <div className="flex justify-between items-start mb-3">
              <Badge variant={getPriorityVariant(project.priority)}>{project.priority}</Badge>
            </div>

            <h4 className="font-bold text-sm mb-1 group-hover:text-[var(--accent)] transition-colors">{project.title}</h4>
            <p className="text-[11px] text-dim mb-4">{clients[project.client_id] || 'Loading client...'}</p>

            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-1.5 text-[10px] text-dim font-medium">
                <Calendar size={14} />
                {project.deadline ? new Date(project.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'No date'}
              </div>
              
              <div className="flex items-center gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-[var(--green)]"></div>
                 <span className="text-[10px] font-bold">₹{(project.value/1000).toFixed(1)}k</span>
              </div>
            </div>

            {project.priority === 'urgent' && (
              <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center gap-2 text-[10px] text-[var(--red)] font-bold uppercase tracking-wider">
                <AlertCircle size={14} />
                Overdue / Urgent
              </div>
            )}
          </div>
        ))}
        {projects.length === 0 && (
          <div className="py-10 text-center border-2 border-dashed border-[var(--border)] rounded-xl">
            <p className="text-[11px] text-dim">No projects in this stage</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default KanbanColumn
