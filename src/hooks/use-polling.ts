import { useEffect, useRef } from 'react'

type PollingOptions = {
  enabled?: boolean
  immediate?: boolean
  runWhileHidden?: boolean
}

export function usePolling(
  callback: () => void,
  delay: number,
  options: PollingOptions = {}
) {
  const { enabled = true, immediate = false, runWhileHidden = false } = options
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled || typeof delay !== 'number' || delay <= 0) {
      return
    }

    const execute = () => {
      if (!runWhileHidden && typeof document !== 'undefined' && document.hidden) {
        return
      }
      savedCallback.current?.()
    }

    if (immediate) {
      execute()
    }

    const intervalId = window.setInterval(execute, delay)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [delay, enabled, immediate, runWhileHidden])
}
