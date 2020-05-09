/**
 * @file 'CurrentState' component unit tests
 */
import React from 'react'
import { Route } from 'react-router-dom'
import { AnyAction, Store } from 'redux'
import dayjs from 'dayjs'

import { RecordsState, KEY_RECORD } from '../../state/ducks/records'
import { RunningState } from '../../state/ducks/running'
import { AppState, INITIAL_STATE } from '../../state/store'
import CurrentState from './CurrentState'

import { RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProvider } from '../componentTestUtilities'

describe('"CurrentState" template', () => {
  function setup(
    state: AppState = INITIAL_STATE
  ): [RenderResult, Store<AppState, AnyAction>] {
    return renderWithProvider(
      <Route exact path="/" component={CurrentState} />,
      '/',
      state
    )
  }

  beforeAll(() => {
    jest.useFakeTimers()
  })
  afterAll(() => {
    jest.useRealTimers()
  })

  it('should exist current date and time', () => {
    const now = new Date()
    const runningState: RunningState = {
      time: now,
      onLine: true,
      message: '',
      window: {} as Window,
      downloadObjectUrl: '#',
    }
    setup({
      ...INITIAL_STATE,
      running: runningState,
    })

    const dj = dayjs(now)
    expect(screen.getByText(dj.format('ll'))).toBeInTheDocument()
    expect(screen.getByText(dj.format('HH:mm'))).toBeInTheDocument()
  })

  it("should enable start and stop buttons when today's record does not exist", () => {
    setup()

    const startButton = screen.getByRole('button', { name: 'Start' })
    expect(startButton).toBeEnabled()
    const stopButton = screen.getByRole('button', { name: 'Stop' })
    expect(stopButton).toBeEnabled()
  })

  it("should disable start button and enable stop button when today's record exist, start time was recorded and stop time is not record", () => {
    const now = new Date()
    const dj = dayjs(now)
    const record = {
      starts: [now],
      stops: [],
      memos: [],
      breakTimeLengthsMin: [],
    }
    const recordsState: RecordsState = {
      records: {},
    }
    recordsState.records[dj.format(KEY_RECORD)] = record
    setup({
      ...INITIAL_STATE,
      records: recordsState,
    })

    const startButton = screen.getByRole('button', { name: dj.format('HH:mm') })
    expect(startButton).toBeDisabled()
    const stopButton = screen.getByRole('button', { name: 'Stop' })
    expect(stopButton).toBeEnabled()
  })

  it("should disable start and stop buttons when today's record exist, start and stop time was recorded", () => {
    const djStartTime = dayjs()
    const djStopTime = djStartTime.add(8, 'hour')
    const record = {
      starts: [djStartTime.toDate()],
      stops: [djStopTime.toDate()],
      memos: [],
      breakTimeLengthsMin: [],
    }
    const recordsState: RecordsState = {
      records: {},
    }
    recordsState.records[djStartTime.format(KEY_RECORD)] = record
    setup({
      ...INITIAL_STATE,
      records: recordsState,
    })

    const startButton = screen.getByRole('button', {
      name: djStartTime.format('HH:mm'),
    })
    expect(startButton).toBeDisabled()
    const stopButton = screen.getByRole('button', {
      name: djStopTime.format('HH:mm'),
    })
    expect(stopButton).toBeDisabled()
  })

  it('should change the start button to be disabled and update text to clicked time when the button is clicked', () => {
    const [, store] = setup()

    const startButton = screen.getByRole('button', { name: 'Start' })
    expect(startButton).toBeEnabled()

    userEvent.click(startButton)

    expect(startButton).toBeDisabled()
    expect(startButton).not.toHaveTextContent('Start')
    expect(startButton).toHaveTextContent(/^[0-2][0-9]:[0-5][0-9]$/)

    // Record should have a break time length initialized by default setting
    const {
      settings: { defaultBreakTimeLengthMin },
      records: { records },
    } = store.getState()
    const keys = Object.keys(records)
    expect(keys).toHaveLength(1)
    keys.forEach((key) => {
      expect(records[key].breakTimeLengthsMin).toHaveLength(1)
      expect((records[key].breakTimeLengthsMin as number[])[0]).toBe(
        defaultBreakTimeLengthMin
      )
    })
  })

  it('should change buttons to be disabled and update text of the stop button to clicked time when the stop button is clicked', () => {
    const [, store] = setup()

    const startButton = screen.getByRole('button', { name: 'Start' })
    expect(startButton).toBeEnabled()
    const stopButton = screen.getByRole('button', { name: 'Stop' })
    expect(stopButton).toBeEnabled()

    userEvent.click(stopButton)

    expect(startButton).toBeDisabled()
    expect(startButton).toHaveTextContent('Start')
    expect(startButton).not.toHaveTextContent(/^[0-2][0-9]:[0-5][0-9]$/)

    expect(stopButton).toBeDisabled()
    expect(stopButton).not.toHaveTextContent('Start')
    expect(stopButton).toHaveTextContent(/^[0-2][0-9]:[0-5][0-9]$/)

    // Record should have a break time length initialized by default setting
    const {
      settings: { defaultBreakTimeLengthMin },
      records: { records },
    } = store.getState()
    const keys = Object.keys(records)
    expect(keys).toHaveLength(1)
    keys.forEach((key) => {
      expect(records[key].breakTimeLengthsMin).toHaveLength(1)
      expect((records[key].breakTimeLengthsMin as number[])[0]).toBe(
        defaultBreakTimeLengthMin
      )
    })
  })
})
