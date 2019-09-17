/**
 * @file Settings state reducers
 */
import { reducerWithInitialState } from 'typescript-fsa-reducers'

import { selectLanguage, updateSendToMailAddress } from './actions'
import { Lang, SettingsState } from './types'

//
// Variables
//

/**
 * Initial state
 */
export const INITIAL_STATE: SettingsState = {
  sendToMailAddress: '',
  lang: Lang.EN,
}

//
// Functions
//

/**
 * Settings state reducer
 * @param state Current state
 * @param action Action
 * @returns New state
 */
const settingsReducer = reducerWithInitialState(INITIAL_STATE)
  .case(updateSendToMailAddress, (state, mailAddress) => ({
    ...state,
    sendToMailAddress: mailAddress,
  }))
  .case(selectLanguage, (state, payload) => ({
    ...state,
    lang: payload as Lang,
  }))
  .build()
export default settingsReducer
