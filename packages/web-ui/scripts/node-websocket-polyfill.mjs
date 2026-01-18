import { WebSocket } from 'undici'

if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = WebSocket
}
