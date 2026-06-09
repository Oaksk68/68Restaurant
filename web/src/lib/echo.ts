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
const reverbHost = import.meta.env.VITE_REVERB_HOST
const wsHost = (reverbHost === 'localhost' || reverbHost === '127.0.0.1' || !reverbHost)
  ? window.location.hostname
  : reverbHost

const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY ?? 'restaurant-key',
  wsHost,
  wsPort: port,
  wssPort: port,
  forceTLS: scheme === 'https',
  enabledTransports: ['ws', 'wss'],
})

export default echo
