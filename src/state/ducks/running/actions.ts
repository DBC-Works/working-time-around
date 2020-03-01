/**
 * @file Running state action creators
 */
import actionCreatorFactory from 'typescript-fsa'

const actionCreator = actionCreatorFactory('running')

//
// Functions
//

/**
 * 'Clear message' action
 */
export const clearMessage = actionCreator('CLEAR_MESSAGE')

/**
 * 'Show message' action
 */
export const showMessage = actionCreator<string>('SHOW_MESSAGE')

/**
 * 'Update on line' action
 */
export const updateOnLine = actionCreator<boolean>('UPDATE_ON_LINE')

/**
 * 'Update time' action
 */
export const updateTime = actionCreator('UPDATE_TIME')

/**
 * 'Set export object URL' action
 */
export const setExportObjectUrl = actionCreator<string>('SET_EXPORT_OBJECT_URL')
