/**
 * @file 'Settings' component unit tests
 */
import React from 'react'
import { AnyAction, Store } from 'redux'

import { INITIAL_STATE as runningInitialState } from '../../state/ducks/running'
import { INITIAL_STATE as settingsInitialState } from '../../state/ducks/settings'
import { AppState, INITIAL_STATE } from '../../state/store'
import Settings from './Settings'

import { cleanup, RenderResult } from '@testing-library/react'
import { renderWithProvider } from '../componentTestUtilities'

describe('"Settings" template', () => {
  const LABEL_BUTTON_SEND_A_TEST_MESSAGE = 'Send a test message'
  const LABEL_BUTTON_OFFLINE = '(Offline)'

  function setup(
    state: AppState = INITIAL_STATE
  ): [RenderResult, Store<AppState, AnyAction>] {
    return renderWithProvider(<Settings />, '/settings', state)
  }

  afterEach(cleanup)

  it('should exist "Settings" heading', () => {
    const [renderResult] = setup()
    const { getByText } = renderResult
    expect(getByText('Settings')).toBeInTheDocument()
  })

  it('should exist headings', () => {
    const [renderResult] = setup()
    const { getByText } = renderResult
    expect(getByText('Send to mail address')).toBeInTheDocument()
    expect(getByText('Slack linkage')).toBeInTheDocument()
    expect(getByText('Incoming webhook URL')).toBeInTheDocument()
    expect(getByText('Context')).toBeInTheDocument()
    expect(getByText('Language')).toBeInTheDocument()
  })

  it('should exist "Send a test message" button when online', () => {
    const [renderResult] = setup()
    const { getByText, queryByText } = renderResult
    expect(getByText(LABEL_BUTTON_SEND_A_TEST_MESSAGE)).toBeInTheDocument()
    expect(queryByText(LABEL_BUTTON_OFFLINE)).not.toBeInTheDocument()
  })

  it('should to be disabled "Send a test message" when "Incoming webhook URL" is not set or invalid', () => {
    const [renderResult] = setup()
    const { getByText } = renderResult
    expect(getByText(LABEL_BUTTON_SEND_A_TEST_MESSAGE)).toBeDisabled()
  })

  it('should to be enabled "Send a test message" when "incoming Webhook URL" is set and valid', () => {
    const appState = {
      ...INITIAL_STATE,
      settings: {
        ...settingsInitialState,
        slack: {
          ...settingsInitialState.slack,
          incomingWebhookUrl:
            'https://hooks.slack.com/services/xxxxxxxxx/xxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxx',
        },
      },
    }
    const [renderResult] = setup(appState)
    const { getByText } = renderResult
    expect(getByText(LABEL_BUTTON_SEND_A_TEST_MESSAGE)).toBeEnabled()
  })

  it('should exist disabled "(offline)" button when offline', () => {
    const appState = {
      ...INITIAL_STATE,
      running: { ...runningInitialState, onLine: false },
    }
    const [renderResult] = setup(appState)
    const { getByText, queryByText } = renderResult
    const offLineButton = getByText(LABEL_BUTTON_OFFLINE)
    expect(offLineButton).toBeInTheDocument()
    expect(offLineButton).toBeDisabled()
    expect(
      queryByText(LABEL_BUTTON_SEND_A_TEST_MESSAGE)
    ).not.toBeInTheDocument()
  })
})
