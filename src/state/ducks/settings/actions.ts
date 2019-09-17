/**
 * @file Settings state action creators
 */
import actionCreatorFactory from 'typescript-fsa'

const actionCreator = actionCreatorFactory('settings')

//
// Functions
//

/**
 * 'Update send to mail address' action
 */
export const updateSendToMailAddress = actionCreator<string>(
  'UPDATE_SEND_TO_MAIL_ADDRESS'
)

/**
 * 'Select language' action
 */
export const selectLanguage = actionCreator<string>('SELECT_LANGUAGE')
