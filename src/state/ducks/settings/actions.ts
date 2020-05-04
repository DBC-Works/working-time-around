/**
 * @file Settings state action creators
 */
import actionCreatorFactory from 'typescript-fsa'

import { SettingsState } from './types'

const actionCreator = actionCreatorFactory('settings')

//
// Functions
//

/**
 * 'Clear default break time length' action
 */
export const clearDefaultBreakTimeLength = actionCreator<void>(
  'CLEAR_DEFAULT_BREAK_TIME_LENGTH'
)

/**
 * 'Update default break time length' action
 */
export const updateDefaultBreakTimeLengthMin = actionCreator<number>(
  'UPDATE_DEFAULT_BREAK_TIME_LENGTH_MINUTE'
)

/**
 * 'Select language' action
 */
export const selectLanguage = actionCreator<string>('SELECT_LANGUAGE')

/**
 * 'Update send to mail address' action
 */
export const updateSendToMailAddress = actionCreator<string>(
  'UPDATE_SEND_TO_MAIL_ADDRESS'
)

/**
 * 'Update Slack context' action
 */
export const updateSlackContext = actionCreator<string>('UPDATE_SLACK_CONTEXT')

/**
 * 'Update Slack incoming webhook URL' action
 */
export const updateSlackIncomingWebhookUrl = actionCreator<string>(
  'UPDATE_SLACK_INCOMING_WEBHOOK_URL'
)

/**
 * 'Merge exported state' action
 */
export const mergeExportedState = actionCreator<SettingsState>(
  'MERGE_EXPORTED_STATE'
)
