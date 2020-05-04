/**
 * @file Records state action creators
 */
import actionCreatorFactory from 'typescript-fsa'

import { RecordsState, UpdateBreakTimeActionPayload } from './types'

const actionCreator = actionCreatorFactory('records')

//
// Functions
//

/**
 * 'Start' action
 */
export const start = actionCreator<number | undefined>('START')

/**
 * 'Stop' action
 */
export const stop = actionCreator<number | undefined>('STOP')

/**
 * 'Update latest memo' action
 */
export const updateLatestMemo = actionCreator<string>('UPDATE_LATEST_MEMO')

/**
 * 'Update start time' action
 */
export const updateStartTime = actionCreator<{
  time: Date
  targetIndex: number
}>('UPDATE_START_TIME')

/**
 * 'Update stop time' action
 */
export const updateStopTime = actionCreator<{
  time: Date
  targetIndex: number
}>('UPDATE_STOP_TIME')

/**
 * 'Update memo' action
 */
export const updateMemo = actionCreator<{
  date: Date
  memo: string
  targetIndex: number
}>('UPDATE_MEMO')

/**
 * 'Update break time length' action
 */
export const updateBreakTimeLengthMin = actionCreator<
  UpdateBreakTimeActionPayload
>('UPDATE_BREAK_TIME_LENGTH_MIN')

/**
 * 'Merge exported state' action
 */
export const mergeExportedState = actionCreator<RecordsState>(
  'MERGE_EXPORTED_STATE'
)
