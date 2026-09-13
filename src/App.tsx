import { createBrowserRouter, RouterProvider } from 'react-router'
import { routes } from './routes'
import { SessionProvider } from './session/SessionProvider'
import './App.css'

const router = createBrowserRouter(routes)

function App() {
  return (
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>
  )
}

export default App
