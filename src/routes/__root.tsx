import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div>
      <nav style={{ display: 'flex', gap: 16 }}>
        <Link to="/">Главная</Link>
        <Link to="/tasks">Задачи</Link>
      </nav>
      <hr />
      <Outlet />
    </div>
  )
}