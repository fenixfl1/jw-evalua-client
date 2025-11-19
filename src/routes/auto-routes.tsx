/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RouteObject } from 'react-router'
import type { PageMetadata } from 'src/types/general'
import React from 'react'
import TitleSetter from 'src/components/TittleSetter'
import ConditionalComponent from 'src/components/ConditionalComponent'

type LayoutMeta = {
  titleTemplate?: string
}

// Importa módulos de página y metadata
const pageModules = import.meta.glob(
  ['../pages/**/page.tsx', '!../pages/**/components/**'],
  { eager: true }
)
const metadataModules = import.meta.glob('../pages/**/page.meta.ts', {
  eager: true,
})
const templates = import.meta.glob('../pages/**/template.tsx', {
  eager: true,
})
const layoutModules = import.meta.glob('../pages/**/layout.tsx', {
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

export function getNearestLayoutFromPath(filePath: string): {
  Component: React.ComponentType | null
  path: string | null
  meta?: LayoutMeta
} {
  const segments = filePath.replace('../pages', '').split('/').filter(Boolean)

  const dirSegments = segments[segments.length - 1]
    ?.toLowerCase()
    .startsWith('page')
    ? segments.slice(0, -1)
    : segments

  for (let i = dirSegments.length; i >= 0; i--) {
    const partial = dirSegments.slice(0, i).join('/')
    const candidate =
      '../pages' + (partial ? '/' + partial : '') + '/layout.tsx'
    const mod: any = layoutModules[candidate]
    if (mod?.default) {
      const meta: LayoutMeta | undefined = mod?.layoutMeta
      return {
        Component: mod.default as React.ComponentType,
        path: candidate,
        meta,
      }
    }
  }

  return { Component: null, path: null, meta: null }
}

function getTemplatesForPath(
  filePath: string,
  opts?: { includeRoot?: boolean }
): React.ComponentType[] {
  const includeRoot = opts?.includeRoot ?? true

  const pathSegments = filePath
    .replace('../pages', '')
    .split('/')
    .filter(Boolean)

  const collectedTemplates: React.ComponentType[] = []

  if (includeRoot) {
    const rootTemplate: any = templates['../pages/template.tsx']
    if (rootTemplate?.default) {
      collectedTemplates.push(rootTemplate.default)
    }
  }

  const dirSegments = pathSegments[pathSegments.length - 1]
    ?.toLowerCase()
    .startsWith('page')
    ? pathSegments.slice(0, -1)
    : pathSegments

  for (let i = 1; i <= dirSegments.length; i++) {
    const currentPath =
      '../pages/' + pathSegments.slice(0, i).join('/') + '/template.tsx'
    const mod: any = templates[currentPath]
    if (mod?.default) {
      collectedTemplates.push(mod.default)
    }
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
export const operatorRoutes: RouteObject[] = []

Object.entries(pageModules).forEach(([path, mod]: any) => {
  const metadata = getMetadata(path)
  const routePath = metadata.path || getPathFromFile(path)
  const PageComponent = mod.default
  const isRoot = routePath === '/'
  const { scope = 0 } = metadata

  metadata.path = routePath

  const {
    Component: NearestLayout,
    path: layoutPath,
    meta: layoutMeta,
  } = getNearestLayoutFromPath(path) as any

  const isRootLayout = layoutPath === '../pages/layout.tsx'

  const includeRootTemplate = !NearestLayout || isRootLayout

  const WrappedWithTemplates = wrapWithTemplates(
    PageComponent,
    getTemplatesForPath(path, { includeRoot: includeRootTemplate })
  )

  const element = (
    <>
      <TitleSetter
        title={metadata.title}
        template={layoutMeta?.titleTemplate}
      />
      <ConditionalComponent
        condition={!!NearestLayout}
        fallback={<WrappedWithTemplates />}
      >
        <NearestLayout>
          <WrappedWithTemplates />
        </NearestLayout>
      </ConditionalComponent>
    </>
  )

  const route: RouteObject = {
    ...metadata,
    ...(isRoot ? { index: true } : { path: routePath }),
    element,
  }

  if ([0, 1, 2].includes(scope)) {
    if (metadata.public) {
      publicRoutes.push(route)
    } else {
      privateRoutes.push(route)
    }
  } else {
    operatorRoutes.push(route)
  }
})
