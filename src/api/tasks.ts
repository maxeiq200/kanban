import { queryOptions } from '@tanstack/react-query'

export type Task = {
  id: number
  title: string
  done: boolean
}

let tasks: Task[] = [
  { id: 1, title: 'Установить Node.js', done: true },
  { id: 2, title: 'Создать проект на Vite', done: true },
  { id: 3, title: 'Разобраться с TanStack Router', done: false },
]

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchTasks(): Promise<Task[]> {
  await delay(500)
  return [...tasks]
}

export async function addTask(title: string): Promise<Task> {
  await delay(300)
  const task: Task = { id: Date.now(), title, done: false }
  tasks = [...tasks, task]
  return task
}

export const tasksQueryOptions = queryOptions({
  queryKey: ['tasks'],
  queryFn: fetchTasks,
})