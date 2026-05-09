import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  Rocket, 
  CircleDollarSign, 
  CheckSquare, 
  UserSquare2, 
  Briefcase, 
  PieChart, 
  Lock, 
  KeyRound,
  Settings,
  ChevronRight
} from 'lucide-react'
import { cn } from '../lib/utils'

const navItems = [
  { name: 'Command Centre', path: '/', icon: LayoutDashboard },
  { name: 'Clients', path: '/clients', icon: Users },
  { name: 'Projects', path: '/projects', icon: Target },
  { name: 'Pipeline', path: '/pipeline', icon: Rocket },
  { name: 'Finances', path: '/finances', icon: CircleDollarSign },
  { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  { name: 'People', path: '/people', icon: UserSquare2 },
  { name: 'Vault', path: '/vault', icon: KeyRound },
  { name: 'Settings', path: '/settings', icon: Settings },
]

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: 'var(--accent)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: 14,
            fontFamily: 'var(--font-sans)'
          }}>B</div>
          <div>
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 16, fontWeight: 800,
              color: 'var(--text)', letterSpacing: '-0.3px'
            }}>BBMh</div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9, color: 'var(--text-dim)',
              letterSpacing: '0.12em', textTransform: 'uppercase'
            }}>Business Hub</div>
          </div>
        </div>
        <div className="sidebar-version">V1.0.0-STABLE</div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "nav-item",
              isActive && "active"
            )}
          >
            <item.icon size={18} />
            {item.name}
            {/* Optional: Add badge logic here if needed */}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="sidebar-avatar">
          MP
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="sidebar-user-name truncate">Murphy Patel</p>
          <p className="sidebar-user-role truncate">Administrator</p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
