const DEFAULT_INTERVAL_MS = 60_000

const envInterval = Number(import.meta.env.VITE_APP_POLLING_INTERVAL_MS)

export const DEFAULT_POLLING_INTERVAL_MS =
  Number.isFinite(envInterval) && envInterval > 0
    ? envInterval
    : DEFAULT_INTERVAL_MS
