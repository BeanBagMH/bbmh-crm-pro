import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { 
  Users, 
  Target, 
  Rocket, 
  CircleDollarSign, 
  CheckSquare, 
  TrendingUp, 
  Clock, 
  ArrowUpRight,
  ChevronRight
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { cn } from '../lib/utils'

const CommandCentre: React.FC = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    outstanding: 0,
    activeProjects: 0,
    activeClients: 0,
    openLeads: 0,
    overdueTasks: 0
  })
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [upcomingProjects, setUpcomingProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      setLoading(true)
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const [clients, projects, leads, invoices, tasks, trans, monthlyTrans, followUpsToday] = await Promise.all([
        supabase.from('clients').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('projects').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('leads').select('id', { count: 'exact' }).not('stage', 'in', '(won,lost)'),
        supabase.from('invoices').select('total').neq('status', 'paid'),
        supabase.from('tasks').select('id', { count: 'exact' }).neq('status', 'done').lt('due_date', now.toISOString()),
        supabase.from('transactions').select('*').order('date', { ascending: false }).limit(5),
        supabase.from('transactions').select('amount').eq('type', 'income').gte('date', firstDayOfMonth),
        supabase.from('leads').select('*').eq('follow_up_date', today)
      ])

      const monthlyRevenue = monthlyTrans.data?.reduce((sum, t) => sum + t.amount, 0) || 0

      setStats({
        revenue: monthlyRevenue,
        outstanding: invoices.data?.reduce((sum, inv) => sum + inv.total, 0) || 0,
        activeProjects: projects.count || 0,
        activeClients: clients.count || 0,
        openLeads: leads.count || 0,
        overdueTasks: tasks.count || 0
      })
      setRecentTransactions(trans.data || [])
      setUpcomingProjects(followUpsToday.data || []) // Reusing this state for follow-ups
    } catch (error: any) {
      toast.error('Failed to load dashboard: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: 'Revenue This Month', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: CircleDollarSign, color: 'var(--green)', trend: '+12.5%' },
    { label: 'Outstanding Invoices', value: `₹${stats.outstanding.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'var(--gold)', trend: '4 Pending' },
    { label: 'Active Projects', value: stats.activeProjects, icon: Target, color: 'var(--accent)', path: '/projects' },
    { label: 'Active Clients', value: stats.activeClients, icon: Users, color: 'var(--blue)', path: '/clients' },
    { label: 'Open Leads', value: stats.openLeads, icon: Rocket, color: 'var(--purple)', path: '/pipeline' },
    { label: 'Overdue Tasks', value: stats.overdueTasks, icon: CheckSquare, color: 'var(--red)', path: '/tasks' },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="page-title">Command Centre</h1>
        <p className="page-subtitle">Good morning, Murphy. Here's what's happening at BBMh today.</p>
      </div>

      <div className="stats-grid">
        {statCards.map((card, i) => (
          <Link 
            to={card.path || '#'} 
            key={i} 
            className={cn(
              "stat-card",
              card.label === 'Monthly Target' && "stat-card-dark"
            )}
          >
            <p className="stat-card-label">{card.label}</p>
            <h3 className="stat-card-value">{card.value}</h3>
            {card.trend && (
              <div className={cn(
                "stat-card-change",
                card.trend.startsWith('+') ? "positive" : "negative"
              )}>
                {card.trend}
              </div>
            )}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[var(--surface)] border border-[var(--border)] p-8 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <h3 className="font-bold flex items-center gap-2">
                 <TrendingUp className="w-4 h-4 text-[var(--teal)]" />
                 Revenue Growth
               </h3>
               <button className="text-xs font-bold text-[var(--accent)] hover:underline">View Detailed Report</button>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Jan', value: 320000 },
                  { name: 'Feb', value: 410000 },
                  { name: 'Mar', value: 380000 },
                  { name: 'Apr', value: 520000 },
                  { name: 'May', value: 450000 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: 'var(--surface2)'}}
                    contentStyle={{backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)'}}
                  />
                  <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="font-bold text-sm">Recent Transactions</h3>
              <Link to="/finances" className="text-xs font-bold text-[var(--accent)] flex items-center gap-1">
                All Finance <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {recentTransactions.map(t => (
                <div key={t.id} className="p-4 hover:bg-[var(--surface2)]/30 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-[var(--green-dim)] text-[var(--green)]' : 'bg-[var(--red-dim)] text-[var(--red)]'}`}>
                      {t.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5 rotate-90" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{t.description}</p>
                      <p className="text-[10px] text-dim uppercase font-mono">{t.category || 'General'}</p>
                    </div>
                  </div>
                  <p className={`font-bold text-sm ${t.type === 'income' ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                    {t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
              {recentTransactions.length === 0 && (
                <div className="p-10 text-center text-dim italic">No recent activity.</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="stat-card stat-card-dark relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
             <div className="relative z-10">
               <p className="stat-card-label">Monthly Target</p>
               <h3 className="stat-card-value text-white mb-2">₹4,50,000</h3>
               <p className="text-white/60 text-xs mb-8">You are at 75% of your ₹6,00,000 goal.</p>
               <div className="w-full h-1.5 bg-white/10 rounded-full mb-2">
                 <div className="h-full bg-[var(--teal)] rounded-full" style={{ width: '75%' }}></div>
               </div>
               <div className="flex justify-between text-[10px] font-mono font-bold uppercase">
                 <span>₹4,50,000</span>
                 <span className="text-white/40">₹6,00,000</span>
               </div>
             </div>
           </div>

           <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
             <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
               <h3 className="font-bold text-sm">Follow-ups Today</h3>
               <Clock className="w-4 h-4 text-dim" />
             </div>
             <div className="p-6">
                {upcomingProjects.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingProjects.map(lead => (
                      <div key={lead.id} className="flex items-start gap-3 p-3 bg-[var(--surface2)] rounded-xl border border-[var(--border)]">
                        <div className="w-8 h-8 rounded-lg bg-[var(--purple-dim)] text-[var(--purple)] flex items-center justify-center flex-shrink-0">
                          <Users size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{lead.name}</p>
                          <p className="text-[10px] text-dim">{lead.service_interest || 'General Lead'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Rocket className="w-10 h-10 text-faint mx-auto mb-3" />
                    <p className="text-xs text-dim">All caught up for today!</p>
                  </div>
                )}
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}

export default CommandCentre
