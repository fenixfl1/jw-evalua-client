/**
 * Truncate text to a certain length and add ellipsis
 * @param text
 * @param length
 * @returns {string}
 * @Example
 * truncateText('Hello World', 5) // returns 'Hello...'
 */
export function truncateText(text: string, length: number): string {
  if (text?.length > length) {
    return text.substring(0, length) + '...'
  }
  return text
}
