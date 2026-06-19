# Task Manager

Vue 3 + TypeScript task manager assessment with a Kanban board, list view, typed mock data, modal CRUD, filtering, sorting, native drag and drop, and localStorage view persistence.

## Setup

```bash
git clone https://github.com/Gou-rav01/task-manager.git
cd task-manager
npm install
npm run dev
```

The app runs with mock data pre-loaded.

## Architecture

The business layer lives in `src/BLL/taskManager`.

- `types.ts` contains every project interface, type alias, prop contract, and emit contract.
- `mockData.ts` exports `mockTasks: Task[]` with realistic backlog data that exercises overdue, priority, assignee, tag, and status states.
- `TaskManager.ts` owns CRUD, validation, movement, filtering, sorting, overdue checks, assignee helpers, and localStorage view persistence.

`src/pages/taskManager/index.vue` is the single entry point for the feature. It creates exactly one `TaskManager` instance and passes it as a typed prop to all child components. No Pinia, Vuex, or provide/inject is used.

Component hierarchy:

- `index.vue` owns page state, active view, controls, create/edit modal state, and delete confirmation modal state.
- `ViewToggle.vue` switches between Kanban and List.
- `KanbanBoard.vue` renders status columns.
- `KanbanColumn.vue` handles native HTML5 drag and drop and calls `manager.moveTo()`.
- `TaskCard.vue` renders card details and emits edit/delete intent without owning business logic.
- `ListView.vue` renders sorted flat task rows using `manager.getVisibleTasks()`.
- `TaskModal.vue` handles create/edit form UI and submits through `manager.createTask()` or `manager.updateTask()`.
- `DeleteTaskModal.vue` confirms destructive actions before the page calls `manager.deleteTask()`.

The page contains UI coordination only. Filtering, sorting, validation, CRUD, task movement, overdue detection, and assignee formatting stay in `TaskManager`. This makes the component tree slightly more prop-heavy, but it keeps the live walkthrough easy to defend because every business rule has one home.

## Design Decisions

1. The UI uses an operational product layout instead of a marketing-style layout. The assessment is for a task tool, so dense scan-friendly controls, stable columns, and predictable row scanning matter more than decorative composition. With more time and the real Dribbble file, I would tune exact shadow opacity, column widths, and color tokens against the reference.
2. Priority colors are intentionally high contrast: red for high, amber for medium, and blue for low. This makes urgency visible in both Kanban and List views without relying on sort order. The exact Dribbble reference was not included in the workspace, so the palette is documented as an assumption and isolated in CSS variables for fast replacement.
3. Assignee avatar colors are deterministic and generated from the assignee name in `TaskManager`. This keeps visual identity stable without storing presentation data in mock tasks. With more time, I would expand the palette and run contrast checks for every generated color.
4. Delete uses an in-app modal instead of the browser confirmation dialog. It is slightly more code, but it matches the rest of the UI, keeps destructive actions explicit, and avoids a jarring browser-native prompt during review.
5. The modal allows free-text assignees instead of a hard-coded dropdown. That makes create/edit more flexible while filters still derive their options from manager state. With more time, I would add an assignee combobox that supports both existing names and new entries.

## Known Limitations

- The Dribbble reference was not available in the project files. The implementation follows the written typography, spacing, badge, card, column, overdue, and empty-state rules, but exact pixel matching to the unseen reference cannot be implemented.
- Mobile layout is not optimized because the specification only requires the app not to break at 1280px wide.
- Data is in-memory only. Refreshing resets created, edited, deleted, and moved tasks because persistence was only required for the active view.


## Requirement Checklist

- TaskManager class exists at `src/BLL/taskManager/TaskManager.ts`.
- All CRUD and filter logic is implemented in `TaskManager`.
- One `TaskManager` instance is created in `src/pages/taskManager/index.vue`.
- The manager is passed to child components as typed props.
- No Pinia, Vuex, or provide/inject is used.
- Project types are centralized in `src/BLL/taskManager/types.ts`.
- Mock data is explicitly typed as `Task[]`.
- Mock data includes 12 tasks, all statuses, all priorities with at least 3 each, at least 3 overdue active tasks, at least 4 realistic assignees, and populated tags on at least 6 tasks.
- Kanban has Todo, In Progress, and Done columns.
- Kanban drag and drop uses the native HTML5 API and calls `moveTo()`.
- List view renders all visible tasks and supports due date and priority sorting.
- Active view persists in localStorage.
- Cards show title, 2-line description clamp, priority badge, due date, assignee initials, and tags.
- Overdue active tasks show red due dates and an icon.
- Create and edit use a modal with inline title and due date validation.
- Priority and assignee filters call manager filtering methods.
- Delete actions use an in-app confirmation modal before calling `deleteTask()`.
- Card/list/modal transitions are implemented.
- Empty columns and empty list states are visually distinct.
