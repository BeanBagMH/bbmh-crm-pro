import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Transaction, TransactionType } from '../types'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface TransactionFormProps {
  initialData?: Partial<Transaction>
  onSuccess: () => void
  onCancel: () => void
}

const TransactionForm: React.FC<TransactionFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [isSaving, setIsSaving] = useState(false)
  const [clients, setClients] = useState<{id: string, name: string}[]>([])
  const [projects, setProjects] = useState<{id: string, title: string}[]>([])
  
  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: 'income',
    amount: 0,
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    client_id: '',
    project_id: '',
    ...initialData
  })

  useEffect(() => {
    fetchMetadata()
  }, [])

  async function fetchMetadata() {
    try {
      const [clientsRes, projectsRes] = await Promise.all([
        supabase.from('clients').select('id, name'),
        supabase.from('projects').select('id, title')
      ])
      if (clientsRes.data) setClients(clientsRes.data)
      if (projectsRes.data) setProjects(projectsRes.data)
    } catch (err) {}
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount) return toast.error('Amount is required')
    if (!formData.description) return toast.error('Description is required')

    try {
      setIsSaving(true)
      const dataToSave = { ...formData }
      if (!dataToSave.client_id) delete dataToSave.client_id
      if (!dataToSave.project_id) delete dataToSave.project_id
      
      const transactionId = initialData?.id

      if (transactionId) {
        // Remove fields that shouldn't be in update
        delete (dataToSave as any).id
        delete (dataToSave as any).created_at
        
        const { error } = await supabase
          .from('transactions')
          .update(dataToSave)
          .eq('id', transactionId)
        if (error) throw error
        toast.success(`Transaction updated: ${formData.description}`)
      } else {
        const { error } = await supabase
          .from('transactions')
          .insert([dataToSave])
        if (error) throw error
        toast.success(`Transaction added: ${formData.description}`)
      }
      onSuccess()
    } catch (error: any) {
      toast.error('Error saving: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="stat-card-label mb-2 block">Type</label>
          <select 
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value as TransactionType})}
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none"
          >
            <option value="income">Income (+)</option>
            <option value="expense">Expense (-)</option>
          </select>
        </div>
        <div>
          <label className="stat-card-label mb-2 block">Amount (₹)</label>
          <input 
            type="number" 
            required
            value={formData.amount || ''}
            onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none"
            placeholder="0.00"
          />
        </div>
      </div>
      <div>
        <label className="stat-card-label mb-2 block">Description</label>
        <input 
          type="text" 
          required
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
          className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none"
          placeholder="e.g. Monthly Retainer"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="stat-card-label mb-2 block">Date</label>
          <input 
            type="date" 
            required
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none"
          />
        </div>
        <div>
          <label className="stat-card-label mb-2 block">Category</label>
          <input 
            type="text" 
            value={formData.category || ''}
            onChange={e => setFormData({...formData, category: e.target.value})}
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none"
            placeholder="e.g. Salary, Rent"
          />
        </div>
      </div>
      <div>
        <label className="stat-card-label mb-2 block">Link to Client (Optional)</label>
        <select 
          value={formData.client_id}
          onChange={e => setFormData({...formData, client_id: e.target.value})}
          className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none"
        >
          <option value="">None</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="stat-card-label mb-2 block">Link to Project (Optional)</label>
        <select 
          value={formData.project_id}
          onChange={e => setFormData({...formData, project_id: e.target.value})}
          className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none"
        >
          <option value="">None</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>

      <div className="pt-6 flex gap-3">
        <button type="button" onClick={onCancel} className="flex-1 px-6 py-3 rounded-xl border border-[var(--border)] font-bold text-dim hover:bg-[var(--surface2)] transition-all">Cancel</button>
        <button type="submit" disabled={isSaving} className="flex-1 btn-primary justify-center">
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'Save Transaction'}
        </button>
      </div>
    </form>
  )
}

export default TransactionForm
