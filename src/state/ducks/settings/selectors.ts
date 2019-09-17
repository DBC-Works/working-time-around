/**
 * @file Settings state selectors
 */
import { Lang, SettingsState } from './types'

//
// Functions
//

/**
 * Get send to mail address
 * @param state State to get from
 * @returns Send to mail address
 */
export function getSendToMailAddress(state: SettingsState): string {
  return state.sendToMailAddress
}

/**
 * Get lang
 * @param state State to get from
 * @returns Lang
 */
export function getLang(state: SettingsState): Lang {
  return state.lang
}
