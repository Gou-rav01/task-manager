<script setup lang="ts">
import KanbanColumn from './KanbanColumn.vue'
import type { KanbanBoardEmit, KanbanBoardProps, TaskStatus } from '../../BLL/taskManager/types'

defineProps<KanbanBoardProps>()
const emit = defineEmits<KanbanBoardEmit>()

const statuses: TaskStatus[] = ['todo', 'in-progress', 'done']
</script>

<template>
  <div class="kanban-board">
    <KanbanColumn
      v-for="status in statuses"
      :key="status"
      :status="status"
      :manager="manager"
      :filters="filters"
      @edit-task="emit('edit-task', $event)"
      @delete-task="emit('delete-task', $event)"
    />
  </div>
</template>
