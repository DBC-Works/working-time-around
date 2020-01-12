/**
 * @file Records state types
 */
import dayjs from 'dayjs'

//
// Types
//

/**
 * Daily latest record
 */
export interface DailyLatestRecord {
  start: Date | null
  stop: Date | null
  memo: string
  breakTimeLengthMin: number | null
}

/**
 * Daily record
 */
export interface DailyRecord {
  starts: Date[]
  stops: Date[]
  memos: string[]
  breakTimeLengthsMin?: number[]
}

/**
 * Map of date and record
 */
export interface Records {
  [index: string]: DailyRecord
}

/**
 * Records state
 */
export interface RecordsState {
  records: Records
}

/**
 * 'Update break time length' action payload
 */
export interface UpdateBreakTimeActionPayload {
  date: Date
  breakTimeLengthMin: number
  targetIndex: number
}

//
// Constants
//

/**
 * Record key
 */
export const KEY_RECORD = 'YYYYMMDD'

//
// Helper functions
//

/**
 * Make record key
 * @param date Date to make key
 * @returns Record key
 */
export function makeRecordKey(date: Date): string {
  return dayjs(date).format(KEY_RECORD)
}
