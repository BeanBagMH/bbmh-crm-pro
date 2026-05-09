import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Client, ClientStatus } from '../types'
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink, 
  Users, 
  Trash2, 
  Edit3,
  Loader2,
  X
} from 'lucide-react'
import Badge from '../components/ui/Badge'
import SlideOver from '../components/ui/SlideOver'
import { toast } from 'sonner'

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all')
  
  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    company: '',
    email: '',
    whatsapp: '',
    city: '',
    status: 'prospect',
    monthly_retainer: 0,
    total_billed: 0
  })

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setClients(data || [])
    } catch (error: any) {
      toast.error('Failed to load clients: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDrawer = (client?: Client) => {
    if (client) {
      setEditingClient(client)
      setFormData(client)
    } else {
      setEditingClient(null)
      setFormData({
        name: '',
        company: '',
        email: '',
        whatsapp: '',
        city: '',
        status: 'prospect',
        monthly_retainer: 0,
        total_billed: 0
      })
    }
    setIsDrawerOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) return toast.error('Name is required')

    try {
      setIsSaving(true)
      if (editingClient) {
        const { error } = await supabase
          .from('clients')
          .update(formData)
          .eq('id', editingClient.id)
        if (error) throw error
        toast.success('Client updated successfully')
      } else {
        const { error } = await supabase
          .from('clients')
          .insert([formData])
        if (error) throw error
        toast.success('Client added successfully')
      }
      setIsDrawerOpen(false)
      fetchClients()
    } catch (error: any) {
      toast.error('Error saving client: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
      if (error) throw error
      toast.success('Client deleted')
      fetchClients()
    } catch (error: any) {
      toast.error('Error deleting client: ' + error.message)
    }
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(search.toLowerCase()) || 
                          client.company?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusVariant = (status: ClientStatus) => {
    switch (status) {
      case 'active': return 'success'
      case 'prospect': return 'warning'
      case 'churned': return 'error'
      case 'inactive': return 'outline'
      default: return 'default'
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">Manage your business relationships and billing history.</p>
        </div>
        <button 
          onClick={() => handleOpenDrawer()}
          className="btn-primary"
        >
          <Plus size={18} />
          Add New Client
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Search by name or company..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="header-search w-full"
            style={{ background: 'var(--surface2)', paddingLeft: '14px' }}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {(['all', 'active', 'prospect', 'inactive', 'churned'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap capitalize ${
                statusFilter === status 
                ? 'bg-[var(--accent)] text-white border-[var(--accent)]' 
                : 'bg-[var(--surface2)] text-dim border-[var(--border)] hover:bg-[var(--surface3)]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-[var(--surface)] border border-[var(--border)] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-20 bg-[var(--surface)] border border-[var(--border)] rounded-3xl">
          <div className="w-16 h-16 bg-[var(--surface2)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={32} className="text-faint" />
          </div>
          <h3 className="text-xl font-bold mb-1">No clients found</h3>
          <p className="text-dim">Try adjusting your filters or add a new client.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div 
              key={client.id} 
              className="stat-card p-6 group relative"
            >
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleOpenDrawer(client)}
                  className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:text-[var(--accent)] transition-all"
                >
                  <Edit3 size={14} />
                </button>
                <button 
                  onClick={() => handleDelete(client.id)}
                  className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:text-[var(--red)] transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-[var(--surface2)] rounded-2xl flex items-center justify-center font-serif text-xl text-[var(--accent)] border border-[var(--border)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
                  {client.name.charAt(0)}
                </div>
                <Badge variant={getStatusVariant(client.status)}>{client.status}</Badge>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold truncate">{client.name}</h3>
                <p className="text-sm text-dim truncate">{client.company || 'Personal'}</p>
              </div>

              <div className="space-y-3 mb-8">
                {client.email && (
                  <div className="flex items-center gap-2 text-xs text-dim">
                    <Mail size={14} />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.whatsapp && (
                  <div className="flex items-center gap-2 text-xs text-dim">
                    <Phone size={14} />
                    <span>{client.whatsapp}</span>
                  </div>
                )}
                {client.city && (
                  <div className="flex items-center gap-2 text-xs text-dim">
                    <MapPin size={14} />
                    <span>{client.city}</span>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-[var(--border)] flex items-center justify-between">
                <div>
                  <p className="stat-card-label mb-1">Total Billed</p>
                  <p className="font-bold text-sm">₹{client.total_billed.toLocaleString('en-IN')}</p>
                </div>
                <button className="p-2 bg-[var(--surface2)] hover:bg-[var(--accent)] hover:text-white rounded-lg transition-all">
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Drawer */}
      <SlideOver 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        title={editingClient ? 'Edit Client' : 'Add New Client'}
      >
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="stat-card-label mb-2 block">Monthly Retainer (₹)</label>
                <input 
                  type="number" 
                  value={formData.monthly_retainer}
                  onChange={e => setFormData({...formData, monthly_retainer: Number(e.target.value)})}
                  className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all"
                />
              </div>
              <div>
                <label className="stat-card-label mb-2 block">Total Billed (₹)</label>
                <input 
                  type="number" 
                  value={formData.total_billed}
                  onChange={e => setFormData({...formData, total_billed: Number(e.target.value)})}
                  className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 flex gap-3">
            <button 
              type="button"
              onClick={() => setIsDrawerOpen(false)}
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
      </SlideOver>
    </div>
  )
}

export default Clients
