/**
 * @file Settings state selectors
 */
import { Lang, SettingsState, SlackSettings } from './types'

//
// Functions
//

/**
 * Can send message to slack?
 * @param state State to get from
 * @returns true if setting is valid
 */
export function canSendMessageToSlack(state: SettingsState): boolean {
  return (
    0 < state.slack.incomingWebhookUrl.length &&
    state.slack.incomingWebhookUrl.startsWith(
      'https://hooks.slack.com/services/'
    )
  )
}

/**
 * Get lang
 * @param state State to get from
 * @returns Lang
 */
export function getLang(state: SettingsState): Lang {
  return state.lang
}

/**
 * Get send to mail address
 * @param state State to get from
 * @returns Send to mail address
 */
export function getSendToMailAddress(state: SettingsState): string {
  return state.sendToMailAddress
}

/**
 * Get Slack linkage settings
 * @param state State to get from
 * @returns Slack linkage settings
 */
export function getSlackSettings(state: SettingsState): SlackSettings {
  return state.slack
}
