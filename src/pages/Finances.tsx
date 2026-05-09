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
import TransactionForm from '../components/forms/TransactionForm'

type Tab = 'overview' | 'transactions' | 'invoices'

const Finances: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<{id: string, name: string}[]>([])
  const [projects, setProjects] = useState<{id: string, title: string}[]>([])
  const [loading, setLoading] = useState(true)

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

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
    } else {
      setEditingTransaction(null)
    }
    setIsDrawerOpen(true)
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
        <TransactionForm 
          initialData={editingTransaction || undefined}
          onSuccess={() => {
            setIsDrawerOpen(false)
            fetchFinanceData()
          }}
          onCancel={() => setIsDrawerOpen(false)}
        />
      </SlideOver>
    </div>
  )
}

export default Finances
