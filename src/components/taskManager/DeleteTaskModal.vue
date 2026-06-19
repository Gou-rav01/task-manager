<script setup lang="ts">
import type { DeleteTaskModalEmit, DeleteTaskModalProps } from '../../BLL/taskManager/types'

defineProps<DeleteTaskModalProps>()
const emit = defineEmits<DeleteTaskModalEmit>()
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen && task !== null" class="modal-shell" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
        <div class="modal-backdrop" @click="emit('cancel')"></div>
        <section class="delete-modal">
          <header class="delete-modal__header">
            <h2 id="delete-modal-title">Delete task</h2>
          </header>

          <p>
            This will remove <strong>{{ task.title }}</strong> from the task board.
          </p>

          <footer class="delete-modal__footer">
            <button class="secondary-button" type="button" @click="emit('cancel')">Cancel</button>
            <button class="danger-button" type="button" @click="emit('confirm')">Delete task</button>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
    