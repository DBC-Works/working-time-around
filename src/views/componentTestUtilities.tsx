/**
 * @file Utilities for component unit test
 */
import React from 'react'
import { MemoryRouter as Router } from 'react-router-dom'
import { AnyAction, applyMiddleware, createStore, Store } from 'redux'
import { Provider, useSelector } from 'react-redux'
import { IntlProvider } from 'react-intl'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'

import { AppState, createRootReducer, INITIAL_STATE } from '../state/store'
import { getLang } from '../state/ducks/settings'
import { getMessageCatalogueOf } from './templates/Settings'

import '@testing-library/jest-dom/jest-globals'
import { render, RenderResult } from '@testing-library/react'
import IntlPolyfill from 'intl'
import 'intl/locale-data/jsonp/pt'

//
// Components
//

/**
 * Container component for unit test
 */
const Container: React.FC<{
  component: React.ReactElement
  route: string
}> = (props) => {
  const currentLang = useSelector((app: AppState) => getLang(app.settings))
  dayjs.locale(currentLang)
  return (
    <IntlProvider
      locale={currentLang}
      messages={getMessageCatalogueOf(currentLang)}
    >
      <Router initialEntries={[props.route]}>{props.component}</Router>
    </IntlProvider>
  )
}

//
// Functions
//

/**
 * Render component with provider to test
 * @param component Rendering component
 * @param state Initial state
 * @returns Rendering result and store
 */
export function renderWithProvider(
  component: React.ReactElement,
  route: string,
  state: AppState = INITIAL_STATE
): [RenderResult, Store<AppState, AnyAction>] {
  dayjs.extend(localizedFormat)
  const store = createStore(createRootReducer(), state, applyMiddleware())
  const result = render(
    <Provider store={store}>
      <Container component={component} route={route} />
    </Provider>
  )
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  return [result!, store]
}

/**
 * Setup tests
 * https://testing-library.com/docs/example-react-intl
 */
function setupTests(): void {
  // https://formatjs.io/guides/runtime-environments/#server
  if (global.Intl) {
    Intl.NumberFormat = IntlPolyfill.NumberFormat
    Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat
  } else {
    global.Intl = IntlPolyfill
  }
}

//
// Entry
//
declare const globalThis: {
  IS_REACT_ACT_ENVIRONMENT: boolean
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true
setupTests()
