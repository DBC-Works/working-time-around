/**
 * @file Settings types
 */

/**
 * Language
 */
export enum Lang {
  EN = 'en',
  JA = 'ja',
}

/**
 * Slack linkage setting
 */
export interface SlackSettings {
  incomingWebhookUrl: string
  context: string
}

/**
 * Settings state
 */
export interface SettingsState {
  sendToMailAddress: string
  slack: SlackSettings
  lang: Lang
  defaultBreakTimeLengthMin?: number
}
