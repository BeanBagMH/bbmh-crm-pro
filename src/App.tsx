import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import CommandCentre from './pages/CommandCentre'
import Clients from './pages/Clients'
import Projects from './pages/Projects'
import Pipeline from './pages/Pipeline'
import Finances from './pages/Finances'
import Tasks from './pages/Tasks'
import People from './pages/People'
import Vault from './pages/Vault'
import Settings from './pages/Settings'

import Sidebar from './components/Sidebar'
import Header from './components/Header'
import FloatingAddButton from './components/FloatingAddButton'
import { QuickAddProvider } from './context/QuickAddContext'
import QuickAddManager from './components/QuickAddManager'
import QuickAddMenu from './components/QuickAddMenu'

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen bg-[var(--bg)]">
    <Sidebar />
    <div className="flex-1 flex flex-col min-w-0">
      <Header />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
    <FloatingAddButton />
    <QuickAddManager />
    <QuickAddMenu />
  </div>
)

function App() {
  return (
    <QuickAddProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<CommandCentre />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/finances" element={<Finances />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/people" element={<People />} />
            <Route path="/vault" element={<Vault />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </QuickAddProvider>
  )
}

export default App
