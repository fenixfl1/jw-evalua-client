/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RouteObject } from 'react-router'
import type { PageMetadata } from 'src/types/general'
import React from 'react'

// Importa módulos de página y metadata
const pageModules = import.meta.glob('../pages/**/page.tsx', { eager: true })
const metadataModules = import.meta.glob('../pages/**/page.meta.ts', {
  eager: true,
})
const templates = import.meta.glob('../pages/**/template.tsx', {
  eager: true,
})

function getPathFromFile(filePath: string): string {
  const cleanPath = filePath.replace('../pages', '').replace(/page\.tsx$/, '')
  const segments = cleanPath.split('/').filter(Boolean)
  return segments
    .map((segment) => {
      if (segment.startsWith('[') && segment.endsWith(']')) {
        const param = segment.slice(1, -1)
        return param.startsWith('...') ? '*' : `:${param}`
      }
      return segment
    })
    .join('/')
}

function getMetadata(path: string): PageMetadata {
  const metaPath = path.replace('page.tsx', 'page.meta.ts')
  const mod: any = metadataModules[metaPath]
  return (mod?.default || {}) as PageMetadata
}

function getTemplatesForPath(filePath: string): React.ComponentType[] {
  const pathSegments = filePath
    .replace('../pages', '')
    .split('/')
    .filter(Boolean)

  const collectedTemplates: React.ComponentType[] = []

  // Root template
  const rootTemplate: any = templates['../pages/template.tsx']
  if (rootTemplate?.default) {
    collectedTemplates.push(rootTemplate.default)
  }

  for (let i = 1; i <= pathSegments.length; i++) {
    const currentPath =
      '../pages/' + pathSegments.slice(0, i).join('/') + '/template.tsx'
    const mod: any = templates[currentPath]
    if (mod?.default) collectedTemplates.push(mod.default)
  }

  return collectedTemplates
}

function wrapWithTemplates<T = any>(
  Component: React.ComponentType<T>,
  templates: React.ComponentType[]
) {
  return templates.reduceRight(
    (Acc, Template: any) => (props: T) =>
      (
        <Template>
          <Acc {...props} />
        </Template>
      ),
    Component
  )
}

// Exportamos rutas públicas y privadas por separado
export const publicRoutes: RouteObject[] = []
export const privateRoutes: RouteObject[] = []

Object.entries(pageModules).forEach(([path, mod]: any) => {
  const metadata = getMetadata(path)
  const routePath = metadata.path || getPathFromFile(path)
  const PageComponent = mod.default

  const WrappedComponent = wrapWithTemplates(
    PageComponent,
    getTemplatesForPath(path)
  )

  const route: RouteObject = {
    path: routePath,
    element: <WrappedComponent />,
    loader: metadata.loader,
  }

  if (metadata.public) {
    publicRoutes.push(route)
  } else {
    privateRoutes.push(route)
  }
})
