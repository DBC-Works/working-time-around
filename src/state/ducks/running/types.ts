/**
 * @file Running state types
 */

/**
 * Running state
 */
export interface RunningState {
  window: Window
  onLine: boolean
  time: Date
  message: string
}
