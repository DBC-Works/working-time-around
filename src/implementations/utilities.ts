/**
 * @file Utilities
 */
import dayjs, { Dayjs } from 'dayjs'

//
// Functions
//

/**
 * Get days in month
 * @param month Target month
 * @returns Array of Dayjs instance
 */
export function getDaysInMonth(month: Dayjs): Dayjs[] {
  return Array.from(Array(month.daysInMonth()), (_, i) =>
    dayjs(month).set('date', i + 1)
  )
}
