import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { BusinessProfile } from '../types'
import { Save, Building2, User, Palette, Database, Info, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

const Settings: React.FC = () => {
  const [profile, setProfile] = useState<BusinessProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'business' | 'appearance' | 'data' | 'about'>('business')

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('business_profile')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') throw error
      if (data) setProfile(data)
    } catch (error: any) {
      toast.error('Failed to load profile: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (field: keyof BusinessProfile, value: string) => {
    if (!profile) return
    
    try {
      setSaving(true)
      const updatedProfile = { ...profile, [field]: value, updated_at: new Date().toISOString() }
      setProfile(updatedProfile)

      const { error } = await supabase
        .from('business_profile')
        .upsert(updatedProfile)

      if (error) throw error
    } catch (error: any) {
      toast.error(`Failed to update ${field}: ` + error.message)
    } finally {
      setSaving(false)
    }
  }

  const renderInput = (label: string, field: keyof BusinessProfile, placeholder: string = '') => (
    <div className="space-y-1.5">
      <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-dim">{label}</label>
      <input 
        type="text" 
        value={profile?.[field] || ''}
        onChange={(e) => setProfile(prev => prev ? { ...prev, [field]: e.target.value } : null)}
        onBlur={(e) => handleUpdate(field, e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[var(--s2)] border border-[var(--border)] focus:border-[var(--accent)] focus:bg-[var(--s1)] rounded-xl py-3 px-4 outline-none transition-all text-sm"
      />
    </div>
  )

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure your business profile and app preferences.</p>
        </div>
        <div className={`flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-tight transition-all ${saving ? 'text-[var(--accent)] animate-pulse' : 'text-[var(--green)]'}`}>
          {saving ? 'Saving changes...' : <><CheckCircle2 size={12} /> Auto-saved</>}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 space-y-1">
          {[
            { id: 'business', label: 'Business Profile', icon: Building2 },
            { id: 'appearance', label: 'Appearance', icon: Palette },
            { id: 'data', label: 'Data Management', icon: Database },
            { id: 'about', label: 'About App', icon: Info },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`settings-tab w-full ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 shadow-sm">
          {activeTab === 'business' && (
            <div className="space-y-8">
              <div className="flex items-center gap-6 mb-4">
                <div className="w-20 h-20 bg-[var(--surface2)] rounded-2xl border-2 border-dashed border-[var(--border)] flex items-center justify-center text-faint group cursor-pointer hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">
                  <Building2 size={32} />
                </div>
                <div>
                   <h3 className="font-bold text-lg mb-1">Company Logo</h3>
                   <p className="text-xs text-dim">Used for invoice generation. Square aspect ratio recommended.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInput('Business Name', 'business_name', 'BeanBag Media House')}
                {renderInput('Business Email', 'email', 'hello@bbmh.media')}
                {renderInput('Business Phone', 'phone', '+91 98765 43210')}
                {renderInput('City / Region', 'city', 'Mumbai, India')}
              </div>

              <div className="pt-8 border-t border-[var(--border)]">
                <h3 className="stat-card-label mb-6">Tax & Banking Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {renderInput('GST Number', 'gst_number', '27AAAAA0000A1Z5')}
                  {renderInput('PAN Number', 'pan_number', 'ABCDE1234F')}
                  {renderInput('Bank Name', 'bank_name', 'HDFC Bank')}
                  {renderInput('Account Number', 'bank_account', '50100000000000')}
                  {renderInput('IFSC Code', 'bank_ifsc', 'HDFC0000000')}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
             <div className="py-20 text-center">
                <Palette size={48} className="text-faint mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Theme Preferences</h3>
                <p className="text-sm text-dim">Dark mode can be toggled from the header on any page.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
