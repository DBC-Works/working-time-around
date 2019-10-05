/**
 * @file Running state reducers
 */
import { reducerWithInitialState } from 'typescript-fsa-reducers'

import { clearMessage, showMessage, updateOnLine, updateTime } from './actions'
import { RunningState } from './types'

//
// Variables
//

/**
 * Initial state
 */
export const INITIAL_STATE: RunningState = {
  window,
  onLine: window.navigator.onLine,
  time: new Date(),
  message: '',
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
  .case(clearMessage, state => ({ ...state, message: '' }))
  .case(showMessage, (state, message) => ({ ...state, message }))
  .case(updateOnLine, (state, onLine) => ({ ...state, onLine }))
  .case(updateTime, state => ({ ...state, time: new Date() }))
  .build()
export default runningReducer
