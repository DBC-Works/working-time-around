/**
 * @file Records state reducers
 */
import { reducerWithInitialState } from 'typescript-fsa-reducers'

import {
  start,
  stop,
  updateLatestMemo,
  updateMemo,
  updateStartTime,
  updateStopTime,
} from './actions'
import { makeRecordKey, Records, RecordsState } from './types'

//
// Variables
//

/**
 * Initial state
 */
export const INITIAL_STATE: RecordsState = {
  records: {},
}

//
// Functions
//

/**
 * Update target start time
 * @param time Time to update
 * @param targetIndex Target index to update(latest if value is -1)
 * @param state Records state
 * @returns Updated records
 */
function updateTargetStartTime(
  time: Date,
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
      starts: [time],
      stops: [],
      memos: [],
    }
  }
  return newRecords
}

/**
 * Update target stop time
 * @param time Time to update
 * @param targetIndex Target index to update(latest if value is -1)
 * @param state Records state
 * @returns Updated records
 */
function updateTargetStopTime(
  time: Date,
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
      starts: [],
      stops: [time],
      memos: [],
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
      starts: [],
      stops: [],
      memos: [memo],
    }
  }
  return newRecords
}

/**
 * 'Start' action handler
 * @param state Current state
 * @returns New state
 */
function startActionHandler(state: RecordsState): RecordsState {
  return { ...state, records: updateTargetStartTime(new Date(), -1, state) }
}

/**
 * 'Stop' action handler
 * @param state Current state
 * @returns New state
 */
function stopActionHandler(state: RecordsState): RecordsState {
  return { ...state, records: updateTargetStopTime(new Date(), -1, state) }
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
    records: updateTargetStartTime(payload.time, payload.targetIndex, state),
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
    records: updateTargetStopTime(payload.time, payload.targetIndex, state),
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
  .build()
export default recordsReducer
