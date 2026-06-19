import { reactive } from 'vue'
import { mockTasks } from './mockData'
import type {
  Task,
  TaskColumnSummary,
  TaskFilters,
  TaskFormInput,
  TaskMutationResult,
  TaskPriority,
  TaskSort,
  TaskStatus,
  TaskValidationErrors,
  TaskValidationResult,
  TaskView,
} from './types'

const priorityRank: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

const columnLabels: Record<TaskStatus, string> = {
  todo: 'Todo',
  'in-progress': 'In Progress',
  done: 'Done',
}

const avatarColors: string[] = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c', '#0891b2']

export class TaskManager {
  public readonly tasks: Task[]

  private readonly activeViewStorageKey = 'task-manager-active-view'

  public constructor(seedTasks: Task[] = mockTasks) {
    this.tasks = reactive(seedTasks.map((task) => this.cloneTask(task))) as Task[]
  }

  public getAllTasks(): Task[] {
    return this.tasks
  }

  public getTaskById(taskId: string): Task | null {
    return this.tasks.find((task) => task.id === taskId) ?? null
  }

  public getTasksByStatus(status: TaskStatus, filters: TaskFilters = this.getDefaultFilters()): Task[] {
    return this.getFilteredTasks(filters).filter((task) => task.status === status)
  }

  public getFilteredTasks(filters: TaskFilters): Task[] {
    return this.tasks.filter((task) => {
      const matchesPriority = filters.priority === 'all' || task.priority === filters.priority
      const matchesAssignee = filters.assignee === 'all' || task.assignee === filters.assignee

      return matchesPriority && matchesAssignee
    })
  }

  public getVisibleTasks(filters: TaskFilters, sort: TaskSort): Task[] {
    return this.sortTasks(this.getFilteredTasks(filters), sort)
  }

  public sortTasks(tasks: Task[], sort: TaskSort): Task[] {
    return [...tasks].sort((firstTask, secondTask) => {
      const directionModifier = sort.direction === 'asc' ? 1 : -1

      if (sort.field === 'priority') {
        return (priorityRank[firstTask.priority] - priorityRank[secondTask.priority]) * directionModifier
      }

      return (this.toDateTime(firstTask.dueDate) - this.toDateTime(secondTask.dueDate)) * directionModifier
    })
  }

  public moveTo(taskId: string, status: TaskStatus): Task | null {
    const task = this.getTaskById(taskId)

    if (task === null) {
      return null
    }

    task.status = status
    return task
  }

  public createTask(input: TaskFormInput): TaskMutationResult {
    const validation = this.validateTaskInput(input)

    if (!validation.isValid) {
      return { task: null, validation }
    }

    const task: Task = {
      ...input,
      tags: [...input.tags],
      id: this.createTaskId(),
      createdAt: new Date().toISOString(),
    }

    this.tasks.unshift(task)

    return { task, validation }
  }

  public updateTask(taskId: string, input: TaskFormInput): TaskMutationResult {
    const taskIndex = this.tasks.findIndex((task) => task.id === taskId)

    if (taskIndex === -1) {
      return {
        task: null,
        validation: {
          isValid: false,
          errors: { title: 'Task could not be found.' },
        },
      }
    }

    const validation = this.validateTaskInput(input, this.tasks[taskIndex])

    if (!validation.isValid) {
      return { task: null, validation }
    }

    const updatedTask: Task = {
      ...this.tasks[taskIndex],
      ...input,
      tags: [...input.tags],
    }

    this.tasks.splice(taskIndex, 1, updatedTask)

    return { task: updatedTask, validation }
  }

  public deleteTask(taskId: string): boolean {
    const taskIndex = this.tasks.findIndex((task) => task.id === taskId)

    if (taskIndex === -1) {
      return false
    }

    this.tasks.splice(taskIndex, 1)

    return true
  }

  public validateTaskInput(input: TaskFormInput, existingTask: Task | null = null): TaskValidationResult {
    const errors: TaskValidationErrors = {}
    const isUnchangedPastDueDate =
      existingTask !== null && input.dueDate === existingTask.dueDate && this.isPastDate(existingTask.dueDate)

    if (input.title.trim().length === 0) {
      errors.title = 'Title is required.'
    }

    if (input.dueDate.trim().length === 0) {
      errors.dueDate = 'Due date is required.'
    } else if (Number.isNaN(this.toDateTime(input.dueDate))) {
      errors.dueDate = 'Due date is invalid.'
    } else if (this.isPastDate(input.dueDate) && !isUnchangedPastDueDate) {
      errors.dueDate = 'Due date cannot be in the past.'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }

  public isOverdue(task: Task): boolean {
    return task.status !== 'done' && this.isPastDate(task.dueDate)
  }

  public getAssignees(): string[] {
    return [...new Set(this.tasks.map((task) => task.assignee))].sort((firstName, secondName) =>
      firstName.localeCompare(secondName),
    )
  }

  public getDefaultFilters(): TaskFilters {
    return {
      priority: 'all',
      assignee: 'all',
    }
  }

  public getDefaultSort(): TaskSort {
    return {
      field: 'dueDate',
      direction: 'asc',
    }
  }

  public getColumnSummaries(filters: TaskFilters = this.getDefaultFilters()): TaskColumnSummary[] {
    return (Object.keys(columnLabels) as TaskStatus[]).map((status) => ({
      status,
      label: columnLabels[status],
      count: this.getTasksByStatus(status, filters).length,
    }))
  }

  public getAssigneeInitials(assignee: string): string {
    return assignee
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((namePart) => namePart.charAt(0).toUpperCase())
      .join('')
  }

  public getAssigneeColor(assignee: string): string {
    const colorIndex =
      [...assignee].reduce((hash, character) => hash + character.charCodeAt(0), 0) % avatarColors.length

    return avatarColors[colorIndex]
  }

  public getInitialView(): TaskView {
    if (!this.hasLocalStorage()) {
      return 'kanban'
    }

    const storedView = window.localStorage.getItem(this.activeViewStorageKey)

    return storedView === 'list' || storedView === 'kanban' ? storedView : 'kanban'
  }

  public persistActiveView(view: TaskView): void {
    if (!this.hasLocalStorage()) {
      return
    }

    window.localStorage.setItem(this.activeViewStorageKey, view)
  }

  private cloneTask(task: Task): Task {
    return {
      ...task,
      tags: [...task.tags],
    }
  }

  private createTaskId(): string {
    return `task-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  }

  private isPastDate(date: string): boolean {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return this.toDateTime(date) < today.getTime()
  }

  private toDateTime(date: string): number {
    return new Date(`${date}T00:00:00`).getTime()
  }

  private hasLocalStorage(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
  }
}
