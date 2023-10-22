/**
 * @file Utilities for component unit test
 */

import dayjs from 'dayjs'

import { DailyLatestRecord } from '../state/ducks/records/types'

/**
 * Calculate working time in minutes
 * @param record record
 * @returns working time in minutes
 */
export const calcWorkingTimeMin = (
  record: DailyLatestRecord
): number | null => {
  if (
    record.start == null ||
    record.stop == null ||
    record.breakTimeLengthMin == null
  ) {
    return null
  }
  return (
    dayjs(record.stop).diff(dayjs(record.start), 'minute') -
    (record.breakTimeLengthMin ?? 0)
  )
}
