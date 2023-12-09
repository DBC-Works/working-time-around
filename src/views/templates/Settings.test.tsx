/**
 * @file 'Settings' component unit tests
 */
import React from 'react'
import { AnyAction, Store } from 'redux'

import { INITIAL_STATE as runningInitialState } from '../../state/ducks/running'
import {
  INITIAL_STATE as settingsInitialState,
  SettingsState,
} from '../../state/ducks/settings'
import { AppState, INITIAL_STATE } from '../../state/store'
import Settings from './Settings'

import { act, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  function makeSettingsTestState(settings: SettingsState): AppState {
    return {
      ...INITIAL_STATE,
      settings,
    }
  }

  beforeAll(() => {
    window.scrollTo = jest.fn()
  })

  it('should exist "Settings" heading', () => {
    setup()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })
  it('should exist "Operation", "Record" and "Linkage" tab heading', () => {
    setup()

    expect(screen.getByText(TAB.OPERATION)).toBeInTheDocument()
    expect(screen.getByText(TAB.RECORD)).toBeInTheDocument()
    expect(screen.getByText(TAB.LINKAGE)).toBeInTheDocument()
  })

  describe('"Operation" tab', () => {
    describe('Default break time length', () => {
      const LITERAL_NO_SELECTION = '--'

      it('should exist when "Operation" tab is selected', () => {
        setup()
        expect(
          screen.getByText(HEADING.DEFAULT_BREAK_TIME_LENGTH)
        ).toBeInTheDocument()
      })
      it('should not exist when "Operation" tab is not selected', async () => {
        setup()
        await userEvent.click(screen.getByText(TAB.LINKAGE))

        expect(
          screen.queryByText(HEADING.DEFAULT_BREAK_TIME_LENGTH)
        ).not.toBeInTheDocument()
      })
      it('should exist break time length select component', () => {
        setup()
        expect(screen.getByTestId('time-select')).toBeInTheDocument()
      })
      it('should exist clear icon button component', () => {
        setup()
        const clearButton = screen.getByText('clear')

        expect(clearButton).toBeInTheDocument()
        expect(clearButton).not.toBeDisabled()
      })
      it('should not be selected if break time length is not set', () => {
        setup(
          makeSettingsTestState({
            ...settingsInitialState,
            defaultBreakTimeLengthMin: undefined,
          })
        )

        expect(screen.getAllByDisplayValue(LITERAL_NO_SELECTION)).toHaveLength(
          2
        )
        const clearButton = screen.getByRole('button', { name: 'clear' })
        expect(clearButton).toBeInTheDocument()
        expect(clearButton).toBeDisabled()
      })
      it('should be selected if break time length is set', () => {
        setup(
          makeSettingsTestState({
            ...INITIAL_STATE.settings,
            defaultBreakTimeLengthMin: 95,
          })
        )

        expect(screen.getByDisplayValue('01')).toBeInTheDocument()
        expect(screen.getByDisplayValue(':35')).toBeInTheDocument()
        const clearButton = screen.getByText('clear')
        expect(clearButton).toBeInTheDocument()
        expect(clearButton).not.toBeDisabled()
      })
      it('should be able to change', (done) => {
        setup()
        const clearButton = screen.getByText('clear')
        expect(screen.getByDisplayValue('01')).toBeInTheDocument()
        expect(screen.getByDisplayValue(':00')).toBeInTheDocument()

        act(() => {
          window.requestAnimationFrame(async () => {
            await userEvent.selectOptions(
              screen.getByDisplayValue(':00') as HTMLElement,
              '45'
            )

            expect(screen.getByDisplayValue('01')).toBeInTheDocument()
            expect(screen.getByDisplayValue(':45')).toBeInTheDocument()
            expect(
              screen.queryByDisplayValue(LITERAL_NO_SELECTION)
            ).not.toBeInTheDocument()
            expect(clearButton).toBeInTheDocument()
            expect(clearButton).not.toBeDisabled()

            await userEvent.selectOptions(
              screen.getByDisplayValue('01') as HTMLElement,
              '0'
            )

            expect(screen.getByDisplayValue('00')).toBeInTheDocument()
            expect(screen.getByDisplayValue(':45')).toBeInTheDocument()
            expect(
              screen.queryByDisplayValue(LITERAL_NO_SELECTION)
            ).not.toBeInTheDocument()
            expect(clearButton).not.toBeDisabled()

            done()
          })
        })
      })
      it('should be set minute to "00" automatically when not selected and hour is selected', (done) => {
        const tables = [
          { value: '1', expected: '01' },
          { value: '0', expected: '00' },
        ]
        const table = tables[0]

        setup(
          makeSettingsTestState({
            ...INITIAL_STATE.settings,
            defaultBreakTimeLengthMin: undefined,
          })
        )
        const clearButton = screen.getByText('clear')

        act(() => {
          window.requestAnimationFrame(async () => {
            await userEvent.selectOptions(
              screen.getAllByDisplayValue(LITERAL_NO_SELECTION)[0],
              table.value
            )

            expect(screen.getByDisplayValue(table.expected)).toBeInTheDocument()
            expect(screen.getByDisplayValue(':00')).toBeInTheDocument()
            expect(clearButton).toBeInTheDocument()
            expect(clearButton).not.toBeDisabled()

            done()
          })
        })
      })
      it('should be set hour to "00" automatically when not selected and minute is selected', (done) => {
        const tables = [
          { value: '45', expected: ':45' },
          { value: '0', expected: ':00' },
        ]
        const table = tables[1]
        setup(
          makeSettingsTestState({
            ...INITIAL_STATE.settings,
            defaultBreakTimeLengthMin: undefined,
          })
        )
        const clearButton = screen.getByText('clear')
        expect(clearButton).toBeInTheDocument()

        act(() => {
          window.requestAnimationFrame(async () => {
            await userEvent.selectOptions(
              screen.getAllByDisplayValue(LITERAL_NO_SELECTION)[1],
              table.value
            )

            expect(screen.getByDisplayValue('00')).toBeInTheDocument()
            expect(screen.getByDisplayValue(table.expected)).toBeInTheDocument()
            expect(clearButton).not.toBeDisabled()

            done()
          })
        })
      })
      it('should be clear the selection when "clear" button is selected', async () => {
        const [, store] = setup(
          makeSettingsTestState({
            ...INITIAL_STATE.settings,
            defaultBreakTimeLengthMin: 5,
          })
        )
        expect(screen.getByDisplayValue('00')).toBeInTheDocument()
        expect(screen.getByDisplayValue(':05')).toBeInTheDocument()
        const clearButton = screen.getByRole('button', {
          name: 'clear',
        })
        expect(clearButton).not.toBeDisabled()

        act(async () => {
          await userEvent.click(clearButton)
        })

        expect(
          await screen.findAllByDisplayValue(LITERAL_NO_SELECTION)
        ).toHaveLength(2)
        expect(clearButton).toBeDisabled()
        const {
          settings: { defaultBreakTimeLengthMin },
        } = store.getState()
        expect(defaultBreakTimeLengthMin).toBeUndefined()
      })
    })

    describe('Language', () => {
      it('should exist when "Operation" tab is selected', () => {
        setup()
        expect(screen.getByText(HEADING.LANGUAGE)).toBeInTheDocument()
      })
      it('should not exist when "Operation" tab is not selected', async () => {
        setup()
        await userEvent.click(screen.getByText(TAB.LINKAGE))

        expect(screen.queryByText(HEADING.LANGUAGE)).not.toBeInTheDocument()
      })

      it('should change the display language to the selected language', (done) => {
        setup()

        act(() => {
          window.requestAnimationFrame(async () => {
            await userEvent.selectOptions(
              screen.getByDisplayValue('English') as HTMLElement,
              'ja'
            )

            expect(screen.getByText('言語')).toBeInTheDocument()
            expect(screen.getByDisplayValue('日本語')).toBeInTheDocument()

            done()
          })
        })
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

      it('should exist when "Record" tab is selected', async () => {
        setup()
        await userEvent.click(screen.getByText(TAB.RECORD))

        expect(screen.getByText(HEADING.EXPORT)).toBeInTheDocument()
      })
      it('should not exist when "Record" tab is not selected', () => {
        setup()
        expect(screen.queryByText(HEADING.EXPORT)).not.toBeInTheDocument()
      })
      it('should exist "Start download" link', async () => {
        setup()
        await userEvent.click(screen.getByText(TAB.RECORD))

        const startDownloadAnchor = screen.getByText(LABEL_DOWNLOAD)
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
      it('should exist when "Record" tab is selected', async () => {
        setup()
        await userEvent.click(screen.getByText(TAB.RECORD))

        expect(screen.getByText(HEADING.IMPORT)).toBeInTheDocument()
      })
      it('should not exist when "Record" tab is not selected', () => {
        setup()
        expect(screen.queryByText(HEADING.IMPORT)).not.toBeInTheDocument()
      })
      it('should exist file upload element and "Browse" button', async () => {
        setup()
        await userEvent.click(screen.getByText(TAB.RECORD))

        expect(screen.getByTestId('file-upload')).toBeInTheDocument()
        expect(screen.getByText('Browse...')).toBeInTheDocument()
      })
      it('should exist checkbox to import settings', async () => {
        setup()
        await userEvent.click(screen.getByText(TAB.RECORD))

        const checkbox = screen.getByLabelText('Import settings')
        expect(checkbox).toBeInTheDocument()
        expect(checkbox).not.toBeChecked()
        const label = screen.getByText('Import settings')
        expect(label).toBeInTheDocument()
      })
      it('should check the import settings checkbox after checkbox click', async () => {
        setup()
        await userEvent.click(screen.getByText(TAB.RECORD))
        const checkbox = screen.getByLabelText('Import settings')
        await userEvent.click(checkbox)

        expect(checkbox).toBeChecked()
      })
    })
  })

  describe('"Linkage" tab', () => {
    describe('Send to mail address', () => {
      it('should exist when "Linkage" tab is selected', async () => {
        setup()
        await userEvent.click(screen.getByText(TAB.LINKAGE))

        expect(
          screen.getByText(HEADING.SEND_TO_MAIL_ADDRESS)
        ).toBeInTheDocument()
      })
      it('should not exist when "Linkage" tab is not selected', () => {
        setup()
        expect(
          screen.queryByText(HEADING.SEND_TO_MAIL_ADDRESS)
        ).not.toBeInTheDocument()
      })

      it('should update mail address to entered', async () => {
        setup()
        await userEvent.click(screen.getByText(TAB.LINKAGE))
        const mailAddress = screen.getByLabelText('Send to mail address')
        await userEvent.type(mailAddress, 'updated@example.com')

        expect(
          screen.getByDisplayValue('updated@example.com')
        ).toBeInTheDocument()
      })
    })

    describe('Slack linkage', () => {
      const LABEL_BUTTON_SEND_A_TEST_MESSAGE = 'Send a test message'
      const LABEL_BUTTON_OFFLINE = '(Offline)'

      it('should exist when "Linkage" tab is selected', async () => {
        setup()
        await userEvent.click(screen.getByText(TAB.LINKAGE))

        expect(screen.getByText(HEADING.SLACK_LINKAGE)).toBeInTheDocument()
        expect(screen.getByText('Incoming webhook URL')).toBeInTheDocument()
        expect(screen.getByText('Context')).toBeInTheDocument()
      })
      it('should not exist when "Linkage" tab is not selected', () => {
        setup()
        expect(
          screen.queryByText(HEADING.SLACK_LINKAGE)
        ).not.toBeInTheDocument()
        expect(
          screen.queryByText('Incoming webhook URL')
        ).not.toBeInTheDocument()
        expect(screen.queryByText('Context')).not.toBeInTheDocument()
      })
      it('should exist "Send a test message" button when online', async () => {
        setup()
        await userEvent.click(screen.getByText(TAB.LINKAGE))

        expect(
          screen.getByText(LABEL_BUTTON_SEND_A_TEST_MESSAGE)
        ).toBeInTheDocument()
        expect(screen.queryByText(LABEL_BUTTON_OFFLINE)).not.toBeInTheDocument()
      })
      it('should to be disabled "Send a test message" when "Incoming webhook URL" is not set or invalid', async () => {
        setup()
        await userEvent.click(screen.getByText(TAB.LINKAGE))

        expect(
          screen.getByRole('button', { name: LABEL_BUTTON_SEND_A_TEST_MESSAGE })
        ).toBeDisabled()
      })

      it('should to be enabled "Send a test message" when "incoming Webhook URL" is set and valid', async () => {
        setup(
          makeSettingsTestState({
            ...settingsInitialState,
            slack: {
              ...settingsInitialState.slack,
              incomingWebhookUrl:
                'https://hooks.slack.com/services/xxxxxxxxx/xxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxx',
            },
          })
        )
        await userEvent.click(screen.getByText(TAB.LINKAGE))

        expect(screen.getByText(LABEL_BUTTON_SEND_A_TEST_MESSAGE)).toBeEnabled()
      })

      it('should exist disabled "(offline)" button when offline', async () => {
        setup({
          ...INITIAL_STATE,
          running: { ...runningInitialState, onLine: false },
        })
        await userEvent.click(screen.getByText(TAB.LINKAGE))

        const offLineButton = screen.getByRole('button', {
          name: LABEL_BUTTON_OFFLINE,
        })
        expect(offLineButton).toBeInTheDocument()
        expect(offLineButton).toBeDisabled()
        expect(
          screen.queryByRole('button', {
            name: LABEL_BUTTON_SEND_A_TEST_MESSAGE,
          })
        ).not.toBeInTheDocument()
      })

      it('should update incoming webhook url to entered', async () => {
        setup()
        await userEvent.click(screen.getByText(TAB.LINKAGE))
        const url = screen.getByLabelText('Incoming webhook URL')
        await userEvent.type(
          url,
          'https://hooks.slack.com/services/xxxxxxxxx/xxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxx'
        )

        expect(
          screen.getByDisplayValue(
            'https://hooks.slack.com/services/xxxxxxxxx/xxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxx'
          )
        ).toBeInTheDocument()
      })

      it('should update context to entered', async () => {
        setup()
        await userEvent.click(screen.getByText(TAB.LINKAGE))
        await userEvent.type(
          screen.getByLabelText('Context'),
          'Updated slack context'
        )

        expect(
          screen.getByDisplayValue('Updated slack context')
        ).toBeInTheDocument()
      })
    })
  })
})
