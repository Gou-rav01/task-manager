import type { TaskManager } from './TaskManager'

export type TaskStatus = 'todo' | 'in-progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskView = 'kanban' | 'list'
export type SortDirection = 'asc' | 'desc'
export type TaskSortField = 'dueDate' | 'priority'
export type TaskPriorityFilter = TaskPriority | 'all'
export type TaskAssigneeFilter = string | 'all'

export interface Task {
  id: string
  title: string
  description: string
  priority: TaskPriority
  dueDate: string
  assignee: string
  status: TaskStatus
  tags: string[]
  createdAt: string
}

export interface TaskFormInput {
  title: string
  description: string
  priority: TaskPriority
  dueDate: string
  assignee: string
  status: TaskStatus
  tags: string[]
}

export interface TaskFilters {
  priority: TaskPriorityFilter
  assignee: TaskAssigneeFilter
}

export interface TaskSort {
  field: TaskSortField
  direction: SortDirection
}

export interface TaskValidationErrors {
  title?: string
  dueDate?: string
}

export interface TaskValidationResult {
  isValid: boolean
  errors: TaskValidationErrors
}

export interface TaskMutationResult {
  task: Task | null
  validation: TaskValidationResult
}

export interface TaskColumnSummary {
  status: TaskStatus
  label: string
  count: number
}

export interface TaskManagerPageState {
  activeView: TaskView
  filters: TaskFilters
  sort: TaskSort
  selectedTask: Task | null
  taskPendingDelete: Task | null
  isTaskModalOpen: boolean
  isDeleteModalOpen: boolean
}

export interface TaskManagerProp {
  manager: TaskManager
}

export interface KanbanBoardProps extends TaskManagerProp {
  filters: TaskFilters
}

export interface KanbanColumnProps extends TaskManagerProp {
  status: TaskStatus
  filters: TaskFilters
}

export interface TaskCardProps extends TaskManagerProp {
  task: Task
}

export interface ListViewProps extends TaskManagerProp {
  filters: TaskFilters
  sort: TaskSort
}

export interface TaskModalProps extends TaskManagerProp {
  task: Task | null
  isOpen: boolean
}

export interface DeleteTaskModalProps {
  task: Task | null
  isOpen: boolean
}

export interface ViewToggleProps {
  activeView: TaskView
}

export type TaskCardEmit = (event: 'edit' | 'delete', task: Task) => void
export type KanbanBoardEmit = (event: 'edit-task' | 'delete-task', task: Task) => void
export type KanbanColumnEmit = (event: 'edit-task' | 'delete-task', task: Task) => void
export type ListViewEmit = (event: 'edit-task' | 'delete-task', task: Task) => void
export type TaskModalEmit = (event: 'close' | 'saved') => void
export type DeleteTaskModalEmit = (event: 'cancel' | 'confirm') => void
export type ViewToggleEmit = (event: 'change', view: TaskView) => void
