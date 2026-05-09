import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Person, PersonType } from '../types'
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MoreVertical, 
  MessageSquare, 
  Loader2, 
  Trash2, 
  Edit3 
} from 'lucide-react'
import Badge from '../components/ui/Badge'
import SlideOver from '../components/ui/SlideOver'
import { toast } from 'sonner'

const People: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<PersonType | 'all'>('all')
  
  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Person>>({
    name: '',
    role: '',
    type: 'team',
    email: '',
    phone: '',
    status: 'active'
  })

  useEffect(() => {
    fetchPeople()
  }, [])

  async function fetchPeople() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setPeople(data || [])
    } catch (error: any) {
      toast.error('Failed to load people: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDrawer = (person?: Person) => {
    if (person) {
      setEditingPerson(person)
      setFormData(person)
    } else {
      setEditingPerson(null)
      setFormData({
        name: '',
        role: '',
        type: 'team',
        email: '',
        phone: '',
        status: 'active'
      })
    }
    setIsDrawerOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) return toast.error('Name is required')

    try {
      setIsSaving(true)
      if (editingPerson) {
        const { error } = await supabase
          .from('people')
          .update(formData)
          .eq('id', editingPerson.id)
        if (error) throw error
        toast.success('Person updated')
      } else {
        const { error } = await supabase
          .from('people')
          .insert([formData])
        if (error) throw error
        toast.success('Person added')
      }
      setIsDrawerOpen(false)
      fetchPeople()
    } catch (error: any) {
      toast.error('Error saving: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this person?')) return
    try {
      const { error } = await supabase.from('people').delete().eq('id', id)
      if (error) throw error
      toast.success('Person removed')
      fetchPeople()
    } catch (error: any) {
      toast.error('Error deleting: ' + error.message)
    }
  }

  const filteredPeople = people.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.role?.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'all' || p.type === typeFilter
    return matchesSearch && matchesType
  })

  const getTypeVariant = (type: PersonType) => {
    switch (type) {
      case 'team': return 'info'
      case 'freelancer': return 'success'
      case 'vendor': return 'warning'
      case 'partner': return 'default'
      default: return 'outline'
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="page-title">People</h1>
          <p className="page-subtitle">Team members, freelancers, and business partners.</p>
        </div>
        <button 
          onClick={() => handleOpenDrawer()}
          className="btn-primary"
        >
          <Plus size={18} />
          Add Person
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Search by name or role..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="header-search w-full"
            style={{ background: 'var(--surface2)', paddingLeft: '14px' }}
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'team', 'freelancer', 'vendor', 'partner'] as const).map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all capitalize whitespace-nowrap ${
                typeFilter === type 
                ? 'bg-[var(--accent)] text-white border-[var(--accent)]' 
                : 'bg-[var(--surface2)] text-dim border-[var(--border)] hover:bg-[var(--surface3)]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-72 bg-[var(--surface)] border border-[var(--border)] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPeople.map(person => (
            <div key={person.id} className="stat-card p-6 text-center group relative">
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenDrawer(person)} className="p-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:text-[var(--accent)]"><Edit3 size={12}/></button>
                <button onClick={() => handleDelete(person.id)} className="p-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:text-[var(--red)]"><Trash2 size={12}/></button>
              </div>

              <div className="relative w-20 h-20 mx-auto mb-4 group">
                <div className="w-full h-full bg-[var(--surface2)] rounded-2xl flex items-center justify-center font-serif text-2xl text-[var(--accent)] border border-[var(--border)] group-hover:bg-[var(--accent)] group-hover:text-white transition-all transform group-hover:rotate-6">
                  {person.name.charAt(0)}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-4 border-[var(--surface)] rounded-full ${person.status === 'active' ? 'bg-[var(--green)]' : 'bg-dim'}`}></div>
              </div>

              <h3 className="font-bold text-lg mb-1">{person.name}</h3>
              <p className="text-xs text-dim mb-4">{person.role || 'Contributor'}</p>
              
              <Badge variant={getTypeVariant(person.type)} className="mb-6">{person.type}</Badge>

              <div className="flex justify-center gap-3 mt-auto">
                {person.email && <button className="p-2.5 rounded-xl bg-[var(--surface2)] text-dim hover:bg-[var(--accent)] hover:text-white transition-all shadow-sm"><Mail size={16} /></button>}
                {person.phone && <button className="p-2.5 rounded-xl bg-[var(--surface2)] text-dim hover:bg-[var(--accent)] hover:text-white transition-all shadow-sm"><Phone size={16} /></button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer */}
      <SlideOver 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        title={editingPerson ? 'Edit Person' : 'Add New Person'}
      >
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
            <button type="button" onClick={() => setIsDrawerOpen(false)} className="flex-1 px-6 py-3 rounded-xl border border-[var(--border)] font-bold text-dim hover:bg-[var(--surface2)] transition-all">Cancel</button>
            <button type="submit" disabled={isSaving} className="flex-1 btn-primary justify-center">
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'Save Person'}
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  )
}

export default People
