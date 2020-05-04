/**
 * @file Generic type definitions
 */
import assert from 'assert'

import { RecordsState } from '../state/ducks/records'
import { SettingsState } from '../state/ducks/settings'

/**
 * Result value type class
 */
export class Result<TResult, TError> {
  private okValue: TResult | undefined
  private errValue: TError | null | undefined

  /**
   * constructor
   * @param params Result object
   */
  constructor(params: { ok?: TResult; err?: TError }) {
    assert(
      (Object.prototype.hasOwnProperty.call(params, 'ok') !== false &&
        Object.prototype.hasOwnProperty.call(params, 'err') === false) ||
        (Object.prototype.hasOwnProperty.call(params, 'ok') === false &&
          Object.prototype.hasOwnProperty.call(params, 'err') !== false)
    )

    this.okValue = params.ok
    this.errValue = params.err
  }

  /**
   * Ok?
   * @returns true if this isn't error
   */
  isOk(): boolean {
    return this.okValue !== undefined
  }

  /**
   * Error?
   * @returns true if this is error
   */
  isErr(): boolean {
    return this.errValue !== undefined
  }

  /**
   * Get result value
   * @returns Result value
   */
  ok(): TResult {
    assert(this.isOk())

    return this.okValue as TResult
  }

  /**
   * Get error value
   * @returns Error value
   */
  err(): TError {
    assert(this.isErr())

    return this.errValue as TError
  }
}

/**
 * State exchange format(for export / import)
 */
export interface StateExchangeFormat {
  version: number
  createTime: Date
  records: RecordsState
  settings: SettingsState
}
