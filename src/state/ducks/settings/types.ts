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
 * Settings state
 */
export interface SettingsState {
  sendToMailAddress: string
  lang: Lang
}
