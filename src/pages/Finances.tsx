import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Transaction, Invoice, TransactionType } from '../types'
import { 
  CircleDollarSign, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Calendar as CalendarIcon,
  Loader2,
  Trash2,
  Edit3
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import Badge from '../components/ui/Badge'
import SlideOver from '../components/ui/SlideOver'
import { toast } from 'sonner'

type Tab = 'overview' | 'transactions' | 'invoices'

const Finances: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<{id: string, name: string}[]>([])
  const [projects, setProjects] = useState<{id: string, title: string}[]>([])
  const [loading, setLoading] = useState(true)

  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: 'income',
    amount: 0,
    category: 'service',
    description: '',
    date: new Date().toISOString().split('T')[0],
    client_id: '',
    project_id: ''
  })

  useEffect(() => {
    fetchFinanceData()
  }, [])

  async function fetchFinanceData() {
    try {
      setLoading(true)
      const [transRes, invRes, clientsRes, projectsRes] = await Promise.all([
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('invoices').select('*').order('issue_date', { ascending: false }),
        supabase.from('clients').select('id, name'),
        supabase.from('projects').select('id, title')
      ])

      if (transRes.error) throw transRes.error
      if (invRes.error) throw invRes.error
      if (clientsRes.error) throw clientsRes.error
      if (projectsRes.error) throw projectsRes.error

      setTransactions(transRes.data || [])
      setInvoices(invRes.data || [])
      setClients(clientsRes.data || [])
      setProjects(projectsRes.data || [])
    } catch (error: any) {
      toast.error('Failed to load financial data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDrawer = (transaction?: Transaction) => {
    if (transaction) {
      setEditingTransaction(transaction)
      setFormData(transaction)
    } else {
      setEditingTransaction(null)
      setFormData({
        type: 'income',
        amount: 0,
        category: 'service',
        description: '',
        date: new Date().toISOString().split('T')[0],
        client_id: '',
        project_id: ''
      })
    }
    setIsDrawerOpen(true)
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

      if (editingTransaction) {
        const { error } = await supabase
          .from('transactions')
          .update(dataToSave)
          .eq('id', editingTransaction.id)
        if (error) throw error
        toast.success('Transaction updated')
      } else {
        const { error } = await supabase
          .from('transactions')
          .insert([dataToSave])
        if (error) throw error
        toast.success('Transaction added')
      }
      setIsDrawerOpen(false)
      fetchFinanceData()
    } catch (error: any) {
      toast.error('Error saving: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this transaction?')) return
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id)
      if (error) throw error
      toast.success('Transaction deleted')
      fetchFinanceData()
    } catch (error: any) {
      toast.error('Error deleting: ' + error.message)
    }
  }

  const stats = {
    income: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    expense: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
    pending: invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.total, 0)
  }

  const chartData = [
    { name: 'Income', value: stats.income, color: 'var(--green)' },
    { name: 'Expense', value: stats.expense, color: 'var(--red)' },
    { name: 'Net Profit', value: stats.income - stats.expense, color: 'var(--teal)' },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="page-title">Finances</h1>
          <p className="page-subtitle">Monitor your revenue, expenses, and cash flow in real-time.</p>
        </div>
        <div className="flex gap-2">
           <button className="bg-[var(--surface2)] border border-[var(--border)] text-dim px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[var(--surface3)] transition-all">
            <CalendarIcon size={16} />
            May 2026
          </button>
          <button 
            onClick={() => handleOpenDrawer()}
            className="btn-primary"
          >
            <Plus size={18} />
            Add Transaction
          </button>
        </div>
      </div>

      <div className="tab-row">
        {(['overview', 'transactions', 'invoices'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-item ${activeTab === tab ? 'active' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="finances-grid">
            <div className="stat-card">
              <p className="stat-card-label">Total Income</p>
              <h2 className="stat-card-value">₹{stats.income.toLocaleString('en-IN')}</h2>
            </div>
            <div className="stat-card">
              <p className="stat-card-label">Total Expenses</p>
              <h2 className="stat-card-value">₹{stats.expense.toLocaleString('en-IN')}</h2>
            </div>
            <div className="stat-card">
              <p className="stat-card-label">Outstanding Invoices</p>
              <h2 className="stat-card-value">₹{stats.pending.toLocaleString('en-IN')}</h2>
            </div>
            <div className="stat-card stat-card-dark">
              <p className="stat-card-label text-white/50">Net Profit</p>
              <h2 className="stat-card-value text-white">₹{(stats.income - stats.expense).toLocaleString('en-IN')}</h2>
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] p-8 rounded-2xl shadow-sm h-[400px]">
            <h3 className="font-bold mb-8 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--teal)]" />
              Profit & Loss Summary
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 12}} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  cursor={{fill: 'var(--surface2)'}}
                  contentStyle={{backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)'}}
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--surface2)]/50 border-b border-[var(--border)]">
                <th className="px-6 py-4 text-[10px] font-mono text-dim uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-[10px] font-mono text-dim uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-[10px] font-mono text-dim uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-[10px] font-mono text-dim uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-[10px] font-mono text-dim uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {transactions.map(t => (
                <tr key={t.id} className="hover:bg-[var(--surface2)]/30 transition-colors group">
                  <td className="px-6 py-4 text-xs font-mono">{new Date(t.date).toLocaleDateString('en-IN')}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-sm mb-0.5">{t.description}</div>
                    <div className="text-[10px] text-dim">{t.type}</div>
                  </td>
                  <td className="px-6 py-4"><Badge variant="outline">{t.category || 'General'}</Badge></td>
                  <td className={`px-6 py-4 font-bold text-sm ${t.type === 'income' ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                    {t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenDrawer(t)} className="p-1.5 hover:text-[var(--accent)]"><Edit3 size={14}/></button>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 hover:text-[var(--red)]"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SlideOver Form */}
      <SlideOver 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
      >
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
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none"
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
            <button type="button" onClick={() => setIsDrawerOpen(false)} className="flex-1 px-6 py-3 rounded-xl border border-[var(--border)] font-bold text-dim hover:bg-[var(--surface2)] transition-all">Cancel</button>
            <button type="submit" disabled={isSaving} className="flex-1 btn-primary justify-center">
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'Save Transaction'}
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  )
}

export default Finances
