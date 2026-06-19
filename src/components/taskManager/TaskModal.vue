<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type {
  TaskFormInput,
  TaskModalEmit,
  TaskModalProps,
  TaskPriority,
  TaskStatus,
  TaskValidationErrors,
} from '../../BLL/taskManager/types'

const props = defineProps<TaskModalProps>()
const emit = defineEmits<TaskModalEmit>()

const priorities: TaskPriority[] = ['high', 'medium', 'low']
const statuses: TaskStatus[] = ['todo', 'in-progress', 'done']

const form = reactive<TaskFormInput>({
  title: '',
  description: '',
  priority: 'medium',
  dueDate: '',
  assignee: '',
  status: 'todo',
  tags: [],
})

const errors = reactive<TaskValidationErrors>({})
const tagText = computed<string>({
  get: () => form.tags.join(', '),
  set: (value: string) => {
    form.tags = value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
  },
})

const isEditing = computed<boolean>(() => props.task !== null)

const resetErrors = (): void => {
  delete errors.title
  delete errors.dueDate
}

const fillForm = (): void => {
  resetErrors()

  if (props.task === null) {
    form.title = ''
    form.description = ''
    form.priority = 'medium'
    form.dueDate = new Date().toISOString().slice(0, 10)
    form.assignee = props.manager.getAssignees()[0] ?? ''
    form.status = 'todo'
    form.tags = []
    return
  }

  form.title = props.task.title
  form.description = props.task.description
  form.priority = props.task.priority
  form.dueDate = props.task.dueDate
  form.assignee = props.task.assignee
  form.status = props.task.status
  form.tags = [...props.task.tags]
}

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      fillForm()
    }
  },
)

watch(
  () => props.task,
  () => {
    if (props.isOpen) {
      fillForm()
    }
  },
)

const onSubmit = (): void => {
  resetErrors()

  const result =
    props.task === null ? props.manager.createTask(form) : props.manager.updateTask(props.task.id, form)

  if (!result.validation.isValid) {
    Object.assign(errors, result.validation.errors)
    return
  }

  emit('saved')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="modal-shell" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
        <div class="modal-backdrop" @click="emit('close')"></div>
        <form class="task-modal" @submit.prevent="onSubmit">
          <header class="task-modal__header">
            <h2 id="task-modal-title">{{ isEditing ? 'Edit task' : 'Create task' }}</h2>
            <button class="icon-button" type="button" aria-label="Close modal" @click="emit('close')">Close</button>
          </header>

          <label class="field">
            <span>Title</span>
            <input v-model="form.title" type="text" autocomplete="off" />
            <small v-if="errors.title">{{ errors.title }}</small>
          </label>

          <label class="field">
            <span>Description</span>
            <textarea v-model="form.description" rows="4"></textarea>
          </label>

          <div class="task-modal__grid">
            <label class="field">
              <span>Priority</span>
              <select v-model="form.priority">
                <option v-for="priority in priorities" :key="priority" :value="priority">{{ priority }}</option>
              </select>
            </label>

            <label class="field">
              <span>Status</span>
              <select v-model="form.status">
                <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
              </select>
            </label>
          </div>

          <div class="task-modal__grid">
            <label class="field">
              <span>Due date</span>
              <input v-model="form.dueDate" type="date" />
              <small v-if="errors.dueDate">{{ errors.dueDate }}</small>
            </label>

            <label class="field">
              <span>Assignee</span>
              <input v-model="form.assignee" type="text" autocomplete="off" />
            </label>
          </div>

          <label class="field">
            <span>Tags</span>
            <input v-model="tagText" type="text" autocomplete="off" />
          </label>

          <footer class="task-modal__footer">
            <button class="secondary-button" type="button" @click="emit('close')">Cancel</button>
            <button class="primary-button" type="submit">Save task</button>
          </footer>
        </form>
      </div>
    </Transition>
  </Teleport>
</template>
