<script setup lang="ts">
import { computed, ref } from 'vue'
import TaskCard from './TaskCard.vue'
import type { KanbanColumnEmit, KanbanColumnProps, Task } from '../../BLL/taskManager/types'

const props = defineProps<KanbanColumnProps>()
const emit = defineEmits<KanbanColumnEmit>()

const isDragOver = ref(false)

const tasks = computed<Task[]>(() => props.manager.getTasksByStatus(props.status, props.filters))
const column = computed(() => props.manager.getColumnSummaries(props.filters).find((summary) => summary.status === props.status))

const onDragOver = (event: DragEvent): void => {
  event.preventDefault()
  isDragOver.value = true

  if (event.dataTransfer !== null) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const onDragLeave = (): void => {
  isDragOver.value = false
}

const onDrop = (event: DragEvent): void => {
  event.preventDefault()
  isDragOver.value = false

  const taskId = event.dataTransfer?.getData('text/plain') ?? ''

  if (taskId.length > 0) {
    props.manager.moveTo(taskId, props.status)
  }
}
</script>

<template>
  <section
    class="kanban-column"
    :class="{ 'kanban-column--over': isDragOver }"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <header class="kanban-column__header">
      <h2 class="kanban-column__title">{{ column?.label }}</h2>
      <span class="kanban-column__count">{{ tasks.length }}</span>
    </header>

    <TransitionGroup v-if="tasks.length > 0" name="card-list" tag="div" class="kanban-column__cards">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        :manager="manager"
        @edit="emit('edit-task', task)"
        @delete="emit('delete-task', task)"
      />
    </TransitionGroup>

    <div v-else class="kanban-column__empty">
      <div class="kanban-column__empty-mark" aria-hidden="true"></div>
      <p>No tasks here</p>
    </div>
  </section>
</template>
