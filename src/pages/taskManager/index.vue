<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import KanbanBoard from '../../components/taskManager/KanbanBoard.vue'
import DeleteTaskModal from '../../components/taskManager/DeleteTaskModal.vue'
import ListView from '../../components/taskManager/ListView.vue'
import TaskModal from '../../components/taskManager/TaskModal.vue'
import ViewToggle from '../../components/taskManager/ViewToggle.vue'
import { TaskManager } from '../../BLL/taskManager/TaskManager'
import type {
  Task,
  TaskManagerPageState,
  TaskPriorityFilter,
  TaskSortField,
  TaskView,
} from '../../BLL/taskManager/types'

const manager = new TaskManager()

const state = reactive<TaskManagerPageState>({
  activeView: manager.getInitialView(),
  filters: manager.getDefaultFilters(),
  sort: manager.getDefaultSort(),
  selectedTask: null,
  taskPendingDelete: null,
  isTaskModalOpen: false,
  isDeleteModalOpen: false,
})

const priorities: TaskPriorityFilter[] = ['all', 'high', 'medium', 'low']
const assignees = computed<string[]>(() => manager.getAssignees())

watch(
  () => state.activeView,
  (view) => {
    manager.persistActiveView(view)
  },
)

const onViewChange = (view: TaskView): void => {
  state.activeView = view
}

const openCreateModal = (): void => {
  state.selectedTask = null
  state.isTaskModalOpen = true
}

const openEditModal = (task: Task): void => {
  state.selectedTask = task
  state.isTaskModalOpen = true
}

const closeModal = (): void => {
  state.isTaskModalOpen = false
}

const openDeleteModal = (task: Task): void => {
  state.taskPendingDelete = task
  state.isDeleteModalOpen = true
}

const closeDeleteModal = (): void => {
  state.isDeleteModalOpen = false
  state.taskPendingDelete = null
}

const confirmDeleteTask = (): void => {
  if (state.taskPendingDelete !== null) {
    manager.deleteTask(state.taskPendingDelete.id)
  }

  closeDeleteModal()
}

const onTaskSaved = (): void => {
  state.isTaskModalOpen = false
}

const setSortField = (field: TaskSortField): void => {
  if (state.sort.field === field) {
    state.sort.direction = state.sort.direction === 'asc' ? 'desc' : 'asc'
    return
  }

  state.sort.field = field
  state.sort.direction = 'asc'
}
</script>

<template>
  <main class="task-page">
    <header class="task-page__topbar">
      <div>
        <p class="task-page__eyebrow">Product backlog</p>
        <h1>Task Manager</h1>
      </div>

      <div class="task-page__actions">
        <ViewToggle :active-view="state.activeView" @change="onViewChange" />
        <button class="primary-button" type="button" @click="openCreateModal">New task</button>
      </div>
    </header>

    <section class="control-bar" aria-label="Task controls">
      <label class="control">
        <span>Priority</span>
        <select v-model="state.filters.priority">
          <option v-for="priority in priorities" :key="priority" :value="priority">{{ priority }}</option>
        </select>
      </label>

      <label class="control">
        <span>Assignee</span>
        <select v-model="state.filters.assignee">
          <option value="all">all</option>
          <option v-for="assignee in assignees" :key="assignee" :value="assignee">{{ assignee }}</option>
        </select>
      </label>

      <div v-if="state.activeView === 'list'" class="sort-controls" aria-label="Sort controls">
        <button class="secondary-button" type="button" @click="setSortField('dueDate')">
          Due {{ state.sort.field === 'dueDate' ? state.sort.direction : '' }}
        </button>
        <button class="secondary-button" type="button" @click="setSortField('priority')">
          Priority {{ state.sort.field === 'priority' ? state.sort.direction : '' }}
        </button>
      </div>
    </section>

    <KanbanBoard
      v-if="state.activeView === 'kanban'"
      :manager="manager"
      :filters="state.filters"
      @edit-task="openEditModal"
      @delete-task="openDeleteModal"
    />

    <ListView
      v-else
      :manager="manager"
      :filters="state.filters"
      :sort="state.sort"
      @edit-task="openEditModal"
      @delete-task="openDeleteModal"
    />

    <TaskModal
      :manager="manager"
      :task="state.selectedTask"
      :is-open="state.isTaskModalOpen"
      @close="closeModal"
      @saved="onTaskSaved"
    />

    <DeleteTaskModal
      :task="state.taskPendingDelete"
      :is-open="state.isDeleteModalOpen"
      @cancel="closeDeleteModal"
      @confirm="confirmDeleteTask"
    />
  </main>
</template>
