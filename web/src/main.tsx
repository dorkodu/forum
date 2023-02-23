import ReactDOM from 'react-dom/client'
import { RouterProvider } from "react-router-dom"
import { router } from './routes/_Router'
import "./lib/i18n";

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <RouterProvider router={router} />
)
