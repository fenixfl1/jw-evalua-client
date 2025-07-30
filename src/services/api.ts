import axios, { AxiosError } from 'axios'
import { BASE_API_PATH } from 'src/constants/routes'
import { getSessionToken } from 'src/lib/session'
import { Metadata } from 'src/types/general'

export interface ApiResponse<T> {
  data: T
  metadata: Metadata
  message: string
  error?: AxiosError
}

export const api = axios.create({
  baseURL: BASE_API_PATH,
  headers: {
    'Content-Type': 'application/json',
    Authorization: getSessionToken(),
  },
})

export const postRequest = async <T, TData = unknown>(
  url: string,
  data: TData
): Promise<ApiResponse<T>> => {
  return api.post(url, data)
}

export const putRequest = async <T, TData = unknown>(
  url: string,
  data: TData
): Promise<ApiResponse<T>> => {
  return api.put(url, data)
}

export const getRequest = async <T>(url: string): Promise<ApiResponse<T>> => {
  return api.get(url)
}

type QueryParams = Record<string, string | number | boolean | null | undefined>

export function buildQueryString(
  baseUrl: string,
  ...params: (QueryParams | undefined | null)[]
): string {
  const query = params
    .filter(Boolean)
    .flatMap((obj) =>
      Object.entries(obj!).flatMap(([key, value]) =>
        Array.isArray(value) ? value.map((v) => [key, v]) : [[key, value]]
      )
    )
    .filter(([, value]) => value !== undefined && value !== null)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&')

  return query ? `${baseUrl}?${query}` : baseUrl
}

export function getQueryString(
  baseUrl: string,
  params: Record<string, unknown> = {}
): string {
  const values: string[] = []
  Object.entries(params).forEach(([key, value]) => {
    values.push(
      `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
  })

  const query = values.join('&')

  return query ? `${baseUrl}?${query}` : baseUrl
}
