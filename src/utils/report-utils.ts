/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import autoTable, { CellInput, RowInput } from 'jspdf-autotable'
import { getBusinessInfo, getSessionInfo } from 'src/lib/session'
import formatter from './formatter'
import moment from 'moment'
import { Business } from 'src/services/users/users.types'
import { isValidDate } from './date-utils'
import { ColumnsMap, GroupCol } from 'src/components/custom/CustomTable'

export interface ExportProps<T> {
  data: T[]
  filename?: string
  showHead?: boolean | 'firstPage' | 'everyPage' | 'never'
  ref?: React.RefObject<HTMLTableElement>
  columnsMap?: Record<string, string>
  orientation?: 'portrait' | 'landscape'
  title?: string
  businessInfo?: Business
  groupLayout?: 'horizontal' | 'vertical'
}

export const detectFormat = (value: any): string | undefined => {
  if (
    typeof value === 'string' &&
    /\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/.test(value)
  ) {
    return 'dd/mm/yyyy hh:mm'
  }
  if (typeof value === 'string') {
    const hasCommas = /,/.test(value)
    const numericValue = parseFloat(value.replace(/,/g, ''))
    if (!isNaN(numericValue)) {
      if (!hasCommas && Number.isInteger(numericValue)) return '0'
      if (!hasCommas) return '#,##0'
      return '#,##0.00'
    }
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? '0' : '#,##0'
  }
  return undefined
}

/**
 * This function takes a json object and returns a promise that resolves to a blob object containing the excel file.
 * @param data - The json object to convert to excel file.
 * @param filename - The name of the excel file. (default: file)
 */
export async function exportToExcel<T = any>({
  data = [],
  filename = 'reporte',
  columnsMap = {},
}: // title = 'Reporte',
// showHead = true,
ExportProps<T>): Promise<void> {
  if (data.length === 0) {
    return
  }

  // Filtrar solo las columnas definidas en columnsMap
  const keys = Object.keys(columnsMap)
  // const headers = Object.values(columnsMap)

  // Transformar los datos según columnsMap
  const formattedData = data.map((row) => {
    const newRow: Record<string, any> = {}
    keys.forEach((key) => {
      let value = row[key as never] as string

      // Si es una fecha ISO, formatearla
      if (
        typeof value === 'string' &&
        value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      ) {
        value = new Date(value).toLocaleDateString()
      }

      newRow[columnsMap[key]] = value
    })
    return newRow
  })

  // Crear la hoja de cálculo con los datos transformados
  const worksheet = XLSX.utils.json_to_sheet(formattedData)

  // Ajustar ancho de columnas
  const colWidths = keys.map((key) => ({
    wch: Math.max(columnsMap[key]?.length || 10, 15),
  }))

  worksheet['!cols'] = colWidths

  // Crear el libro de trabajo y agregar la hoja
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte')

  // Escribir el archivo Excel
  const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheet.sheet',
  })

  // Guardar el archivo
  saveAs(blob, `${filename}.xlsx`)
}

const s = (v: unknown) => (v == null ? '' : String(v))
const safeFormatDate = (v: any) =>
  typeof isValidDate === 'function' && isValidDate(v)
    ? s(formatter({ value: v, format: 'long_date' }))
    : s(v)

function cellText(v: any): string {
  if (v == null) return 'N/A'
  if (Array.isArray(v))
    return v
      .map((x) => (x && typeof x === 'object' ? JSON.stringify(x) : s(x)))
      .join(', ')
  if (typeof v === 'object') return JSON.stringify(v)
  return safeFormatDate(v)
}

const capitalize = (txt: string) =>
  (txt ?? '').replace(/\b\p{L}/gu, (c) => c.toUpperCase())

function getGroupMaxItems<T>(data: T[], key: string): number {
  let max = 0
  for (const row of data as any[]) {
    const arr = row?.[key]
    if (Array.isArray(arr)) max = Math.max(max, arr.length)
  }
  return max
}

/* ====== BUILDER HORIZONTAL (subcolumnas) ====== */
function buildHeadAndBodyHorizontal<T>(data: T[], columnsMap: ColumnsMap) {
  const top: CellInput[] = []
  const bottom: CellInput[] = []
  type FinalCol = { accessor: (row: any) => any }
  const cols: FinalCol[] = []

  for (const [key, def] of Object.entries(columnsMap)) {
    if (typeof def === 'string') {
      top.push({ content: def, rowSpan: 2 })
      cols.push({ accessor: (row) => row?.[key] })
      continue
    }
    const group = def as GroupCol
    const maxItems = Math.max(0, group.maxItems ?? getGroupMaxItems(data, key))
    const children = group.children ?? []
    const childCount = children.length * maxItems
    if (childCount === 0) {
      top.push({ content: group.header, rowSpan: 2 })
      cols.push({ accessor: () => '' })
      continue
    }
    top.push({ content: group.header, colSpan: childCount })
    for (let i = 0; i < maxItems; i++) {
      for (const child of children) {
        bottom.push({ content: `#${i + 1} ${child.header}` })
        cols.push({
          accessor: (row: any) => {
            const arr = row?.[key]
            if (!Array.isArray(arr)) return ''
            const item = arr[i]
            return item ? item?.[child.key] ?? '' : ''
          },
        })
      }
    }
  }

  const head: RowInput[] = [top]
  if (bottom.length) head.push(bottom)

  const body: RowInput[] = (data as any[]).map((row) =>
    cols.map((c) => cellText(c.accessor(row)))
  )
  return { head, body }
}

/* ====== BUILDER VERTICAL (una fila por item del array) ====== */
function buildHeadAndBodyVertical<T>(data: T[], columnsMap: ColumnsMap) {
  // Encabezado: una sola fila con las columnas simples + los hijos del grupo (sin #1/#2)
  const headRow: CellInput[] = []
  type SimpleKey = string
  type GroupSpec = { key: string; def: GroupCol }

  const simpleKeys: SimpleKey[] = []
  const groups: GroupSpec[] = []

  for (const [key, def] of Object.entries(columnsMap)) {
    if (typeof def === 'string') {
      headRow.push({ content: def })
      simpleKeys.push(key)
    } else {
      const g = def as GroupCol
      for (const child of g.children ?? []) {
        headRow.push({ content: `${g.header} - ${child.header}` })
      }
      groups.push({ key, def: g })
    }
  }

  // Construcción del body: por cada row, tantas filas como items en el primer grupo (o 1 si vacío).
  const body: RowInput[] = []
  for (const row of data as any[]) {
    // cuántas filas debemos producir para este registro
    const lenPerGroup = groups.map((g) =>
      Array.isArray(row?.[g.key]) ? (row[g.key] as any[]).length : 0
    )
    const maxLen = Math.max(1, ...lenPerGroup) // al menos 1
    for (let i = 0; i < maxLen; i++) {
      const cells: CellInput[] = []

      // columnas simples con rowSpan en la primera fila del bloque
      for (const k of simpleKeys) {
        const content = cellText(row?.[k])
        if (i === 0 && maxLen > 1) cells.push({ content, rowSpan: maxLen })
        else if (maxLen === 1) cells.push({ content })
        // si i>0 y maxLen>1, no empujes nada: autotable rellenará por rowSpan
      }

      // columnas del/los grupos para el índice i
      for (const g of groups) {
        const arr = Array.isArray(row?.[g.key]) ? (row[g.key] as any[]) : []
        const item = arr[i]
        for (const child of g.def.children ?? []) {
          const value = item ? item?.[child.key] : ''
          cells.push(cellText(value))
        }
      }
      if (cells.length) body.push(cells)
    }
  }

  // Nota: en vertical usamos un único nivel de head.
  const head: RowInput[] = [headRow]
  return { head, body }
}

/* ====== FUNCIÓN PRINCIPAL ====== */
export async function exportToPDF<T = any>({
  data = [],
  filename = 'reporte.pdf',
  columnsMap,
  orientation = 'portrait',
  title = 'Reporte',
  showHead = 'everyPage',
  groupLayout = 'vertical',
}: ExportProps<T>): Promise<void> {
  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' })

  const currentDate = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  const businessInfo = getBusinessInfo()

  // Título
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  const titleText = capitalize(title ?? 'Reporte')
  const titleWidth = doc.getTextWidth(titleText)
  doc.text(titleText, (pageWidth - titleWidth) / 2, 20)

  // Encabezado empresa + fecha/usuario
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const rnc =
    businessInfo?.RNC != null && typeof formatter === 'function'
      ? s(formatter({ value: businessInfo.RNC, format: 'document' }))
      : ''
  const phone =
    businessInfo?.PHONE != null && typeof formatter === 'function'
      ? s(formatter({ value: businessInfo.PHONE, format: 'phone' }))
      : ''
  let y = 30
  const addLine = (t: string) => {
    if (t) {
      doc.text(t, 10, y)
      y += 5
    }
  }
  addLine(s(businessInfo?.NAME))
  addLine(businessInfo?.ADDRESS ? `Dirección: ${s(businessInfo.ADDRESS)}` : '')
  addLine(rnc ? `RNC: ${rnc}` : '')
  addLine(phone ? `Teléfono: ${phone}` : '')
  doc.text(`Fecha: ${currentDate}`, pageWidth - 55, 35)
  if (typeof moment === 'function')
    doc.text(`Hora: ${moment().format('h:mm:ss A')}`, pageWidth - 53, 40)
  if (typeof getSessionInfo === 'function') {
    const u = getSessionInfo()
    if (u?.username) doc.text(`Usuario: ${u.username}`, pageWidth - 53, 45)
  }

  // Separador
  doc.setDrawColor(0)
  doc.setLineWidth(0.2)
  doc.line(10, 50, pageWidth - 10, 50)

  if (!data || data.length === 0) {
    doc.text('No hay datos disponibles', 14, 25)
    doc.save(filename)
    return
  }

  // Construcción de tabla según layout
  let head: RowInput[] = []
  let body: RowInput[] = []
  const hasGrouped =
    !!columnsMap && Object.values(columnsMap).some((v) => typeof v !== 'string')

  if (columnsMap && hasGrouped) {
    if (groupLayout === 'vertical') {
      ;({ head, body } = buildHeadAndBodyVertical(data, columnsMap))
    } else {
      ;({ head, body } = buildHeadAndBodyHorizontal(data, columnsMap))
    }
  } else {
    // Modo simple
    const headers: string[] = columnsMap
      ? (Object.values(columnsMap) as string[])
      : Object.keys((data?.[0] ?? {}) as Record<string, unknown>).map((k) =>
          k.toUpperCase()
        )

    const keys = columnsMap
      ? Object.keys(columnsMap)
      : Object.keys(data[0] as Record<string, unknown>)

    head = [headers]
    body = (data as any[]).map((row) => keys.map((k) => cellText(row?.[k])))
  }

  // Normaliza showHead
  const normalizedShowHead: 'firstPage' | 'everyPage' | 'never' =
    typeof showHead === 'boolean'
      ? showHead
        ? 'everyPage'
        : 'never'
      : showHead ?? 'everyPage'

  autoTable(doc, {
    head,
    body,
    startY: 55,
    styles: { fontSize: 8, cellPadding: 2 },
    margin: { left: 10, right: 10 },
    theme: 'striped',
    showHead: normalizedShowHead as any,
    didDrawPage: (hook) => {
      const pageCurrent = hook.pageNumber
      doc.setFontSize(8)
      doc.text(`Página ${pageCurrent}`, pageWidth - 20, pageHeight - 10)
    },
  })

  doc.save(filename)
}

export async function exportToCSV<T = any>({
  data = [],
  filename = 'reporte',
  columnsMap = {},
  showHead = true,
}: ExportProps<T>) {
  if (data.length === 0) {
    // eslint-disable-next-line no-console
    console.warn('No hay datos para exportar.')
    return
  }

  // Obtener solo las claves definidas en columnsMap
  const keys = Object.keys(columnsMap)
  const headers = Object.values(columnsMap)

  const rows = data.map((row) =>
    keys
      .map((key) => {
        let value = row[key as never] as string

        if (isValidDate(value)) {
          value = new Date(value).toLocaleDateString()
        }

        return `"${value ?? ''}"`
      })
      .join(',')
  )

  const csvContent = [showHead ? headers.join(',') : '', ...rows].join('\n')

  const blob = new Blob([`\ufeff${csvContent}`], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
