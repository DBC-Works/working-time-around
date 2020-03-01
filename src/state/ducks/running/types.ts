/**
 * @file Running state types
 */

/**
 * Running state
 */
export interface RunningState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  window: any
  onLine: boolean
  time: Date
  message: string
  downloadObjectUrl: string
}
