/**
 * @file Running state selectors
 */
import { RunningState } from './types'

//
// Functions
//

/**
 * Get message
 * @param state State to get from
 * @returns Message
 */
export function getMessage(state: RunningState): string {
  return state.message
}

/**
 * Get on line
 * @param state State to get from
 * @returns Online state
 */
export function getOnLine(state: RunningState): boolean {
  return state.onLine
}

/**
 * Get time
 * @param state State to get from
 * @returns Time
 */
export function getTime(state: RunningState): Date {
  return state.time
}

/**
 * Get 'window' object
 * @param state State to get from
 * @returns 'window' object
 */
export function getWindow(state: RunningState): Window {
  return state.window as Window
}

/**
 * Get export object url
 * @param state State to get from
 * @returns export object url
 */
export function getExportObjectUrl(state: RunningState): string {
  return state.downloadObjectUrl
}
