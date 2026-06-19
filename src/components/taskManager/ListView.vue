<script setup lang="ts">
import { computed } from 'vue'
import type { ListViewEmit, ListViewProps, Task, TaskPriority } from '../../BLL/taskManager/types'

const props = defineProps<ListViewProps>()
const emit = defineEmits<ListViewEmit>()

const priorityLabels: Record<TaskPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

const tasks = computed<Task[]>(() => props.manager.getVisibleTasks(props.filters, props.sort))
</script>

<template>
  <section class="list-view">
    <div class="list-view__header">
      <span>Task</span>
      <span>Priority</span>
      <span>Due</span>
      <span>Assignee</span>
      <span>Status</span>
      <span></span>
    </div>

    <TransitionGroup v-if="tasks.length > 0" name="row-list" tag="div" class="list-view__rows">
      <article v-for="task in tasks" :key="task.id" class="task-row">
        <div class="task-row__main">
          <h3>{{ task.title }}</h3>
          <p>{{ task.description }}</p>
          <div class="task-row__tags">
            <span v-for="tag in task.tags" :key="tag" class="tag-chip">{{ tag }}</span>
          </div>
        </div>

        <span class="priority-badge" :class="`priority-badge--${task.priority}`">
          {{ priorityLabels[task.priority] }}
        </span>

        <span class="task-row__date" :class="{ 'task-row__date--overdue': manager.isOverdue(task) }">
          <span v-if="manager.isOverdue(task)" aria-hidden="true">!</span>
          {{ task.dueDate }}
        </span>

        <span class="task-row__assignee">
          <span class="avatar" :style="{ backgroundColor: manager.getAssigneeColor(task.assignee) }">
            {{ manager.getAssigneeInitials(task.assignee) }}
          </span>
          {{ task.assignee }}
        </span>

        <span class="status-pill" :class="`status-pill--${task.status}`">{{ task.status }}</span>

        <div class="task-row__actions">
          <button class="small-button" type="button" @click="emit('edit-task', task)">Edit</button>
          <button class="small-button small-button--danger" type="button" @click="emit('delete-task', task)">Delete</button>
        </div>
      </article>
    </TransitionGroup>

    <div v-else class="list-view__empty">No matching tasks</div>
  </section>
</template>
