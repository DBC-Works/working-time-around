/**
 * @file Running state reducers
 */
import { reducerWithInitialState } from 'typescript-fsa-reducers'

import {
  clearMessage,
  setExportObjectUrl,
  showMessage,
  updateOnLine,
  updateTime,
} from './actions'
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
  downloadObjectUrl: '#',
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
  .case(setExportObjectUrl, (state, exportObjectUrl) => ({
    ...state,
    downloadObjectUrl: exportObjectUrl,
  }))
  .build()
export default runningReducer
