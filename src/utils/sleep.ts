/**
 * This function sleep the execution of the code for a certain time
 * @param {number} millisecond the time to sleep the execution
 * @returns Promise
 */
const sleep = (millisecond: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, millisecond))

export default sleep
