/**
 * @file Records state selectors
 */
import dayjs from 'dayjs'

import {
  DailyRecord,
  DailyLatestRecord,
  makeRecordKey,
  Records,
  RecordsState,
} from './types'

//
// Functions
//

/**
 * Get latest start time of specified record
 * @param record Target record
 * @returns Start time(null if not exists)
 */
export function getLatestStartTimeOf(record: DailyRecord): Date | null {
  return 0 < record.starts.length
    ? record.starts[record.starts.length - 1]
    : null
}

/**
 * Get latest stop time of specified record
 * @param record Target record
 * @returns Stop time(null if not exists)
 */
export function getLatestStopTimeOf(record: DailyRecord): Date | null {
  return 0 < record.stops.length ? record.stops[record.stops.length - 1] : null
}

/**
 * Get latest memo of specified record
 * @param record Target record
 * @returns Memo
 */
export function getLatestMemoOf(record: DailyRecord): string {
  return 0 < record.memos.length ? record.memos[record.memos.length - 1] : ''
}

/**
 * Get latest break time length of specified record
 * @param record Target record
 * @returns Break time length(min, null if not set)
 */
export function getLatestBreakTimeLengthMinOf(
  record: DailyRecord
): number | null {
  return record.breakTimeLengthsMin && 0 < record.breakTimeLengthsMin.length
    ? record.breakTimeLengthsMin[record.breakTimeLengthsMin.length - 1]
    : null
}

/**
 * Get latest information of daily record
 * @param record Daily record
 * @param defaultBreakTimeLengthMin Default break time length
 * @returns Latest information of daily record
 */
export function getLatestOf(
  record: DailyRecord | null,
  defaultBreakTimeLengthMin: number | undefined
): DailyLatestRecord {
  let breakTimeLengthMin
  if (record !== null) {
    breakTimeLengthMin = getLatestBreakTimeLengthMinOf(record)
  } else {
    breakTimeLengthMin = defaultBreakTimeLengthMin
      ? defaultBreakTimeLengthMin
      : null
  }
  return {
    start: record !== null ? getLatestStartTimeOf(record) : null,
    stop: record !== null ? getLatestStopTimeOf(record) : null,
    memo: record !== null ? getLatestMemoOf(record) : '',
    breakTimeLengthMin,
  }
}

/**
 * Get record of specified date
 * @param date Target date
 * @param state State to get from
 * @returns Target record(null if not exists)
 */
export function getDailyRecordOf(
  date: Date,
  state: RecordsState
): DailyRecord | null {
  const key = makeRecordKey(date)
  return Object.prototype.hasOwnProperty.call(state.records, key)
    ? state.records[key]
    : null
}

/**
 * Get records of specified month
 * @param month Target month
 * @param state State to get from
 * @returns Map of target date and record
 */
export function getMonthlyRecordsOf(month: Date, state: RecordsState): Records {
  const monthlyRecords: Records = {}

  const monthKey = dayjs(month).format('YYYYMM')
  Object.keys(state.records)
    .filter(key => key.startsWith(monthKey))
    .forEach(key => {
      monthlyRecords[key] = state.records[key]
    })

  return monthlyRecords
}
