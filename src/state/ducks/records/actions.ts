/**
 * @file Records state action creators
 */
import actionCreatorFactory from 'typescript-fsa'

const actionCreator = actionCreatorFactory('records')

//
// Functions
//

/**
 * 'Start' action
 */
export const start = actionCreator('START')

/**
 * 'Stop' action
 */
export const stop = actionCreator('STOP')

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
