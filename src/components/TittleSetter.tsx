import React, { useEffect, useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'

type TitleResolverCtx = {
  params: Record<string, string>
  search: URLSearchParams
  data?: unknown
}

function applyTemplate(title: string, template?: string) {
  if (!template) return title
  return template.replace('%s', title || '')
}

interface TitleSetterProps {
  title?: string | ((ctx: TitleResolverCtx) => string)
  template?: string
  data?: unknown
}

const TitleSetter: React.FC<TitleSetterProps> = ({ title, template, data }) => {
  const params = useParams()
  const { search } = useLocation()
  const searchParams = React.useMemo(
    () => new URLSearchParams(search),
    [search]
  )

  const resolvedTitle = useMemo(() => {
    if (!title) return ''
    if (typeof title === 'function') {
      return title({
        params: params as Record<string, string>,
        search: searchParams,
        data,
      })
    }
    return title
  }, [title, params, searchParams, data])

  useEffect(() => {
    if (!resolvedTitle) return
    const prev = document.title
    document.title = applyTemplate(resolvedTitle, template)
    return () => {
      document.title = prev
    }
  }, [resolvedTitle, template])

  return null
}

export default TitleSetter
