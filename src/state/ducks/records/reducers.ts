/**
 * @file Records state reducers
 */
import cloneDeep from 'lodash.clonedeep'
import isEqual from 'lodash.isequal'
import { reducerWithInitialState } from 'typescript-fsa-reducers'

import assert from 'assert'

import {
  mergeExportedState,
  start,
  stop,
  updateBreakTimeLengthMin,
  updateLatestMemo,
  updateMemo,
  updateStartTime,
  updateStopTime,
} from './actions'
import { DailyRecord, makeRecordKey, Records, RecordsState } from './types'

//
// Variables
//

/**
 * Initial state
 */
export const INITIAL_STATE: RecordsState = {
  records: {},
}

/**
 * Initial daily record
 */
const INITIAL_DAILY_RECORD: DailyRecord = {
  starts: [],
  stops: [],
  memos: [],
  breakTimeLengthsMin: [],
}

//
// Functions
//

/**
 * Update target start time
 * @param time Time to update
 * @param breakTimeLengthMin Break time length
 * @param targetIndex Target index to update(latest if value is -1)
 * @param state Records state
 * @returns Updated records
 */
function updateTargetStartTime(
  time: Date,
  breakTimeLengthMin: number | undefined,
  targetIndex: number,
  state: RecordsState
): Records {
  const newRecords = { ...state.records }
  const key = makeRecordKey(time)
  if (Object.prototype.hasOwnProperty.call(newRecords, key)) {
    const starts = [...newRecords[key].starts]
    const index = 0 <= targetIndex ? targetIndex : starts.length - 1
    if (starts.length === 0 || starts.length <= index) {
      starts.push(time)
      newRecords[key] = {
        ...newRecords[key],
        starts,
      }
    } else {
      const current = starts[index]
      if (current !== time) {
        starts[index] = time
        newRecords[key] = {
          ...newRecords[key],
          starts,
        }
      }
    }
  } else {
    newRecords[key] = {
      ...INITIAL_DAILY_RECORD,
      starts: [time],
      breakTimeLengthsMin: breakTimeLengthMin ? [breakTimeLengthMin] : [],
    }
  }
  return newRecords
}

/**
 * Update target stop time
 * @param time Time to update
 * @param breakTimeLengthMin Break time length
 * @param targetIndex Target index to update(latest if value is -1)
 * @param state Records state
 * @returns Updated records
 */
function updateTargetStopTime(
  time: Date,
  breakTimeLengthMin: number | undefined,
  targetIndex: number,
  state: RecordsState
): Records {
  const newRecords = { ...state.records }
  const key = makeRecordKey(time)
  if (Object.prototype.hasOwnProperty.call(newRecords, key)) {
    const stops = [...newRecords[key].stops]
    const index = 0 <= targetIndex ? targetIndex : stops.length - 1
    if (stops.length === 0 || stops.length <= index) {
      stops.push(time)
      newRecords[key] = {
        ...newRecords[key],
        stops,
      }
    } else {
      const current = stops[index]
      if (current !== time) {
        stops[index] = time
        newRecords[key] = {
          ...newRecords[key],
          stops,
        }
      }
    }
  } else {
    newRecords[key] = {
      ...INITIAL_DAILY_RECORD,
      stops: [time],
      breakTimeLengthsMin: breakTimeLengthMin ? [breakTimeLengthMin] : [],
    }
  }
  return newRecords
}

/**
 * Update target memo
 * @param date Date to update
 * @param memo Memo to update
 * @param targetIndex Target index to update(latest if value is -1)
 * @param state Records state
 * @returns Records updated
 */
function updateTargetMemo(
  date: Date,
  memo: string,
  targetIndex: number,
  state: RecordsState
): Records {
  const newRecords = { ...state.records }
  const key = makeRecordKey(date)
  if (Object.prototype.hasOwnProperty.call(newRecords, key)) {
    const memos = [...newRecords[key].memos]
    const index = 0 <= targetIndex ? targetIndex : memos.length - 1
    if (memos.length === 0 || memos.length <= index) {
      memos.push(memo)
      newRecords[key] = {
        ...newRecords[key],
        memos,
      }
    } else {
      const currentMemo = memos[index]
      if (currentMemo !== memo) {
        memos[index] = memo
        newRecords[key] = {
          ...newRecords[key],
          memos,
        }
      }
    }
  } else {
    newRecords[key] = {
      ...INITIAL_DAILY_RECORD,
      memos: [memo],
    }
  }
  return newRecords
}

/**
 * 'Start' action handler
 * @param state Current state
 * @param breakTimeLengthMin Break time length
 * @returns New state
 */
function startActionHandler(
  state: RecordsState,
  breakTimeLengthMin?: number
): RecordsState {
  return {
    ...state,
    records: updateTargetStartTime(new Date(), breakTimeLengthMin, -1, state),
  }
}

/**
 * 'Stop' action handler
 * @param state Current state
 * @param breakTimeLengthMin Break time length
 * @returns New state
 */
function stopActionHandler(
  state: RecordsState,
  breakTimeLengthMin?: number
): RecordsState {
  return {
    ...state,
    records: updateTargetStopTime(new Date(), breakTimeLengthMin, -1, state),
  }
}

/**
 * 'Update latest memo' action handler
 * @param state Current state
 * @param updateMemo Memo to update
 * @returns New state
 */
function updateLatestMemoActionHandler(
  state: RecordsState,
  updateMemo: string
): RecordsState {
  return {
    ...state,
    records: updateTargetMemo(new Date(), updateMemo, -1, state),
  }
}

/**
 * 'Update start time' action handler
 * @param state Current state
 * @param payload Update info
 * @returns New state
 */
function updateStartTimeActionHandler(
  state: RecordsState,
  payload: {
    time: Date
    targetIndex: number
  }
): RecordsState {
  return {
    ...state,
    records: updateTargetStartTime(
      payload.time,
      undefined,
      payload.targetIndex,
      state
    ),
  }
}

/**
 * 'Update stop time' action handler
 * @param state Current state
 * @param payload Update info
 * @returns New state
 */
function updateStopTimeActionHandler(
  state: RecordsState,
  payload: {
    time: Date
    targetIndex: number
  }
): RecordsState {
  return {
    ...state,
    records: updateTargetStopTime(
      payload.time,
      undefined,
      payload.targetIndex,
      state
    ),
  }
}

/**
 * 'Update memo' action handler
 * @param state Current state
 * @param payload Update info
 * @returns New state
 */
function updateMemoActionHandler(
  state: RecordsState,
  payload: {
    date: Date
    memo: string
    targetIndex: number
  }
): RecordsState {
  return {
    ...state,
    records: updateTargetMemo(
      payload.date,
      payload.memo,
      payload.targetIndex,
      state
    ),
  }
}

/**
 * 'Update break time length' action handler
 * @param state Current state
 * @param payload Update info
 * @returns New state
 */
function updateBreakTimeLengthMinActionHandler(
  state: RecordsState,
  payload: {
    date: Date
    breakTimeLengthMin: number
    targetIndex: number
  }
): RecordsState {
  assert(0 <= payload.breakTimeLengthMin)

  const newRecords = { ...state.records }
  const key = makeRecordKey(payload.date)
  if (Object.prototype.hasOwnProperty.call(newRecords, key)) {
    const breakTimeLengthsMin = newRecords[key].breakTimeLengthsMin
      ? [...(newRecords[key].breakTimeLengthsMin as number[])]
      : []
    const index =
      0 <= payload.targetIndex
        ? payload.targetIndex
        : breakTimeLengthsMin.length - 1
    if (
      breakTimeLengthsMin.length === 0 ||
      breakTimeLengthsMin.length <= index
    ) {
      breakTimeLengthsMin.push(payload.breakTimeLengthMin)
      newRecords[key] = {
        ...newRecords[key],
        breakTimeLengthsMin,
      }
    } else {
      const current = breakTimeLengthsMin[index]
      if (current !== payload.breakTimeLengthMin) {
        breakTimeLengthsMin[index] = payload.breakTimeLengthMin
        newRecords[key] = {
          ...newRecords[key],
          breakTimeLengthsMin,
        }
      }
    }
  } else {
    newRecords[key] = {
      ...INITIAL_DAILY_RECORD,
      breakTimeLengthsMin: [payload.breakTimeLengthMin],
    }
  }

  return {
    ...state,
    records: newRecords,
  }
}

/**
 * Merge state action handler
 * @param state Current state
 * @param stateToMerge Exported state to import
 * @returns New state
 */
export function mergeStateHandler(
  current: RecordsState,
  stateToMerge: RecordsState
): RecordsState {
  const merged = cloneDeep(current)
  Object.keys(stateToMerge.records).forEach((recordKey) => {
    if (
      Object.prototype.hasOwnProperty.call(merged.records, recordKey) !== false
    ) {
      const currentRecord = merged.records[recordKey]
      const importRecord = stateToMerge.records[recordKey]
      const importedProperties = Object.entries(importRecord)
      Object.entries(currentRecord).forEach(([propertyName, value]) => {
        const importedProperty = importedProperties.find(
          ([name]) => name === propertyName
        )
        if (importedProperty) {
          const [, importedValue] = importedProperty
          const mergedValue = [...value, ...importedValue]
          if (
            isEqual(value, importedValue) === false &&
            isEqual(value, mergedValue) === false
          ) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(currentRecord as any)[propertyName] = mergedValue
          }
        }
      })
      merged.records[recordKey] = currentRecord
    } else {
      merged.records[recordKey] = stateToMerge.records[recordKey]
    }
  })
  return merged
}

/**
 * Records state reducer
 * @param state Current state
 * @param action Action
 * @returns New state
 */
const recordsReducer = reducerWithInitialState(INITIAL_STATE)
  .case(start, startActionHandler)
  .case(stop, stopActionHandler)
  .case(updateLatestMemo, updateLatestMemoActionHandler)
  .case(updateStartTime, updateStartTimeActionHandler)
  .case(updateStopTime, updateStopTimeActionHandler)
  .case(updateMemo, updateMemoActionHandler)
  .case(updateBreakTimeLengthMin, updateBreakTimeLengthMinActionHandler)
  .case(mergeExportedState, mergeStateHandler)
  .build()
export default recordsReducer
