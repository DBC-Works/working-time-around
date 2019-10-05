/**
 * @file Settings state action creators
 */
import actionCreatorFactory from 'typescript-fsa'

const actionCreator = actionCreatorFactory('settings')

//
// Functions
//

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
