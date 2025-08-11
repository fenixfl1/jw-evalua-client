/* eslint-disable @typescript-eslint/no-explicit-any */

export function getBase64<T = string>(file: any): Promise<T> {
  if (!file) return Promise.resolve('') as any

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file?.originFileObj as any)
    reader.onload = () => resolve(reader.result as never)
    reader.onerror = (error) => reject(error)
  })
}

export const base64ToBlob = (base64: string) => {
  const byteCharacters = atob(base64.split(',')[1])
  const byteNumbers = new Array(byteCharacters.length)

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }

  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: 'application/pdf' })
}

export const downloadDocument = (base64: string) => {
  const blob = base64ToBlob(base64)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'file.pdf'
  link.click()
  URL.revokeObjectURL(url)
}
