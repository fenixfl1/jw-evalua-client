import { useEffect, useState } from 'react'

/**
 * Este hook es credo con la intención de optimizar los inputs de búsqueda
 * evitando que se haga una llamada al servidor cada ves que el usuario precionar una tecla
 * @param (value: T, delay: number)
 * @returns debouncedValue: T
 * @example
 *
 * const [searchValue, setSearchValue] = useState('')
 * debounce = useDebounce(searchValue, delay)
 *
 * useEffect(() => {
 *  dispatch(someAction(debounce))
 * }, [debounce])
 */
function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebounce
