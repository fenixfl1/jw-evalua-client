/* eslint-disable no-console */
type MessageHandler = (payload: unknown) => void

export interface Message {
  type: string
  data?: unknown
}

export class WebSocketClient {
  private ws: WebSocket | null = null
  private readonly url: string
  private reconnectDelay = 3000
  private isManualClose = false
  private listeners: Map<string, MessageHandler[]> = new Map()

  constructor(url: string) {
    this.url = url
    this.connect()
  }

  private connect() {
    if (!this.url) return
    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      console.info('[WS] ✅ Conectado')
    }

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const msg: Message = JSON.parse(event.data)
        this.emit(msg.type, msg.data)
      } catch (error) {
        console.error('[WS] ❌ Error al parsear mensaje:', event.data, error)
      }
    }

    this.ws.onclose = (e) => {
      console.warn('[WS] 🔌 Desconectado:', e.code)

      if (!this.isManualClose) {
        setTimeout(() => {
          console.info('[WS] 🔁 Reconectando...')
          this.connect()
        }, this.reconnectDelay)
      }
    }

    this.ws.onerror = (e) => {
      console.error('[WS] ❗ Error:', e)
    }
  }

  public send(event: Message) {
    const message: Message = { ...event }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('[WS] ⚠️ No conectado. No se envió:', message)
    }
  }

  public on(type: string, handler: MessageHandler) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    this.listeners.get(type)?.push(handler)
  }

  public off(type: string, handler: MessageHandler) {
    const handlers = this.listeners.get(type)
    if (handlers) {
      this.listeners.set(
        type,
        handlers.filter((h) => h !== handler)
      )
    }
  }

  private emit(type: string, data: unknown) {
    const handlers = this.listeners.get(type)
    if (handlers) {
      handlers.forEach((handler) => handler(data))
    }
  }

  public close() {
    this.isManualClose = true
    this.ws?.close()
  }
}
