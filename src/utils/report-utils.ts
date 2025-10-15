/* eslint-disable @typescript-eslint/no-explicit-any */

import jsPDF from 'jspdf'
import autoTable, { CellInput, RowInput } from 'jspdf-autotable'
import moment from 'moment'
import { saveAs } from 'file-saver'
import Mustache from 'mustache'
import DOMPurify from 'dompurify'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'
import {
  ColumnMapValue,
  ColumnRender,
  ColumnRenderContext,
  ColumnsMap,
  GroupCol,
  GroupColumnChild,
  SimpleColumn,
} from 'src/components/custom/CustomTable'
import { Business } from 'src/services/users/users.types'
import { getBusinessInfo, getSessionInfo } from 'src/lib/session'
import formatter from './formatter'
import { isValidDate } from './date-utils'

type AnyRecord = Record<string, unknown>

export interface ExportProps<T> {
  data: T[]
  filename?: string
  showHead?: boolean | 'firstPage' | 'everyPage' | 'never'
  ref?: React.RefObject<HTMLTableElement>
  columnsMap?: ColumnsMap<T>
  orientation?: 'portrait' | 'landscape'
  title?: string
  businessInfo?: Business
  groupLayout?: 'horizontal' | 'vertical'
  extraHeaderHtml?: string
}

export const detectFormat = (value: any): string | undefined => {
  if (
    typeof value === 'string' &&
    /\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/.test(value)
  ) {
    return 'dd/mm/yyyy hh:mm'
  }

  if (typeof value === 'string') {
    const sanitized = value.replace(/,/g, '')
    const numeric = Number.parseFloat(sanitized)
    if (!Number.isNaN(numeric)) {
      if (!value.includes(',')) {
        return Number.isInteger(numeric) ? '0' : '#,##0.00'
      }
      return '#,##0.00'
    }
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? '0' : '#,##0.00'
  }

  return undefined
}

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/

interface NormalizeOptions {
  skipDateFormat?: boolean
  asText?: boolean
}

const isGroupColumn = <T>(value: ColumnMapValue<T>): value is GroupCol<T> =>
  typeof value === 'object' && value !== null && 'children' in value

const isSimpleColumnObject = <T>(
  value: ColumnMapValue<T>
): value is SimpleColumn<T> =>
  typeof value === 'object' && value !== null && !isGroupColumn(value)

const getSimpleHeader = <T>(
  definition: ColumnMapValue<T>,
  fallback: string
): string => {
  if (typeof definition === 'string') {
    return definition
  }
  return definition?.header ?? fallback
}

const joinArrayValues = (value: unknown[]): string =>
  value
    .map((item) => (item == null ? '' : String(item)))
    .filter(Boolean)
    .join(', ')

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'

const htmlToPlainTextLines = (html?: string): string[] => {
  if (!html) return []
  if (isBrowser) {
    const container = document.createElement('div')
    container.innerHTML = html
    const text = container.innerText || container.textContent || ''
    container.replaceChildren()
    return text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
  }

  const sanitized = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')

  const decoded = sanitized
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')

  return decoded
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

const normalizeValue = (
  value: unknown,
  { skipDateFormat = false, asText = false }: NormalizeOptions = {}
): unknown => {
  if (value == null) {
    return asText ? '' : ''
  }

  if (
    !skipDateFormat &&
    typeof value === 'string' &&
    ISO_DATE_REGEX.test(value)
  ) {
    try {
      return new Date(value).toLocaleDateString()
    } catch {
      return value
    }
  }

  if (Array.isArray(value)) {
    return joinArrayValues(value)
  }

  if (value instanceof Date) {
    return asText ? value.toLocaleString() : value
  }

  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }

  if (asText && typeof value !== 'string') {
    return String(value)
  }

  return value
}

const applyRender = <T>(
  render: ColumnRender<T> | undefined,
  rawValue: unknown,
  record: T,
  context: ColumnRenderContext
) => {
  if (!render) return rawValue
  try {
    return render(rawValue, record, context)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Error applying render:', error)
    return rawValue
  }
}

const resolveValue = <T>(
  rawValue: unknown,
  record: T,
  render: ColumnRender<T> | undefined,
  context: ColumnRenderContext,
  options?: NormalizeOptions
): unknown => {
  const rendered = applyRender(render, rawValue, record, context)
  const skipDateFormat = options?.skipDateFormat ?? Boolean(render)
  const asText = options?.asText ?? false
  return normalizeValue(rendered, { skipDateFormat, asText })
}

interface FlattenedColumn<T> {
  header: string
  dataIndex: string
  accessor: (row: T) => unknown
}

const getGroupMaxItems = <T>(data: T[], key: string): number => {
  let max = 0
  for (const row of data as any[]) {
    const value = (row as AnyRecord)?.[key]
    if (Array.isArray(value)) {
      max = Math.max(max, value.length)
    }
  }
  return max
}

const createFlatColumns = <T>(
  data: T[],
  columnsMap?: ColumnsMap<T>
): FlattenedColumn<T>[] => {
  if (!columnsMap || !Object.keys(columnsMap).length) {
    const sample = (data?.[0] ?? {}) as AnyRecord
    return Object.keys(sample).map((key) => ({
      header: key.toUpperCase(),
      dataIndex: key,
      accessor: (row: T) => (row as AnyRecord)?.[key],
    }))
  }

  const flat: FlattenedColumn<T>[] = []

  Object.entries(columnsMap).forEach(([key, definition]) => {
    if (isGroupColumn(definition)) {
      const maxItems = Math.max(
        0,
        definition.maxItems ?? getGroupMaxItems(data, key)
      )
      const children = definition.children ?? []

      if (!children.length) {
        flat.push({
          header: definition.header,
          dataIndex: key,
          accessor: () => '',
        })
        return
      }

      const effectiveMax = Math.max(1, maxItems)

      for (let index = 0; index < effectiveMax; index++) {
        children.forEach((child) => {
          const header = `${definition.header} #${index + 1} ${
            child.header
          }`.trim()
          flat.push({
            header,
            dataIndex: `${key}.${child.key}.${index}`,
            accessor: (row: T) => {
              const source = (row as AnyRecord)?.[key]
              if (!Array.isArray(source)) return ''
              const item = source[index] as AnyRecord | undefined
              const raw = item ? item[child.key] : undefined
              return resolveValue(
                raw,
                row,
                child.render,
                {
                  dataIndex: `${key}.${child.key}`,
                  groupKey: key,
                  index,
                  item,
                },
                { asText: false }
              )
            },
          })
        })
      }

      return
    }

    const header = getSimpleHeader(definition, key)
    const render = isSimpleColumnObject(definition)
      ? definition.render
      : undefined

    flat.push({
      header,
      dataIndex: key,
      accessor: (row: T) =>
        resolveValue(
          (row as AnyRecord)?.[key],
          row,
          render,
          { dataIndex: key },
          { asText: false }
        ),
    })
  })

  return flat
}

const cellText = (value: unknown): string => {
  if (value == null) return 'N/A'
  if (Array.isArray(value)) return joinArrayValues(value)
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  if (typeof value === 'string' && isValidDate(value)) {
    return new Date(value).toLocaleDateString()
  }
  return String(value)
}

const buildHeadAndBodyHorizontal = <T>(
  data: T[],
  columnsMap: ColumnsMap<T>
) => {
  const headTop: CellInput[] = []
  const headBottom: CellInput[] = []
  const accessors: Array<(row: T) => unknown> = []

  Object.entries(columnsMap).forEach(([key, definition]) => {
    if (isGroupColumn(definition)) {
      const maxItems = Math.max(
        0,
        definition.maxItems ?? getGroupMaxItems(data, key)
      )
      const children = definition.children ?? []

      if (!children.length) {
        headTop.push({ content: definition.header, rowSpan: 2 })
        accessors.push(() => '')
        return
      }

      const effectiveMax = Math.max(1, maxItems)
      headTop.push({
        content: definition.header,
        colSpan: children.length * effectiveMax,
      })

      for (let index = 0; index < effectiveMax; index++) {
        children.forEach((child) => {
          headBottom.push({ content: `#${index + 1} ${child.header}` })
          accessors.push((row: T) => {
            const source = (row as AnyRecord)?.[key]
            if (!Array.isArray(source)) return ''
            const item = source[index] as AnyRecord | undefined
            const raw = item ? item[child.key] : undefined
            return resolveValue(
              raw,
              row,
              child.render,
              {
                dataIndex: `${key}.${child.key}`,
                groupKey: key,
                index,
                item,
              },
              { asText: false }
            )
          })
        })
      }
    } else {
      const header = getSimpleHeader(definition, key)
      const render = isSimpleColumnObject(definition)
        ? definition.render
        : undefined

      headTop.push({ content: header, rowSpan: headBottom.length ? 2 : 1 })
      accessors.push((row: T) =>
        resolveValue(
          (row as AnyRecord)?.[key],
          row,
          render,
          { dataIndex: key },
          { asText: false }
        )
      )
    }
  })

  const head: RowInput[] = [headTop]
  if (headBottom.length) head.push(headBottom)

  const body: RowInput[] = (data as any[]).map((row) =>
    accessors.map((accessor) => cellText(accessor(row)))
  )

  return { head, body }
}

const buildHeadAndBodyVertical = <T>(data: T[], columnsMap: ColumnsMap<T>) => {
  const headRow: CellInput[] = []
  const simpleAccessors: Array<(row: T) => unknown> = []
  const groups: Array<{
    key: string
    def: GroupCol<T>
    children: GroupColumnChild<T>[]
  }> = []

  Object.entries(columnsMap).forEach(([key, definition]) => {
    if (isGroupColumn(definition)) {
      const children = definition.children ?? []
      groups.push({ key, def: definition, children })
      children.forEach((child) => {
        headRow.push({ content: `${definition.header} - ${child.header}` })
      })
      return
    }

    const header = getSimpleHeader(definition, key)
    const render = isSimpleColumnObject(definition)
      ? definition.render
      : undefined

    headRow.push({ content: header })
    simpleAccessors.push((row: T) =>
      resolveValue(
        (row as AnyRecord)?.[key],
        row,
        render,
        { dataIndex: key },
        { asText: false }
      )
    )
  })

  const body: RowInput[] = []

  for (const row of data as any[]) {
    const lengths = groups.map(({ key }) => {
      const value = (row as AnyRecord)?.[key]
      return Array.isArray(value) ? value.length : 0
    })
    const maxRows = Math.max(1, ...lengths)

    for (let index = 0; index < maxRows; index++) {
      const cells: CellInput[] = []

      simpleAccessors.forEach((accessor) => {
        cells.push(cellText(accessor(row)))
      })

      groups.forEach(({ key, children }) => {
        const source = (row as AnyRecord)?.[key]
        const item = Array.isArray(source)
          ? (source[index] as AnyRecord | undefined)
          : undefined

        children.forEach((child) => {
          const raw = item ? item[child.key] : undefined
          const resolved = resolveValue(
            raw,
            row,
            child.render,
            {
              dataIndex: `${key}.${child.key}`,
              groupKey: key,
              index,
              item,
            },
            { asText: false }
          )
          cells.push(cellText(resolved))
        })
      })

      if (cells.length) {
        body.push(cells)
      }
    }
  }

  return { head: [headRow], body }
}

export const formatCsvValue = (value: unknown): string => {
  const normalized = normalizeValue(value, { asText: true })
  const text = normalized == null ? '' : String(normalized)
  return text.replace(/"/g, '""')
}

export async function exportToExcel<T = any>({
  data = [],
  filename = 'reporte',
  columnsMap,
  showHead = true,
  extraHeaderHtml,
}: ExportProps<T>): Promise<void> {
  if (!data.length) {
    // eslint-disable-next-line no-console
    console.warn('No hay datos para exportar.')
    return
  }

  const columns = createFlatColumns(data, columnsMap)
  const headerRow = columns.map((column) => column.header)
  const dataRows = (data as any[]).map((row) =>
    columns.map((column) => cellText(column.accessor(row)))
  )

  const includeHead = showHead !== false && showHead !== 'never'
  let aoa: string[][] = includeHead ? [headerRow, ...dataRows] : [...dataRows]

  const headerLines = htmlToPlainTextLines(extraHeaderHtml)
  if (headerLines.length) {
    aoa = [...headerLines.map((line) => [line]), [''], ...aoa]
  }

  const worksheet = XLSX.utils.aoa_to_sheet(aoa)
  const workbook = XLSX.utils.book_new()

  if (columns.length) {
    worksheet['!cols'] = columns.map((column) => ({
      wch: Math.max(column.header.length, 12),
    }))
  }

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte')

  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  const target = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`
  saveAs(blob, target)
}

const formatLongDate = (value: Date): string => {
  try {
    return String(formatter({ value: String(value), format: 'date' }))
  } catch {
    return value.toLocaleDateString()
  }
}

type ShowHeadOption = 'firstPage' | 'everyPage' | 'never'

const normalizeShowHead = (
  showHead?: boolean | ShowHeadOption
): ShowHeadOption => {
  if (typeof showHead === 'boolean') {
    return showHead ? 'everyPage' : 'never'
  }
  return showHead ?? 'everyPage'
}

export async function exportToPDF<T = any>({
  data = [],
  filename = 'reporte.pdf',
  columnsMap,
  showHead = true,
  orientation = 'portrait',
  title = 'Reporte',
  businessInfo,
  groupLayout = 'horizontal',
  extraHeaderHtml,
}: ExportProps<T>) {
  if (!data.length) {
    // eslint-disable-next-line no-console
    console.warn('No hay datos para exportar.')
    return
  }

  const doc = new jsPDF({ orientation })
  const info =
    businessInfo ??
    (typeof getBusinessInfo === 'function' ? getBusinessInfo() : undefined)
  const session =
    typeof getSessionInfo === 'function' ? getSessionInfo() : undefined

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  doc.setFontSize(18)
  doc.text(title, pageWidth / 2, 20, { align: 'center' })

  doc.setFontSize(10)
  let y = 30
  const addLine = (text?: string) => {
    if (!text) return
    doc.text(text, 10, y)
    y += 5
  }

  const rnc = formatter({ value: info.RNC, format: 'document' })
  const phone = formatter({ value: info.PHONE, format: 'phone' })

  addLine(info?.NAME)
  addLine(info?.ADDRESS ? `Dirección: ${info.ADDRESS}` : undefined)
  addLine(info?.RNC ? `RNC: ${rnc}` : undefined)
  addLine(info?.PHONE ? `Teléfono: ${phone}` : undefined)

  const now = new Date()
  doc.text(`Fecha: ${formatLongDate(now)}`, pageWidth - 10, 30, {
    align: 'right',
  })
  doc.text(`Hora: ${moment().format('h:mm:ss A')}`, pageWidth - 10, 35, {
    align: 'right',
  })
  if (session?.username) {
    doc.text(`Usuario: ${session.username}`, pageWidth - 10, 40, {
      align: 'right',
    })
  }

  doc.setDrawColor(0)
  doc.setLineWidth(0.2)
  doc.line(10, 50, pageWidth - 10, 50)

  let tableStartY = 55

  if (extraHeaderHtml) {
    if (isBrowser) {
      const container = document.createElement('div')
      container.style.position = 'fixed'
      container.style.left = '-10000px'
      container.style.top = '0'
      container.style.width = '800px'
      const rendered = Mustache.render(extraHeaderHtml, {
        title: title ?? 'Reporte',
        date: moment().format('DD/MM/YYYY'),
        time: moment().format('h:mm:ss A'),
        data: { ...(session ?? {}), ...(info ?? {}) },
      })

      container.innerHTML = DOMPurify.sanitize(rendered)
      document.body.appendChild(container)

      try {
        const canvas = await html2canvas(container as HTMLElement, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
        })

        const image = canvas.toDataURL('image/png')
        const imageProps = doc.getImageProperties(image)
        const pdfWidth = pageWidth - 20
        const pdfHeight = (imageProps.height * pdfWidth) / imageProps.width

        doc.addImage(image, 'PNG', 10, tableStartY, pdfWidth, pdfHeight)
        tableStartY += pdfHeight + 5
      } finally {
        document.body.removeChild(container)
      }
    } else {
      const lines = htmlToPlainTextLines(extraHeaderHtml)
      lines.forEach((line) => {
        const wrapped = doc.splitTextToSize(line, pageWidth - 20)
        wrapped.forEach((segment) => {
          doc.text(segment, 10, tableStartY)
          tableStartY += 5
        })
      })
      if (lines.length) {
        tableStartY += 5
      }
    }
  }

  let head: RowInput[] = []
  let body: RowInput[] = []

  const hasGrouped =
    !!columnsMap &&
    Object.values(columnsMap).some((value) =>
      isGroupColumn(value as ColumnMapValue<any>)
    )

  if (columnsMap && hasGrouped) {
    if (groupLayout === 'vertical') {
      ;({ head, body } = buildHeadAndBodyVertical(data, columnsMap))
    } else {
      ;({ head, body } = buildHeadAndBodyHorizontal(data, columnsMap))
    }
  } else {
    const columns = createFlatColumns(data, columnsMap)
    head = [columns.map((column) => column.header)]
    body = (data as any[]).map((row) =>
      columns.map((column) => cellText(column.accessor(row)))
    )
  }

  const normalizedShowHead = normalizeShowHead(showHead)

  autoTable(doc, {
    head,
    body,
    startY: tableStartY,
    styles: { fontSize: 8, cellPadding: 2 },
    margin: { left: 10, right: 10 },
    theme: 'striped',
    showHead: normalizedShowHead as any,
    didDrawPage: (context) => {
      doc.setFontSize(8)
      doc.text(`Página ${context.pageNumber}`, pageWidth - 20, pageHeight - 10)
    },
  })

  const target = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
  doc.save(target)
}

export async function exportToCSV<T = any>({
  data = [],
  filename = 'reporte',
  columnsMap,
  showHead = true,
  extraHeaderHtml,
}: ExportProps<T>) {
  if (!data.length) {
    // eslint-disable-next-line no-console
    console.warn('No hay datos para exportar.')
    return
  }

  const columns = createFlatColumns(data, columnsMap)
  const headers = columns.map((column) => column.header)
  const rows = data.map((row) =>
    columns
      .map((column) => `"${formatCsvValue(column.accessor(row))}"`)
      .join(',')
  )

  const headerLines = htmlToPlainTextLines(extraHeaderHtml)
  const contentLines: string[] = []

  if (headerLines.length) {
    headerLines.forEach((line) => {
      contentLines.push(`"${line.replace(/"/g, '""')}"`)
    })
    contentLines.push('')
  }

  if (showHead) {
    contentLines.push(headers.join(','))
  }

  contentLines.push(...rows)

  const content = contentLines.filter(Boolean).join('\n')

  const blob = new Blob(['\ufeff' + content], {
    type: 'text/csv;charset=utf-8;',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute(
    'download',
    filename.endsWith('.csv') ? filename : `${filename}.csv`
  )
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
