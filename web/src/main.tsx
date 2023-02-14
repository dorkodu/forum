import ReactDOM from 'react-dom/client'
import Router from './routes/_Router'
import "./lib/i18n";
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<Router />)
