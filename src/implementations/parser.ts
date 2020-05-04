/**
 * @file State parser
 */
import dayjs from 'dayjs'

import { Result, StateExchangeFormat } from './types'

//
// Types
//

/**
 * Parse error type
 */
export enum ParseErrorType {
  InvalidText = 'Invalid text',
  NoRequiredProperty = 'No required property',
  InvalidVersion = 'Invalid version',
}

//
// Functions
//

/**
 * Parse state formatted as JSON
 * @param json JSON string
 * @returns Parsed object
 */
export function parseState<T>(jsonString: string): T {
  return JSON.parse(jsonString, (key, value) =>
    key === 'starts' || key === 'stops'
      ? (value as string[]).map((v) => dayjs(v).toDate())
      : value
  )
}

/**
 * Parse exported state formatted as JSON
 * @param json JSON string
 * @returns Result
 */
export function parseExportedState(
  jsonString: string
): Result<StateExchangeFormat, ParseErrorType> {
  let json: unknown
  try {
    json = parseState<unknown>(jsonString)
  } catch (e) {
    if (e instanceof SyntaxError) {
      return new Result({ err: ParseErrorType.InvalidText })
    }
    throw e
  }

  if (
    ['version', 'createTime', 'records', 'settings'].some(
      (name) => Object.prototype.hasOwnProperty.call(json, name) === false
    )
  ) {
    return new Result({ err: ParseErrorType.NoRequiredProperty })
  }

  const state = json as StateExchangeFormat
  if ([202003].some((version) => state.version === version) === false) {
    return new Result({ err: ParseErrorType.InvalidVersion })
  }

  return new Result({ ok: state })
}
