import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Lead, LeadStage } from '../../types'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface LeadFormProps {
  initialData?: Partial<Lead>
  onSuccess: () => void
  onCancel: () => void
}

const stages: LeadStage[] = ['new', 'contacted', 'proposal_sent', 'negotiating', 'won', 'lost']

const LeadForm: React.FC<LeadFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Lead>>({
    name: '',
    company: '',
    email: '',
    phone: '',
    stage: 'new',
    source: 'Direct',
    estimated_value: 0,
    service_interest: '',
    notes: '',
    ...initialData
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) return toast.error('Name is required')

    try {
      setIsSaving(true)
      if (initialData?.id) {
        const { error } = await supabase
          .from('leads')
          .update(formData)
          .eq('id', initialData.id)
        if (error) throw error
        toast.success('Lead updated successfully')
      } else {
        const { error } = await supabase
          .from('leads')
          .insert([formData])
        if (error) throw error
        toast.success('Lead added successfully')
      }
      onSuccess()
    } catch (error: any) {
      toast.error('Error saving lead: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="stat-card-label mb-2 block">Contact Name</label>
          <input 
            type="text" 
            required 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all" 
            placeholder="e.g. John Doe"
          />
        </div>
        <div>
          <label className="stat-card-label mb-2 block">Company</label>
          <input 
            type="text" 
            value={formData.company || ''} 
            onChange={e => setFormData({...formData, company: e.target.value})} 
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all" 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="stat-card-label mb-2 block">Email</label>
            <input 
              type="email" 
              value={formData.email || ''} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all" 
            />
          </div>
          <div>
            <label className="stat-card-label mb-2 block">Phone</label>
            <input 
              type="text" 
              value={formData.phone || ''} 
              onChange={e => setFormData({...formData, phone: e.target.value})} 
              className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all" 
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="stat-card-label mb-2 block">Stage</label>
            <select 
              value={formData.stage} 
              onChange={e => setFormData({...formData, stage: e.target.value as LeadStage})} 
              className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all capitalize"
            >
              {stages.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="stat-card-label mb-2 block">Est. Value (₹)</label>
            <input 
              type="number" 
              value={formData.estimated_value} 
              onChange={e => setFormData({...formData, estimated_value: Number(e.target.value)})} 
              className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all" 
            />
          </div>
        </div>
        <div>
          <label className="stat-card-label mb-2 block">Service Interest</label>
          <input 
            type="text" 
            value={formData.service_interest || ''} 
            onChange={e => setFormData({...formData, service_interest: e.target.value})} 
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all" 
            placeholder="e.g. Video Production"
          />
        </div>
        <div>
          <label className="stat-card-label mb-2 block">Source</label>
          <input 
            type="text" 
            value={formData.source || ''} 
            onChange={e => setFormData({...formData, source: e.target.value})} 
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all" 
            placeholder="e.g. Instagram, Referral" 
          />
        </div>
        <div>
          <label className="stat-card-label mb-2 block">Notes</label>
          <textarea 
            value={formData.notes || ''} 
            onChange={e => setFormData({...formData, notes: e.target.value})} 
            rows={3}
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all resize-none" 
          />
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
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'Save Lead'}
        </button>
      </div>
    </form>
  )
}

export default LeadForm
