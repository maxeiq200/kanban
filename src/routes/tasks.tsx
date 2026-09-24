import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { addTask, tasksQueryOptions } from '../api/tasks'
import { useFilterStore } from '../store/filterStore'
import type { Filter } from '../store/filterStore'

export const Route = createFileRoute('/tasks')({
  loader: ({ context }) => context.queryClient.ensureQueryData(tasksQueryOptions),
  component: TasksPage,
})

const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'done', label: 'Выполненные' },
]

function TasksPage() {
  const { data: tasks } = useSuspenseQuery(tasksQueryOptions)
  const filter = useFilterStore((s) => s.filter)
  const setFilter = useFilterStore((s) => s.setFilter)
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')

  const mutation = useMutation({
    mutationFn: addTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryOptions.queryKey })
      setTitle('')
    },
  })

  const visibleTasks = tasks.filter((task) => {
    if (filter === 'done') return task.done
    if (filter === 'active') return !task.done
    return true
  })

  return (
    <div>
      <h1>Задачи</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{ fontWeight: filter === f.value ? 'bold' : 'normal' }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (title.trim()) mutation.mutate(title.trim())
        }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Новая задача"
        />
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Добавляем...' : 'Добавить'}
        </button>
      </form>

      <ul>
        {visibleTasks.map((task) => (
          <li key={task.id}>
            {task.done ? '✅' : '⬜'} {task.title}
          </li>
        ))}
      </ul>
    </div>
  )
}