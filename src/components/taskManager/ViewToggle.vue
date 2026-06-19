<script setup lang="ts">
import type { TaskView, ViewToggleEmit, ViewToggleProps } from '../../BLL/taskManager/types'

defineProps<ViewToggleProps>()

const emit = defineEmits<ViewToggleEmit>()

const views: TaskView[] = ['kanban', 'list']

const getViewLabel = (view: TaskView): string => (view === 'kanban' ? 'Kanban' : 'List')
</script>

<template>
  <div class="view-toggle" aria-label="View mode">
    <button
      v-for="view in views"
      :key="view"
      class="view-toggle__button"
      :class="{ 'view-toggle__button--active': activeView === view }"
      type="button"
      @click="emit('change', view)"
    >
      {{ getViewLabel(view) }}
    </button>
  </div>
</template>
