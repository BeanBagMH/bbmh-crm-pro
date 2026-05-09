import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Lead, LeadStage } from '../types'
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Phone, 
  Mail, 
  Calendar, 
  ArrowRight, 
  Loader2, 
  Trash2, 
  Edit3 
} from 'lucide-react'
import Badge from '../components/ui/Badge'
import SlideOver from '../components/ui/SlideOver'
import { toast } from 'sonner'
import LeadForm from '../components/forms/LeadForm'

const stages: LeadStage[] = ['new', 'contacted', 'proposal_sent', 'negotiating', 'won', 'lost']

const Pipeline: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  
  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  useEffect(() => {
    fetchLeads()
  }, [])

  async function fetchLeads() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setLeads(data || [])
    } catch (error: any) {
      toast.error('Failed to load leads: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDrawer = (lead?: Lead) => {
    if (lead) {
      setEditingLead(lead)
    } else {
      setEditingLead(null)
    }
    setIsDrawerOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lead?')) return
    try {
      const { error } = await supabase.from('leads').delete().eq('id', id)
      if (error) throw error
      toast.success('Lead removed')
      fetchLeads()
    } catch (error: any) {
      toast.error('Error deleting: ' + error.message)
    }
  }

  const handleConvert = async (lead: Lead) => {
    if (!confirm(`Convert ${lead.name} to a Client?`)) return
    try {
      // 1. Create Client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert([{
          name: lead.name,
          company: lead.company,
          email: lead.email,
          whatsapp: lead.phone,
          status: 'active',
          source: lead.source
        }])
        .select()
      
      if (clientError) throw clientError

      // 2. Mark Lead as Converted
      const { error: leadError } = await supabase
        .from('leads')
        .update({ converted: true, stage: 'won' })
        .eq('id', lead.id)
      
      if (leadError) throw leadError

      toast.success('Lead converted to Client!')
      fetchLeads()
    } catch (error: any) {
      toast.error('Conversion failed: ' + error.message)
    }
  }

  const pipelineValue = leads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0)

  return (
    <div className="flex flex-col h-full">
      <div className="p-8 pb-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="page-title">Pipeline</h1>
            <p className="page-subtitle">Track potential deals and conversions. Total pipeline value: <span className="text-[var(--text)] font-bold">₹{pipelineValue.toLocaleString('en-IN')}</span></p>
          </div>
          <button 
            onClick={() => handleOpenDrawer()}
            className="btn-primary"
          >
            <Plus size={18} />
            Add Lead
          </button>
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
              <div key={stage} className="flex-shrink-0 w-80 flex flex-col h-full bg-[var(--surface2)]/40 rounded-2xl border border-[var(--border)] overflow-hidden">
                <div className="p-4 border-b border-[var(--border)] bg-[var(--surface)]/50 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10">
                  <h3 className="font-bold text-sm lowercase">{stage.replace('_', ' ')}</h3>
                  <span className="nav-badge">
                    {leads.filter(l => l.stage === stage).length}
                  </span>
                </div>
                <div className="p-3 space-y-3 overflow-y-auto flex-1">
                  {leads.filter(l => l.stage === stage).map(lead => (
                    <div key={lead.id} className="stat-card p-4 group relative">
                      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenDrawer(lead)} className="p-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:text-[var(--accent)]"><Edit3 size={12}/></button>
                        <button onClick={() => handleDelete(lead.id)} className="p-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:text-[var(--red)]"><Trash2 size={12}/></button>
                      </div>

                      <div className="flex justify-between items-start mb-3">
                         <Badge variant={lead.converted ? 'success' : 'outline'}>{lead.source || 'Direct'}</Badge>
                      </div>
                      <h4 className="font-bold text-sm mb-1">{lead.name}</h4>
                      <p className="text-[11px] text-dim mb-4 truncate">{lead.company || 'Individual'}</p>
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--border)]">
                        <div className="text-[11px] font-bold text-[var(--accent)]">₹{lead.estimated_value.toLocaleString('en-IN')}</div>
                        {stage === 'won' && !lead.converted && (
                           <button 
                             onClick={() => handleConvert(lead)}
                             className="flex items-center gap-1 text-[10px] bg-[var(--green-dim)] text-[var(--green)] px-2 py-1 rounded-md font-bold hover:bg-[var(--green)] hover:text-white transition-all"
                           >
                             Convert <ArrowRight size={12} />
                           </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Drawer */}
      <SlideOver 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        title={editingLead ? 'Edit Lead' : 'New Lead'}
      >
        <LeadForm 
          initialData={editingLead || undefined}
          onSuccess={() => {
            setIsDrawerOpen(false)
            fetchLeads()
          }}
          onCancel={() => setIsDrawerOpen(false)}
        />
      </SlideOver>
    </div>
  )
}

export default Pipeline
