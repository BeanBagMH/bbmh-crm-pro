import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Credential } from '../../types'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface CredentialFormProps {
  initialData?: Partial<Credential>
  onSuccess: () => void
  onCancel: () => void
}

const CredentialForm: React.FC<CredentialFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Credential>>({
    platform: '',
    label: '',
    username: '',
    password_hint: '',
    url: '',
    category: 'Login',
    ...initialData
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.platform) return toast.error('Platform name is required')

    try {
      setIsSaving(true)
      const dataToSave = { 
        ...formData, 
        last_updated: new Date().toISOString() 
      }
      
      if (initialData?.id) {
        const { error } = await supabase
          .from('credentials')
          .update(dataToSave)
          .eq('id', initialData.id)
        if (error) throw error
        toast.success('Credential updated')
      } else {
        const { error } = await supabase
          .from('credentials')
          .insert([dataToSave])
        if (error) throw error
        toast.success('Credential added')
      }
      onSuccess()
    } catch (error: any) {
      toast.error('Error saving credential: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="stat-card-label mb-2 block">Platform</label>
            <input 
              type="text" 
              required 
              value={formData.platform} 
              onChange={e => setFormData({...formData, platform: e.target.value})} 
              className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all" 
              placeholder="e.g. Meta, Stripe" 
            />
          </div>
          <div>
            <label className="stat-card-label mb-2 block">Category</label>
            <input 
              type="text" 
              value={formData.category || ''} 
              onChange={e => setFormData({...formData, category: e.target.value})} 
              className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all" 
              placeholder="e.g. Social, Tool" 
            />
          </div>
        </div>
        <div>
          <label className="stat-card-label mb-2 block">Label / Purpose</label>
          <input 
            type="text" 
            value={formData.label || ''} 
            onChange={e => setFormData({...formData, label: e.target.value})} 
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all" 
            placeholder="e.g. Ad Account, Main Login" 
          />
        </div>
        <div>
          <label className="stat-card-label mb-2 block">Username / Email</label>
          <input 
            type="text" 
            value={formData.username || ''} 
            onChange={e => setFormData({...formData, username: e.target.value})} 
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all" 
          />
        </div>
        <div>
          <label className="stat-card-label mb-2 block">Password Hint</label>
          <input 
            type="text" 
            value={formData.password_hint || ''} 
            onChange={e => setFormData({...formData, password_hint: e.target.value})} 
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all" 
            placeholder="Reminder hint, not plaintext" 
          />
        </div>
        <div>
          <label className="stat-card-label mb-2 block">Platform URL</label>
          <input 
            type="url" 
            value={formData.url || ''} 
            onChange={e => setFormData({...formData, url: e.target.value})} 
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all" 
            placeholder="https://..." 
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
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'Save Credential'}
        </button>
      </div>
    </form>
  )
}

export default CredentialForm
