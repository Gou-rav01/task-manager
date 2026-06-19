<script setup lang="ts">
import type { TaskCardEmit, TaskCardProps, TaskPriority } from '../../BLL/taskManager/types'

const props = defineProps<TaskCardProps>()
const emit = defineEmits<TaskCardEmit>()

const priorityLabels: Record<TaskPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

const onDragStart = (event: DragEvent): void => {
  if (event.dataTransfer === null) {
    return
  }

  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', props.task.id)
}
</script>

<template>
  <article class="task-card" draggable="true" @dragstart="onDragStart">
    <header class="task-card__header">
      <span class="priority-badge" :class="`priority-badge--${task.priority}`">
        {{ priorityLabels[task.priority] }}
      </span>
      <div class="task-card__actions">
        <button class="icon-button" type="button" aria-label="Edit task" title="Edit" @click="emit('edit', task)">
          Edit
        </button>
        <button
          class="icon-button icon-button--danger"
          type="button"
          aria-label="Delete task"
          title="Delete"
          @click="emit('delete', task)"
        >
          Del
        </button>
      </div>
    </header>

    <h3 class="task-card__title">{{ task.title }}</h3>
    <p class="task-card__description">{{ task.description }}</p>

    <div v-if="task.tags.length > 0" class="task-card__tags" aria-label="Tags">
      <span v-for="tag in task.tags" :key="tag" class="tag-chip">{{ tag }}</span>
    </div>

    <footer class="task-card__footer">
      <span
        class="task-card__date"
        :class="{ 'task-card__date--overdue': manager.isOverdue(task) }"
      >
        <span v-if="manager.isOverdue(task)" class="task-card__date-icon" aria-hidden="true">!</span>
        {{ task.dueDate }}
      </span>
      <span
        class="avatar"
        :style="{ backgroundColor: manager.getAssigneeColor(task.assignee) }"
        :title="task.assignee"
      >
        {{ manager.getAssigneeInitials(task.assignee) }}
      </span>
    </footer>
  </article>
</template>
