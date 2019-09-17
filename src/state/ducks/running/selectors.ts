/**
 * @file Running state selectors
 */
import { RunningState } from './types'

//
// Functions
//

/**
 * Get time
 * @param state State to get from
 * @returns Time
 */
export function getTime(state: RunningState): Date {
  return state.time
}
