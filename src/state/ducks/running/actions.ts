/**
 * @file Running state action creators
 */
import actionCreatorFactory from 'typescript-fsa'

const actionCreator = actionCreatorFactory('running')

//
// Functions
//

/**
 * 'Update time' action
 */
export const updateTime = actionCreator('UPDATE_TIME')
