/**
 * This function will capitalize the first letter of a string
 * @param {string} text
 */
function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export default capitalize
