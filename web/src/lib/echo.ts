import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

declare global {
  interface Window {
    Pusher: typeof Pusher
    Echo: Echo<any>
  }
}

window.Pusher = Pusher

const scheme = import.meta.env.VITE_REVERB_SCHEME ?? 'http'
const port = Number(import.meta.env.VITE_REVERB_PORT ?? 8080)

const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY ?? 'restaurant-key',
  wsHost: import.meta.env.VITE_REVERB_HOST ?? 'localhost',
  wsPort: port,
  wssPort: port,
  forceTLS: scheme === 'https',
  enabledTransports: ['ws', 'wss'],
})

export default echo
