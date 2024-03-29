/**
 * @file Store
 */
import {
  AnyAction,
  applyMiddleware,
  combineReducers,
  createStore,
  Reducer,
  Store,
} from 'redux'
import { composeWithDevTools } from '@redux-devtools/extension'
import { createTransform, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import { parseState } from '../implementations/parser'
import recordsReducer, {
  INITIAL_STATE as recordsInitialState,
  RecordsState,
} from './ducks/records'
import settingsReducer, {
  INITIAL_STATE as settingsInitialState,
  SettingsState,
} from './ducks/settings'
import runningReducer, {
  INITIAL_STATE as runningInitialState,
  RunningState,
} from './ducks/running'

//
// Types
//

/**
 * App state
 */
export interface AppState {
  records: RecordsState
  settings: SettingsState
  running: RunningState
}

//
// Internal functions
//

/**
 * Migrate state
 * @param originalState
 * @returns Migrated state
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrateSettingsState(originalState: any): SettingsState {
  const migratedState = {
    ...originalState,
  }
  if (Object.prototype.hasOwnProperty.call(originalState, 'slack') === false) {
    migratedState.slack = {
      incomingWebhookUrl: '',
      context: '',
    }
  }
  if (
    Object.prototype.hasOwnProperty.call(
      originalState,
      'defaultBreakTimeLengthMin'
    ) === false
  ) {
    migratedState.defaultBreakTimeLengthMin = undefined
  }
  return migratedState
}

/**
 * Persistence and rehydrate transformer
 */
const setTransform = createTransform(
  (inboundState, key) =>
    key === 'records' ? JSON.stringify(inboundState) : inboundState,
  (outboundState, key) => {
    switch (key) {
      case 'records':
        return parseState<RecordsState>(outboundState as string)
      case 'settings':
        return migrateSettingsState(outboundState)
    }
    return outboundState
  },
  { blacklist: ['recordsReducer'] }
)

//
// Variables
//

/**
 * Initial state
 */
export const INITIAL_STATE: AppState = {
  records: recordsInitialState,
  settings: settingsInitialState,
  running: runningInitialState,
}

/**
 * Persistence configuration
 */
const persistConfig = {
  key: 'root',
  storage,
  version: 1,
  transforms: [setTransform],
  blacklist: ['running'],
}

//
// Exported functions
//

/**
 * Create root reducer
 * @returns Root reducer
 */
export function createRootReducer(): Reducer<AppState, AnyAction> {
  return combineReducers({
    records: recordsReducer,
    settings: settingsReducer,
    running: runningReducer,
  })
}

/**
 * Configure store
 * @param state Initial state
 * @returns Store
 */
export default function configureStore(
  state: AppState = INITIAL_STATE
): Store<AppState, AnyAction> {
  return createStore(
    persistReducer(persistConfig, createRootReducer()),
    state,
    composeWithDevTools(applyMiddleware())
  )
}
