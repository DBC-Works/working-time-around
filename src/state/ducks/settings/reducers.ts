/**
 * @file Settings state reducers
 */
import { reducerWithInitialState } from 'typescript-fsa-reducers'
import assert from 'assert'

import {
  clearDefaultBreakTimeLength,
  mergeExportedState,
  selectLanguage,
  updateDefaultBreakTimeLengthMin,
  updateSendToMailAddress,
  updateSlackContext,
  updateSlackIncomingWebhookUrl,
} from './actions'
import { Lang, SettingsState } from './types'

//
// Variables
//

/**
 * Initial state
 */
export const INITIAL_STATE: SettingsState = {
  sendToMailAddress: '',
  slack: { incomingWebhookUrl: '', context: '' },
  lang: Lang.EN,
  defaultBreakTimeLengthMin: 60,
}

//
// Functions
//

/**
 * Update default break time length(by minute)
 * @param state Current state
 * @param minute Default break time length(minute, undefined if not set)
 * @returns New state
 */
function updateDefaultBreakTimeLengthMinActionHandler(
  state: SettingsState,
  minute?: number
): SettingsState {
  assert(minute === undefined || 0 <= minute)

  return {
    ...state,
    defaultBreakTimeLengthMin: minute,
  }
}

/**
 * Merge exported state handler
 * @param state Current state
 * @param stateToImport Exported state to import
 * @returns New state
 */
export function mergeStateHandler(
  state: SettingsState,
  stateToImport: SettingsState
): SettingsState {
  const merged = {
    ...state,
    slack: {
      ...state.slack,
    },
    lang: stateToImport.lang,
  }
  if (0 < stateToImport.sendToMailAddress.length) {
    merged.sendToMailAddress = stateToImport.sendToMailAddress
  }
  if (0 < stateToImport.slack.incomingWebhookUrl.length) {
    merged.slack.incomingWebhookUrl = stateToImport.slack.incomingWebhookUrl
  }
  if (0 < stateToImport.slack.context.length) {
    merged.slack.context = stateToImport.slack.context
  }
  if (stateToImport.defaultBreakTimeLengthMin !== undefined) {
    merged.defaultBreakTimeLengthMin = stateToImport.defaultBreakTimeLengthMin
  }

  return merged
}

/**
 * Settings state reducer
 * @param state Current state
 * @param action Action
 * @returns New state
 */
const settingsReducer = reducerWithInitialState(INITIAL_STATE)
  .case(clearDefaultBreakTimeLength, (state) => ({
    ...state,
    defaultBreakTimeLengthMin: undefined,
  }))
  .case(
    updateDefaultBreakTimeLengthMin,
    updateDefaultBreakTimeLengthMinActionHandler
  )
  .case(selectLanguage, (state, payload) => ({
    ...state,
    lang: payload as Lang,
  }))
  .case(updateSendToMailAddress, (state, sendToMailAddress) => ({
    ...state,
    sendToMailAddress,
  }))
  .case(updateSlackContext, (state, context) => ({
    ...state,
    slack: {
      ...state.slack,
      context,
    },
  }))
  .case(updateSlackIncomingWebhookUrl, (state, incomingWebhookUrl) => ({
    ...state,
    slack: {
      ...state.slack,
      incomingWebhookUrl,
    },
  }))
  .case(mergeExportedState, mergeStateHandler)
  .build()
export default settingsReducer
