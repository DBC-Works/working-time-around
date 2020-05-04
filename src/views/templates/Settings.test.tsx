/**
 * @file 'Settings' component unit tests
 */
import React from 'react'
import { AnyAction, Store } from 'redux'

import { INITIAL_STATE as runningInitialState } from '../../state/ducks/running'
import {
  INITIAL_STATE as settingsInitialState,
  settingsTypes,
} from '../../state/ducks/settings'
import { AppState, INITIAL_STATE } from '../../state/store'
import Settings from './Settings'

import {
  act,
  cleanup,
  fireEvent,
  RenderResult,
  within,
} from '@testing-library/react'
import { renderWithProvider } from '../componentTestUtilities'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const global: any

describe('"Settings" template', () => {
  enum TAB {
    OPERATION = 'Operation',
    RECORD = 'Record',
    LINKAGE = 'Linkage',
  }

  enum HEADING {
    DEFAULT_BREAK_TIME_LENGTH = 'Default break time length',
    LANGUAGE = 'Language',

    EXPORT = 'Export',
    IMPORT = 'Import',

    SEND_TO_MAIL_ADDRESS = 'Send to mail address',
    SLACK_LINKAGE = 'Slack linkage',
  }

  function setup(
    state: AppState = INITIAL_STATE
  ): [RenderResult, Store<AppState, AnyAction>] {
    return renderWithProvider(<Settings />, '/settings', state)
  }

  function makeSettingsTestState(
    settings: settingsTypes.SettingsState
  ): AppState {
    return {
      ...INITIAL_STATE,
      settings,
    }
  }

  afterEach(cleanup)

  it('should exist "Settings" heading', () => {
    const [renderResult] = setup()
    const { getByText } = renderResult
    expect(getByText('Settings')).toBeInTheDocument()
  })
  it('should exist "Operation", "Record" and "Linkage" tab heading', () => {
    const [renderResult] = setup()
    const { getByText } = renderResult

    expect(getByText(TAB.OPERATION)).toBeInTheDocument()
    expect(getByText(TAB.RECORD)).toBeInTheDocument()
    expect(getByText(TAB.LINKAGE)).toBeInTheDocument()
  })

  describe('"Operation" tab', () => {
    describe('Default break time length', () => {
      const TEST_ID_BREAK_TIME_LENGTH = 'break-time-length'
      const LITERAL_NO_SELECTION = '--'

      it('should exist when "Operation" tab is selected', () => {
        const [renderResult] = setup()
        const { getByText } = renderResult

        expect(getByText(HEADING.DEFAULT_BREAK_TIME_LENGTH)).toBeInTheDocument()
      })
      it('should not exist when "Operation" tab is not selected', () => {
        const [renderResult] = setup()
        const { getByText, queryByText } = renderResult
        act(() => {
          fireEvent.click(getByText(TAB.LINKAGE))
        })

        expect(
          queryByText(HEADING.DEFAULT_BREAK_TIME_LENGTH)
        ).not.toBeInTheDocument()
      })
      it('should exist break time length select component', () => {
        const [renderResult] = setup()
        const { getByTestId } = within(
          renderResult.getByTestId(TEST_ID_BREAK_TIME_LENGTH)
        )
        expect(getByTestId('time-select')).toBeInTheDocument()
      })
      it('should exist clear icon button component', () => {
        const [renderResult] = setup()
        const { getByText } = within(
          renderResult.getByTestId(TEST_ID_BREAK_TIME_LENGTH)
        )
        const clearButton = getByText('clear')
        expect(clearButton).toBeInTheDocument()
        expect(clearButton).not.toBeDisabled()
      })
      it('should not be selected if break time length is not set', () => {
        const [renderResult] = setup(
          makeSettingsTestState({
            ...settingsInitialState,
            defaultBreakTimeLengthMin: undefined,
          })
        )
        const { getAllByDisplayValue, getByText } = within(
          renderResult.getByTestId(TEST_ID_BREAK_TIME_LENGTH)
        )
        expect(getAllByDisplayValue(LITERAL_NO_SELECTION)).toHaveLength(2)
        const clearButton = getByText('clear')
        expect(clearButton).toBeInTheDocument()
        expect(clearButton).toBeDisabled()
      })
      it('should be selected if break time length is set', () => {
        const [renderResult] = setup(
          makeSettingsTestState({
            ...INITIAL_STATE.settings,
            defaultBreakTimeLengthMin: 95,
          })
        )
        const { getByDisplayValue, getByText } = within(
          renderResult.getByTestId(TEST_ID_BREAK_TIME_LENGTH)
        )
        expect(getByDisplayValue('01')).toBeInTheDocument()
        expect(getByDisplayValue(':35')).toBeInTheDocument()
        const clearButton = getByText('clear')
        expect(clearButton).toBeInTheDocument()
        expect(clearButton).not.toBeDisabled()
      })
      it('should be able to change', () => {
        const [renderResult] = setup()
        const { getByDisplayValue, queryByDisplayValue, getByText } = within(
          renderResult.getByTestId(TEST_ID_BREAK_TIME_LENGTH)
        )
        expect(getByDisplayValue('01')).toBeInTheDocument()
        expect(getByDisplayValue(':00')).toBeInTheDocument()

        act(() => {
          fireEvent.change(getByDisplayValue(':00') as HTMLElement, {
            target: { value: '45' },
          })
        })
        expect(getByDisplayValue('01')).toBeInTheDocument()
        expect(getByDisplayValue(':45')).toBeInTheDocument()
        expect(
          queryByDisplayValue(LITERAL_NO_SELECTION)
        ).not.toBeInTheDocument()
        const clearButton = getByText('clear')
        expect(clearButton).toBeInTheDocument()
        expect(clearButton).not.toBeDisabled()

        act(() => {
          fireEvent.change(getByDisplayValue('01') as HTMLElement, {
            target: { value: '0' },
          })
        })
        expect(getByDisplayValue('00')).toBeInTheDocument()
        expect(getByDisplayValue(':45')).toBeInTheDocument()
        expect(
          queryByDisplayValue(LITERAL_NO_SELECTION)
        ).not.toBeInTheDocument()
        expect(clearButton).not.toBeDisabled()
      })
      it.each([
        { value: '1', expected: '01' },
        { value: '0', expected: '00' },
      ])(
        'should be set minute to "00" automatically when not selected and hour is selected',
        (table) => {
          const [renderResult] = setup(
            makeSettingsTestState({
              ...INITIAL_STATE.settings,
              defaultBreakTimeLengthMin: undefined,
            })
          )
          const { getAllByDisplayValue, getByDisplayValue, getByText } = within(
            renderResult.getByTestId(TEST_ID_BREAK_TIME_LENGTH)
          )
          act(() => {
            fireEvent.change(
              (getAllByDisplayValue(LITERAL_NO_SELECTION) as HTMLElement[])[0],
              {
                target: { value: table.value },
              }
            )
          })
          expect(getByDisplayValue(table.expected)).toBeInTheDocument()
          expect(getByDisplayValue(':00')).toBeInTheDocument()
          const clearButton = getByText('clear')
          expect(clearButton).toBeInTheDocument()
          expect(clearButton).not.toBeDisabled()
        }
      )
      it.each([
        { value: '45', expected: ':45' },
        { value: '0', expected: ':00' },
      ])(
        'should be set hour to "00" automatically when not selected and minute is selected',
        (table) => {
          const [renderResult] = setup(
            makeSettingsTestState({
              ...INITIAL_STATE.settings,
              defaultBreakTimeLengthMin: undefined,
            })
          )
          const { getAllByDisplayValue, getByDisplayValue, getByText } = within(
            renderResult.getByTestId(TEST_ID_BREAK_TIME_LENGTH)
          )
          act(() => {
            fireEvent.change(
              (getAllByDisplayValue(LITERAL_NO_SELECTION) as HTMLElement[])[1],
              {
                target: { value: table.value },
              }
            )
          })
          expect(getByDisplayValue('00')).toBeInTheDocument()
          expect(getByDisplayValue(table.expected)).toBeInTheDocument()
          const clearButton = getByText('clear')
          expect(clearButton).toBeInTheDocument()
          expect(clearButton).not.toBeDisabled()
        }
      )
      it('should be clear the selection when "clear" button is selected', () => {
        const [renderResult, store] = setup(
          makeSettingsTestState({
            ...INITIAL_STATE.settings,
            defaultBreakTimeLengthMin: 5,
          })
        )
        const { getAllByDisplayValue, getByDisplayValue, getByText } = within(
          renderResult.getByTestId(TEST_ID_BREAK_TIME_LENGTH)
        )
        expect(getByDisplayValue('00')).toBeInTheDocument()
        expect(getByDisplayValue(':05')).toBeInTheDocument()
        const clearButton = getByText('clear') as HTMLElement
        expect(clearButton).not.toBeDisabled()

        act(() => {
          fireEvent.click(clearButton)
        })
        expect(getAllByDisplayValue(LITERAL_NO_SELECTION)).toHaveLength(2)
        expect(clearButton).toBeDisabled()
        const {
          settings: { defaultBreakTimeLengthMin },
        } = store.getState()
        expect(defaultBreakTimeLengthMin).toBeUndefined()
      })
    })

    describe('Language', () => {
      it('should exist when "Operation" tab is selected', () => {
        const [renderResult] = setup()
        const { getByText } = renderResult

        expect(getByText(HEADING.LANGUAGE)).toBeInTheDocument()
      })
      it('should not exist when "Operation" tab is not selected', () => {
        const [renderResult] = setup()
        const { getByText, queryByText } = renderResult
        act(() => {
          fireEvent.click(getByText(TAB.LINKAGE))
        })

        expect(queryByText(HEADING.LANGUAGE)).not.toBeInTheDocument()
      })
    })
  })

  describe('"Record" tab', () => {
    let mockURL: {
      createObjectURL: jest.Mock
      revokeObjectURL: jest.Mock
    }

    beforeAll(() => {
      mockURL = {
        createObjectURL: jest.fn(),
        revokeObjectURL: jest.fn(),
      }
      mockURL.createObjectURL.mockReturnValue('created-url')
      global.URL = mockURL
    })

    describe('Export', () => {
      const LABEL_DOWNLOAD = 'Download'

      it('should exist when "Record" tab is selected', () => {
        const [renderResult] = setup()
        const { getByText } = renderResult
        act(() => {
          fireEvent.click(getByText(TAB.RECORD))
        })

        expect(getByText(HEADING.EXPORT)).toBeInTheDocument()
      })
      it('should not exist when "Record" tab is not selected', () => {
        const [renderResult] = setup()
        const { queryByText } = renderResult

        expect(queryByText(HEADING.EXPORT)).not.toBeInTheDocument()
      })
      it('should exist "Start download" link', () => {
        const [renderResult] = setup()
        const { getByText } = renderResult
        act(() => {
          fireEvent.click(getByText(TAB.RECORD))
        })

        const startDownloadAnchor = getByText(LABEL_DOWNLOAD)
        expect(startDownloadAnchor).toBeInTheDocument()
        expect(startDownloadAnchor).toHaveAttribute(
          'download',
          'working-time-around-record-data.json'
        )
        expect(mockURL.createObjectURL).toHaveBeenCalled()
        expect(startDownloadAnchor).toHaveAttribute('href', 'created-url')
      })
    })
    describe('Import', () => {
      const ID_CHECKBOX = 'import-settings'

      it('should exist when "Record" tab is selected', () => {
        const [renderResult] = setup()
        const { getByText } = renderResult
        act(() => {
          fireEvent.click(getByText(TAB.RECORD))
        })

        expect(getByText(HEADING.IMPORT)).toBeInTheDocument()
      })
      it('should not exist when "Record" tab is not selected', () => {
        const [renderResult] = setup()
        const { queryByText } = renderResult

        expect(queryByText(HEADING.IMPORT)).not.toBeInTheDocument()
      })
      it('should exist file upload element and "Browse" button', () => {
        const [renderResult] = setup()
        const { getByTestId, getByText } = renderResult
        act(() => {
          fireEvent.click(getByText(TAB.RECORD))
        })

        expect(getByTestId('file-upload')).toBeInTheDocument()
        expect(getByText('Browse...')).toBeInTheDocument()
      })
      it('should exist checkbox to import settings', () => {
        const [renderResult] = setup()
        const { container, getByText } = renderResult
        act(() => {
          fireEvent.click(getByText(TAB.RECORD))
        })

        const checkbox = container.querySelector(`input[id="${ID_CHECKBOX}"]`)
        expect(checkbox).toBeInTheDocument()
        expect(checkbox).not.toBeChecked()
        const label = container.querySelector(`label[for="${ID_CHECKBOX}"]`)
        expect(label).toBeInTheDocument()
        expect(label).toHaveTextContent('Import settings')
      })
      it('should check after checkbox click', () => {
        const [renderResult] = setup()
        const { container, getByText } = renderResult
        act(() => {
          fireEvent.click(getByText(TAB.RECORD))
        })
        const checkbox = container.querySelector(
          `input[id="${ID_CHECKBOX}"]`
        ) as Element
        act(() => {
          fireEvent.click(checkbox)
        })

        expect(checkbox).toBeInTheDocument()
        expect(checkbox).toBeChecked()
      })
    })
  })

  describe('"Linkage" tab', () => {
    describe('Send to mail address', () => {
      it('should exist when "Linkage" tab is selected', () => {
        const [renderResult] = setup()
        const { getByText } = renderResult
        act(() => {
          fireEvent.click(getByText(TAB.LINKAGE))
        })

        expect(getByText(HEADING.SEND_TO_MAIL_ADDRESS)).toBeInTheDocument()
      })
      it('should not exist when "Linkage" tab is not selected', () => {
        const [renderResult] = setup()
        const { queryByText } = renderResult

        expect(
          queryByText(HEADING.SEND_TO_MAIL_ADDRESS)
        ).not.toBeInTheDocument()
      })
    })

    describe('Slack linkage', () => {
      const LABEL_BUTTON_SEND_A_TEST_MESSAGE = 'Send a test message'
      const LABEL_BUTTON_OFFLINE = '(Offline)'

      it('should exist when "Linkage" tab is selected', () => {
        const [renderResult] = setup()
        const { getByText } = renderResult
        act(() => {
          fireEvent.click(getByText(TAB.LINKAGE))
        })

        expect(getByText(HEADING.SLACK_LINKAGE)).toBeInTheDocument()
        expect(getByText('Incoming webhook URL')).toBeInTheDocument()
        expect(getByText('Context')).toBeInTheDocument()
      })
      it('should not exist when "Linkage" tab is not selected', () => {
        const [renderResult] = setup()
        const { queryByText } = renderResult

        expect(queryByText(HEADING.SLACK_LINKAGE)).not.toBeInTheDocument()
        expect(queryByText('Incoming webhook URL')).not.toBeInTheDocument()
        expect(queryByText('Context')).not.toBeInTheDocument()
      })
      it('should exist "Send a test message" button when online', () => {
        const [renderResult] = setup()
        const { getByText, queryByText } = renderResult
        act(() => {
          fireEvent.click(getByText(TAB.LINKAGE))
        })

        expect(getByText(LABEL_BUTTON_SEND_A_TEST_MESSAGE)).toBeInTheDocument()
        expect(queryByText(LABEL_BUTTON_OFFLINE)).not.toBeInTheDocument()
      })
      it('should to be disabled "Send a test message" when "Incoming webhook URL" is not set or invalid', () => {
        const [renderResult] = setup()
        const { getByText } = renderResult
        act(() => {
          fireEvent.click(getByText(TAB.LINKAGE))
        })
        expect(getByText(LABEL_BUTTON_SEND_A_TEST_MESSAGE)).toBeDisabled()
      })

      it('should to be enabled "Send a test message" when "incoming Webhook URL" is set and valid', () => {
        const [renderResult] = setup(
          makeSettingsTestState({
            ...settingsInitialState,
            slack: {
              ...settingsInitialState.slack,
              incomingWebhookUrl:
                'https://hooks.slack.com/services/xxxxxxxxx/xxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxx',
            },
          })
        )
        const { getByText } = renderResult
        act(() => {
          fireEvent.click(getByText(TAB.LINKAGE))
        })

        expect(getByText(LABEL_BUTTON_SEND_A_TEST_MESSAGE)).toBeEnabled()
      })

      it('should exist disabled "(offline)" button when offline', () => {
        const appState = {
          ...INITIAL_STATE,
          running: { ...runningInitialState, onLine: false },
        }
        const [renderResult] = setup(appState)
        const { getByText, queryByText } = renderResult
        act(() => {
          fireEvent.click(getByText(TAB.LINKAGE))
        })
        const offLineButton = getByText(LABEL_BUTTON_OFFLINE)

        expect(offLineButton).toBeInTheDocument()
        expect(offLineButton).toBeDisabled()
        expect(
          queryByText(LABEL_BUTTON_SEND_A_TEST_MESSAGE)
        ).not.toBeInTheDocument()
      })
    })
  })
})
