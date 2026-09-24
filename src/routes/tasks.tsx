import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { addTask, deleteTask, tasksQueryOptions, toggleTask } from '../api/tasks'
import type { Task } from '../api/tasks'
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

  const queryKey = tasksQueryOptions.queryKey
  const refreshTasks = () => queryClient.invalidateQueries({ queryKey })

  const addMutation = useMutation({
    mutationFn: addTask,
    onSuccess: () => {
      refreshTasks()
      setTitle('')
    },
  })

  const toggleMutation = useMutation({
    mutationFn: toggleTask,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Task[]>(queryKey)
      queryClient.setQueryData<Task[]>(queryKey, (old) =>
        old?.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
      )
      return { previous }
    },
    onError: (_error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
    },
    onSettled: refreshTasks,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Task[]>(queryKey)
      queryClient.setQueryData<Task[]>(queryKey, (old) =>
        old?.filter((t) => t.id !== id),
      )
      return { previous }
    },
    onError: (_error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
    },
    onSettled: refreshTasks,
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
          if (title.trim()) addMutation.mutate(title.trim())
        }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Новая задача"
        />
        <button type="submit" disabled={addMutation.isPending}>
          {addMutation.isPending ? 'Добавляем...' : 'Добавить'}
        </button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {visibleTasks.map((task) => (
          <li
            key={task.id}
            style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}
          >
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => toggleMutation.mutate(task.id)}
            />
            <span style={{ textDecoration: task.done ? 'line-through' : 'none' }}>
              {task.title}
            </span>
            <button onClick={() => deleteMutation.mutate(task.id)}>Удалить</button>
          </li>
        ))}
      </ul>
    </div>
  )
}