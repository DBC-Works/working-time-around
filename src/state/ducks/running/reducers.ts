/**
 * @file Running state reducers
 */
import { reducerWithInitialState } from 'typescript-fsa-reducers'

import { updateTime } from './actions'
import { RunningState } from './types'

//
// Variables
//

/**
 * Initial state
 */
export const INITIAL_STATE: RunningState = {
  time: new Date(),
}

//
// Functions
//

/**
 * Running state reducer
 * @param state Current state
 * @param action Action
 * @returns New state
 */
const runningReducer = reducerWithInitialState(INITIAL_STATE)
  .case(updateTime, state => ({ ...state, time: new Date() }))
  .build()
export default runningReducer
