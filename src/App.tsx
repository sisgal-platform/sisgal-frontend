import { createBrowserRouter, RouterProvider } from 'react-router'
import { routes } from './routes'
import { SessionProvider } from './session/SessionProvider'
import { ToastProvider } from './toast/ToastProvider'
import './App.css'

const router = createBrowserRouter(routes)

function App() {
  return (
    <SessionProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </SessionProvider>
  )
}

export default App
