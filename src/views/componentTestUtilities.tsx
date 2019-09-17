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
import { getMessageCatalogueOf } from './templates/settings'

import '@testing-library/jest-dom/extend-expect'
import { render, RenderResult } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

//
// Components
//

/**
 * Container component for unit test
 */
const Container: React.FC<{
  component: React.ReactElement
  route: string
}> = props => {
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
  let result: RenderResult
  act(() => {
    result = render(
      <Provider store={store}>
        <Container component={component} route={route} />
      </Provider>
    )
  })
  return [result!, store]
}
