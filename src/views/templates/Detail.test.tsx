/**
 * @file 'Detail' component unit tests
 */
import React from 'react'
import { Route } from 'react-router-dom'
import { AnyAction, Store } from 'redux'
import dayjs, { Dayjs } from 'dayjs'

import {
  INITIAL_STATE as recordsInitialState,
  recordsTypes,
} from '../../state/ducks/records'
import { AppState, INITIAL_STATE } from '../../state/store'
import List from './List'
import Detail from './Detail'

import {
  act,
  cleanup,
  fireEvent,
  RenderResult,
  within,
} from '@testing-library/react'
import { renderWithProvider } from '../componentTestUtilities'

describe('"Detail" template', () => {
  const PATH_DETAIL = '/YYYY/M/D'
  const KEY_RECORD = 'YYYYMMDD'

  function setup(
    route = '/2019/1/1',
    state: AppState = INITIAL_STATE
  ): [RenderResult, Store<AppState, AnyAction>] {
    return renderWithProvider(
      <>
        <Route
          exact
          path="/:year(\d{4})/:month([1-9]|10|11|12)/:date([1-9]|1[0-9]|2[0-9]|30|31)"
          component={Detail}
        />
        <Route
          exact
          path="/:year(\d{4})/:month([1-9]|10|11|12)"
          component={List}
        />
      </>,
      route,
      state
    )
  }

  function makeRecordsTestState(records: recordsTypes.RecordsState): AppState {
    return {
      ...INITIAL_STATE,
      records,
    }
  }

  let now: Date
  let dj: Dayjs

  beforeAll(() => {
    now = new Date()
    dj = dayjs(now)
  })

  afterEach(cleanup)

  describe('Content header', () => {
    let renderResult: RenderResult

    beforeEach(() => {
      renderResult = setup(dj.format(PATH_DETAIL))[0]
    })

    it('should exist date text heading', () => {
      const { getByText } = renderResult
      expect(getByText(dj.format('ll'))).toBeInTheDocument()
    })

    it('should move to the previous day when click "prev" icon link', () => {
      const { getByText } = renderResult
      act(() => {
        fireEvent.click(getByText('navigate_before'))
      })
      expect(getByText(dj.add(-1, 'day').format('ll'))).toBeInTheDocument()
    })

    it('should move to the next month when click "next" icon link', () => {
      const { getByText } = renderResult
      act(() => {
        fireEvent.click(getByText('navigate_next'))
      })
      expect(getByText(dj.add(1, 'day').format('ll'))).toBeInTheDocument()
    })
  })

  describe('Time', () => {
    let renderResult: RenderResult

    beforeEach(() => {
      renderResult = setup(dj.format(PATH_DETAIL))[0]
    })

    it('should exist heading', () => {
      const { getByText } = renderResult
      expect(getByText('Time')).toBeInTheDocument()
    })
  })

  describe('Memo', () => {
    let renderResult: RenderResult

    beforeEach(() => {
      renderResult = setup(dj.format(PATH_DETAIL))[0]
    })

    it('should exist heading', () => {
      const { getByText } = renderResult
      expect(getByText('Memo')).toBeInTheDocument()
    })
  })

  describe('Break time length', () => {
    const TEST_ID_BREAK_TIME_LENGTH = 'break-time-length'
    const LITERAL_NO_SELECTION = '--'

    function makeTestRecord(
      breakTimeLengthMin: number | null
    ): recordsTypes.DailyRecord {
      return {
        starts: [],
        stops: [],
        memos: [],
        breakTimeLengthsMin:
          breakTimeLengthMin !== null ? [breakTimeLengthMin] : [],
      }
    }

    function makeTestState(
      dj: Dayjs,
      breakTimeLengthMin: number | null
    ): recordsTypes.RecordsState {
      const testState = { ...recordsInitialState }
      testState.records[dj.format(KEY_RECORD)] = makeTestRecord(
        breakTimeLengthMin
      )
      return testState
    }

    it('should exist heading', () => {
      const [renderResult] = setup(dj.format(PATH_DETAIL))
      const { getByText } = renderResult
      expect(getByText('Break time length')).toBeInTheDocument()
    })

    it('should exist break time length select component', () => {
      const [renderResult] = setup(dj.format(PATH_DETAIL))
      const { getByTestId } = within(
        renderResult.getByTestId(TEST_ID_BREAK_TIME_LENGTH)
      )
      expect(getByTestId('time-select')).toBeInTheDocument()
    })
    it('should not be selected if break time length is not set', () => {
      const [renderResult] = setup(
        dj.format(PATH_DETAIL),
        makeRecordsTestState(makeTestState(dj, null))
      )
      const { getAllByDisplayValue } = within(
        renderResult.getByTestId(TEST_ID_BREAK_TIME_LENGTH)
      )
      expect(getAllByDisplayValue(LITERAL_NO_SELECTION)).toHaveLength(2)
    })
    it('should be selected if break time length is set', () => {
      const [renderResult] = setup(
        dj.format(PATH_DETAIL),
        makeRecordsTestState(makeTestState(dj, 95))
      )
      const { getByDisplayValue } = within(
        renderResult.getByTestId(TEST_ID_BREAK_TIME_LENGTH)
      )
      expect(getByDisplayValue('01')).toBeInTheDocument()
      expect(getByDisplayValue(':35')).toBeInTheDocument()
    })
    it('should be able to change', () => {
      const [renderResult] = setup(
        dj.format(PATH_DETAIL),
        makeRecordsTestState(makeTestState(dj, 60))
      )
      const { getByDisplayValue, queryByDisplayValue } = within(
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
      expect(queryByDisplayValue(LITERAL_NO_SELECTION)).not.toBeInTheDocument()

      act(() => {
        fireEvent.change(getByDisplayValue('01') as HTMLElement, {
          target: { value: '0' },
        })
      })
      expect(getByDisplayValue('00')).toBeInTheDocument()
      expect(getByDisplayValue(':45')).toBeInTheDocument()
      expect(queryByDisplayValue(LITERAL_NO_SELECTION)).not.toBeInTheDocument()
    })
    it('should be set minute to "00" automatically when not selected and hour is selected', () => {
      const [renderResult] = setup(
        dj.format(PATH_DETAIL),
        makeRecordsTestState(makeTestState(dj, null))
      )
      const { getAllByDisplayValue, getByDisplayValue } = within(
        renderResult.getByTestId(TEST_ID_BREAK_TIME_LENGTH)
      )
      act(() => {
        fireEvent.change(
          (getAllByDisplayValue(LITERAL_NO_SELECTION) as HTMLElement[])[0],
          {
            target: { value: '1' },
          }
        )
      })
      expect(getByDisplayValue('01')).toBeInTheDocument
      expect(getByDisplayValue(':00')).toBeInTheDocument
    })
    it('should be set hour to "00" automatically when not selected and minute is selected', () => {
      const [renderResult] = setup(
        dj.format(PATH_DETAIL),
        makeRecordsTestState(makeTestState(dj, null))
      )
      const { getAllByDisplayValue, getByDisplayValue } = within(
        renderResult.getByTestId(TEST_ID_BREAK_TIME_LENGTH)
      )
      act(() => {
        fireEvent.change(
          (getAllByDisplayValue(LITERAL_NO_SELECTION) as HTMLElement[])[1],
          {
            target: { value: '45' },
          }
        )
      })
      expect(getByDisplayValue('00')).toBeInTheDocument
      expect(getByDisplayValue(':45')).toBeInTheDocument
    })
  })

  describe('Floating action button', () => {
    let renderResult: RenderResult

    beforeEach(() => {
      renderResult = setup(dj.format(PATH_DETAIL))[0]
    })

    it('should move to list of month including the day when click "Back to list" fab link', () => {
      const { getByText } = renderResult
      act(() => {
        fireEvent.click(getByText('list'))
      })
      expect(getByText(dj.format('MMM YYYY'))).toBeInTheDocument()
    })
  })
})
