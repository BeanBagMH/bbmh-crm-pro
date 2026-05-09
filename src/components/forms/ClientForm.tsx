import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Client, ClientStatus } from '../../types'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ClientFormProps {
  initialData?: Partial<Client>
  onSuccess: () => void
  onCancel: () => void
}

const ClientForm: React.FC<ClientFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    company: '',
    email: '',
    whatsapp: '',
    city: '',
    status: 'prospect',
    monthly_retainer: 0,
    total_billed: 0,
    ...initialData
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) return toast.error('Name is required')

    try {
      setIsSaving(true)
      if (initialData?.id) {
        const { error } = await supabase
          .from('clients')
          .update(formData)
          .eq('id', initialData.id)
        if (error) throw error
        toast.success('Client updated successfully')
      } else {
        const { error } = await supabase
          .from('clients')
          .insert([formData])
        if (error) throw error
        toast.success('Client added successfully')
      }
      onSuccess()
    } catch (error: any) {
      toast.error('Error saving client: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="stat-card-label mb-2 block">Full Name</label>
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
          <label className="stat-card-label mb-2 block">Company Name</label>
          <input 
            type="text" 
            value={formData.company}
            onChange={e => setFormData({...formData, company: e.target.value})}
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all"
            placeholder="e.g. Acme Corp"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="stat-card-label mb-2 block">Email Address</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="stat-card-label mb-2 block">WhatsApp/Phone</label>
            <input 
              type="text" 
              value={formData.whatsapp}
              onChange={e => setFormData({...formData, whatsapp: e.target.value})}
              className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all"
              placeholder="+91..."
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="stat-card-label mb-2 block">City / Region</label>
            <input 
              type="text" 
              value={formData.city}
              onChange={e => setFormData({...formData, city: e.target.value})}
              className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all"
              placeholder="Mumbai"
            />
          </div>
          <div>
            <label className="stat-card-label mb-2 block">Status</label>
            <select 
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value as ClientStatus})}
              className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all capitalize"
            >
              <option value="prospect">Prospect</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="churned">Churned</option>
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
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'Save Client'}
        </button>
      </div>
    </form>
  )
}

export default ClientForm
