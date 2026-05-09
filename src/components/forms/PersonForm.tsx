import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Person, PersonType } from '../../types'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface PersonFormProps {
  initialData?: Partial<Person>
  onSuccess: () => void
  onCancel: () => void
}

const PersonForm: React.FC<PersonFormProps> = ({ onSuccess, onCancel }) => {
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Person>>({
    name: '',
    role: '',
    type: 'team',
    email: '',
    phone: '',
    status: 'active'
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) return toast.error('Name is required')

    try {
      setIsSaving(true)
      const { error } = await supabase
        .from('people')
        .insert([formData])
      
      if (error) throw error
      toast.success('Person added successfully')
      onSuccess()
    } catch (error: any) {
      toast.error('Error saving: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="stat-card-label mb-2 block">Full Name</label>
          <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none" />
        </div>
        <div>
          <label className="stat-card-label mb-2 block">Role / Title</label>
          <input type="text" value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none" placeholder="e.g. Creative Director" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="stat-card-label mb-2 block">Type</label>
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as PersonType})} className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none">
              <option value="team">Team Member</option>
              <option value="freelancer">Freelancer</option>
              <option value="vendor">Vendor</option>
              <option value="partner">Partner</option>
            </select>
          </div>
          <div>
            <label className="stat-card-label mb-2 block">Status</label>
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})} className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="stat-card-label mb-2 block">Email</label>
            <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none" />
          </div>
          <div>
            <label className="stat-card-label mb-2 block">Phone</label>
            <input type="text" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none" />
          </div>
        </div>
      </div>

      <div className="pt-6 flex gap-3">
        <button type="button" onClick={onCancel} className="flex-1 px-6 py-3 rounded-xl border border-[var(--border)] font-bold text-dim hover:bg-[var(--surface2)] transition-all">Cancel</button>
        <button type="submit" disabled={isSaving} className="flex-1 btn-primary justify-center">
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'Save Person'}
        </button>
      </div>
    </form>
  )
}

export default PersonForm
