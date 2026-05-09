import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Credential } from '../types'
import { 
  Plus, 
  Search, 
  Key, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  Trash2, 
  Edit3 
} from 'lucide-react'
import Badge from '../components/ui/Badge'
import SlideOver from '../components/ui/SlideOver'
import { toast } from 'sonner'
import CredentialForm from '../components/forms/CredentialForm'

const Vault: React.FC = () => {
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingCred, setEditingCred] = useState<Credential | null>(null)
  useEffect(() => {
    fetchCredentials()
  }, [])

  async function fetchCredentials() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('credentials')
        .select('*')
        .order('platform', { ascending: true })

      if (error) throw error
      setCredentials(data || [])
    } catch (error: any) {
      toast.error('Failed to load credentials: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDrawer = (cred?: Credential) => {
    if (cred) {
      setEditingCred(cred)
    } else {
      setEditingCred(null)
    }
    setIsDrawerOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this credential?')) return
    try {
      const { error } = await supabase.from('credentials').delete().eq('id', id)
      if (error) throw error
      toast.success('Credential removed')
      fetchCredentials()
    } catch (error: any) {
      toast.error('Error deleting: ' + error.message)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const filteredCredentials = credentials.filter(c => 
    c.platform.toLowerCase().includes(search.toLowerCase()) || 
    c.label?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="page-title">Vault</h1>
          <p className="page-subtitle">Secure storage for platform credentials and access hints.</p>
        </div>
        <button 
          onClick={() => handleOpenDrawer()}
          className="btn-primary"
        >
          <Plus size={18} />
          Add Credential
        </button>
      </div>

      <div className="bg-[var(--gold-dim)] border border-[var(--gold)]/20 rounded-2xl p-4 flex gap-4 items-start mb-10">
        <AlertCircle size={20} className="text-[var(--gold)] mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-bold text-[var(--gold)] mb-1">Security Recommendation</p>
          <p className="text-dim leading-relaxed">Avoid storing plaintext passwords. Use the <span className="font-mono text-xs bg-[var(--gold)]/20 px-1 rounded">password_hint</span> field to store a reminder of the actual password instead.</p>
        </div>
      </div>

      <div className="relative mb-10">
        <input 
          type="text" 
          placeholder="Search platform, label, or username..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="header-search w-full"
          style={{ background: 'var(--surface2)', paddingLeft: '14px' }}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-[var(--surface)] border border-[var(--border)] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCredentials.map(cred => (
            <div key={cred.id} className="stat-card p-6 group relative">
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenDrawer(cred)} className="p-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:text-[var(--accent)]"><Edit3 size={12}/></button>
                <button onClick={() => handleDelete(cred.id)} className="p-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:text-[var(--red)]"><Trash2 size={12}/></button>
              </div>

              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--surface2)] rounded-xl flex items-center justify-center text-[var(--accent)] border border-[var(--border)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
                    <Key size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-none mb-1">{cred.platform}</h3>
                    <p className="text-[10px] text-dim font-mono uppercase tracking-tight">{cred.category || 'General'}</p>
                  </div>
                </div>
                <Badge variant="outline">{cred.label || 'Login'}</Badge>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between bg-[var(--surface2)] px-3 py-2 rounded-xl group/field">
                  <span className="text-[11px] font-mono text-dim truncate mr-2">{cred.username || 'No username'}</span>
                  <button 
                    onClick={() => cred.username && copyToClipboard(cred.username, 'Username')}
                    className="p-1.5 text-dim hover:text-[var(--accent)] opacity-0 group-hover/field:opacity-100 transition-all"
                  >
                    <Copy size={14} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between bg-[var(--surface2)]/50 border border-dashed border-[var(--border)] px-3 py-2 rounded-xl">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-[var(--teal)]" />
                    <span className="text-[11px] font-medium text-dim italic truncate">{cred.password_hint || 'No hint stored'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                <span className="text-[10px] text-dim font-mono tracking-tighter uppercase">Updated {new Date(cred.last_updated).toLocaleDateString()}</span>
                <div className="flex gap-2">
                   {cred.url && (
                    <a href={cred.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-[var(--surface2)] text-dim hover:bg-[var(--accent)] hover:text-white rounded-lg transition-all">
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

// ... inside component ...

      {/* Drawer */}
      <SlideOver 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        title={editingCred ? 'Edit Credential' : 'New Credential'}
      >
        <CredentialForm 
          initialData={editingCred || undefined}
          onSuccess={() => {
            setIsDrawerOpen(false)
            fetchCredentials()
          }}
          onCancel={() => setIsDrawerOpen(false)}
        />
      </SlideOver>
    </div>
  )
}

export default Vault
