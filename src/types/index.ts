export type ClientStatus = 'active' | 'inactive' | 'prospect' | 'churned'

export interface Client {
  id: string
  name: string
  company?: string
  email?: string
  phone?: string
  whatsapp?: string
  city?: string
  industry?: string
  status: ClientStatus
  source?: string
  avatar_url?: string
  notes?: string
  monthly_retainer: number
  total_billed: number
  created_at: string
  updated_at: string
}

export type ProjectStatus = 'active' | 'paused' | 'complete' | 'cancelled'
export type ProjectStage = 'discovery' | 'proposal' | 'active' | 'revision' | 'delivered' | 'invoiced'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export interface Project {
  id: string
  client_id: string
  title: string
  description?: string
  type?: string
  status: ProjectStatus
  stage: ProjectStage
  value: number
  paid: number
  start_date?: string
  end_date?: string
  deadline?: string
  notes?: string
  priority: Priority
  created_at: string
}

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  category?: string
  description: string
  date: string
  client_id?: string
  project_id?: string
  invoice_id?: string
  payment_method?: string
  receipt_url?: string
  notes?: string
  created_at: string
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export interface Invoice {
  id: string
  invoice_number: string
  client_id: string
  project_id?: string
  amount: number
  tax: number
  total: number
  status: InvoiceStatus
  issue_date: string
  due_date?: string
  paid_date?: string
  payment_method?: string
  notes?: string
  created_at: string
}

export type LeadStage = 'new' | 'contacted' | 'proposal_sent' | 'negotiating' | 'won' | 'lost'

export interface Lead {
  id: string
  name: string
  company?: string
  email?: string
  phone?: string
  stage: LeadStage
  source?: string
  estimated_value: number
  service_interest?: string
  follow_up_date?: string
  notes?: string
  converted: boolean
  created_at: string
}

export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface CRMTask {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  due_date?: string
  client_id?: string
  project_id?: string
  assignee_id?: string
  completed_at?: string
  created_at: string
}

export type PersonType = 'team' | 'freelancer' | 'vendor' | 'partner'

export interface Person {
  id: string
  name: string
  role?: string
  department?: string
  email?: string
  phone?: string
  whatsapp?: string
  type: PersonType
  status: 'active' | 'inactive'
  daily_rate?: number
  avatar_url?: string
  notes?: string
  joined_at?: string
  created_at: string
}

export interface Credential {
  id: string
  platform: string
  label?: string
  username?: string
  password_hint?: string
  url?: string
  category?: string
  client_id?: string
  notes?: string
  last_updated: string
  created_at: string
}

export interface BusinessProfile {
  id: string
  business_name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  gst_number?: string
  pan_number?: string
  bank_name?: string
  bank_account?: string
  bank_ifsc?: string
  logo_url?: string
  updated_at: string
}
