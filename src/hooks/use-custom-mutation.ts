/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { AxiosError } from 'axios'

interface MutationOptions<TData = unknown, TPayload = unknown>
  extends UseMutationOptions<TData, AxiosError, TPayload, unknown> {
  initialData?: TData
}

export function useCustomMutation<TData, TPayload = any>({
  initialData,
  ...restProps
}: MutationOptions<TData, TPayload>) {
  const mutation = useMutation({
    ...restProps,
  })

  return {
    ...mutation,
    data: mutation.data || initialData,
  }
}
