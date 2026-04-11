export {}

declare global {

  /* GLOBAL OBJECTS */
  const window: Window
  const document: Document

  /* WINDOW */
  interface Window {
    addEventListener(
      type: string,
      listener: (this: Window, ev: any) => any
    ): void

    removeEventListener(
      type: string,
      listener: (this: Window, ev: any) => any
    ): void
  }

  /* DOCUMENT */
  interface Document {
    fullscreenElement: Element | null
    exitFullscreen(): Promise<void>
  }

  /* ELEMENT */
  interface HTMLElement {
    requestFullscreen(): Promise<void>
  }

  /* VIDEO */
  interface HTMLVideoElement {
    play(): Promise<void>
    pause(): void
    paused: boolean
    currentTime: number
    duration: number
    volume: number
  }

  /* KEYBOARD */
  interface KeyboardEvent {
    key: string
    code: string
  }
}
interface HTMLInputElement {
    value: any
  }