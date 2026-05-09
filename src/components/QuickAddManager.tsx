import React from 'react'
import { useQuickAdd } from '../context/QuickAddContext'
import SlideOver from './ui/SlideOver'
import TransactionForm from './forms/TransactionForm'
import ClientForm from './forms/ClientForm'
import ProjectForm from './forms/ProjectForm'
import TaskForm from './forms/TaskForm'
import PersonForm from './forms/PersonForm'

const QuickAddManager: React.FC = () => {
  const { activeType, initialData, close } = useQuickAdd()

  if (activeType === 'none' || activeType === 'menu') return null

  const getTitle = () => {
    switch (activeType) {
      case 'transaction': 
        return initialData?.type === 'expense' ? 'New Expense' : 'New Income'
      case 'client': 
        return 'Add New Client'
      case 'project': 
        return 'Start New Project'
      case 'task': 
        return 'Create New Task'
      case 'person':
        return 'Add New Person'
      default: 
        return 'Quick Add'
    }
  }

  const renderForm = () => {
    switch (activeType) {
      case 'transaction':
        return <TransactionForm initialData={initialData} onSuccess={close} onCancel={close} />
      case 'client':
        return <ClientForm initialData={initialData} onSuccess={close} onCancel={close} />
      case 'project':
        return <ProjectForm initialData={initialData} onSuccess={close} onCancel={close} />
      case 'task':
        return <TaskForm initialData={initialData} onSuccess={close} onCancel={close} />
      case 'person':
        return <PersonForm initialData={initialData} onSuccess={close} onCancel={close} />
      default:
        return null
    }
  }

  return (
    <SlideOver 
      isOpen={true} 
      onClose={close} 
      title={getTitle()}
    >
      {renderForm()}
    </SlideOver>
  )
}

export default QuickAddManager
