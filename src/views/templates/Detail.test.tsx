/**
 * @file 'Detail' component unit tests
 */
import React from 'react'
import { Route } from 'react-router-dom'
import { AnyAction, Store } from 'redux'
import dayjs, { Dayjs } from 'dayjs'

import {
  INITIAL_STATE as recordsInitialState,
  DailyRecord,
  RecordsState,
} from '../../state/ducks/records'
import { AppState, INITIAL_STATE } from '../../state/store'
import List from './List'
import Detail from './Detail'

import { RenderResult, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  function makeRecordsTestState(records: RecordsState): AppState {
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

  describe('Content header', () => {
    beforeEach(() => {
      setup(dj.format(PATH_DETAIL))[0]
    })

    it('should exist date text heading', () => {
      expect(screen.getByText(dj.format('ll'))).toBeInTheDocument()
    })

    it('should move to the previous day when click "prev" icon link', () => {
      userEvent.click(screen.getByText('navigate_before'))

      expect(
        screen.getByText(dj.add(-1, 'day').format('ll'))
      ).toBeInTheDocument()
    })

    it('should move to the next month when click "next" icon link', () => {
      userEvent.click(screen.getByText('navigate_next'))

      expect(
        screen.getByText(dj.add(1, 'day').format('ll'))
      ).toBeInTheDocument()
    })
  })

  describe('Time', () => {
    beforeEach(() => {
      setup(dj.format(PATH_DETAIL))[0]
    })

    it('should exist heading', () => {
      expect(screen.getByText('Time')).toBeInTheDocument()
    })
  })

  describe('Memo', () => {
    beforeEach(() => {
      setup(dj.format(PATH_DETAIL))[0]
    })

    it('should exist heading', () => {
      expect(screen.getByText('Memo')).toBeInTheDocument()
    })
  })

  describe('Break time length', () => {
    const TEST_ID_BREAK_TIME_LENGTH = 'break-time-length'
    const LITERAL_NO_SELECTION = '--'

    function makeTestRecord(breakTimeLengthsMin: number[] | null): DailyRecord {
      return {
        starts: [],
        stops: [],
        memos: [],
        breakTimeLengthsMin:
          breakTimeLengthsMin !== null ? breakTimeLengthsMin : [],
      }
    }

    function makeTestState(
      dj: Dayjs,
      breakTimeLengthsMin: number[] | null
    ): RecordsState {
      const testState = { ...recordsInitialState }
      testState.records[dj.format(KEY_RECORD)] = makeTestRecord(
        breakTimeLengthsMin
      )
      return testState
    }

    it('should exist heading', () => {
      setup(dj.format(PATH_DETAIL))
      expect(screen.getByText('Break time length')).toBeInTheDocument()
    })

    it('should exist break time length select component', () => {
      setup(dj.format(PATH_DETAIL))
      const { getByTestId } = within(
        screen.getByTestId(TEST_ID_BREAK_TIME_LENGTH)
      )
      expect(getByTestId('time-select')).toBeInTheDocument()
    })
    it('should not be selected if break time length is not set', () => {
      setup(
        dj.format(PATH_DETAIL),
        makeRecordsTestState(makeTestState(dj, null))
      )
      const { getAllByDisplayValue } = within(
        screen.getByTestId(TEST_ID_BREAK_TIME_LENGTH)
      )
      expect(getAllByDisplayValue(LITERAL_NO_SELECTION)).toHaveLength(2)
    })
    it('should be selected if break time length is set', () => {
      setup(
        dj.format(PATH_DETAIL),
        makeRecordsTestState(makeTestState(dj, [95]))
      )
      const { getByDisplayValue } = within(
        screen.getByTestId(TEST_ID_BREAK_TIME_LENGTH)
      )
      expect(getByDisplayValue('01')).toBeInTheDocument()
      expect(getByDisplayValue(':35')).toBeInTheDocument()
    })
    it.each([
      { lengthsMin: [60], hour: '01', minute: ':00' },
      { lengthsMin: [60, 120], hour: '02', minute: ':00' },
    ])('should be able to change', (table) => {
      setup(
        dj.format(PATH_DETAIL),
        makeRecordsTestState(makeTestState(dj, table.lengthsMin))
      )
      const { getByDisplayValue, queryByDisplayValue } = within(
        screen.getByTestId(TEST_ID_BREAK_TIME_LENGTH)
      )
      expect(getByDisplayValue(table.hour)).toBeInTheDocument()
      expect(getByDisplayValue(table.minute)).toBeInTheDocument()

      userEvent.selectOptions(getByDisplayValue(':00') as HTMLElement, '45')

      expect(getByDisplayValue(table.hour)).toBeInTheDocument()
      expect(getByDisplayValue(':45')).toBeInTheDocument()
      expect(queryByDisplayValue(LITERAL_NO_SELECTION)).not.toBeInTheDocument()

      userEvent.selectOptions(getByDisplayValue(table.hour) as HTMLElement, '0')
      expect(getByDisplayValue('00')).toBeInTheDocument()
      expect(getByDisplayValue(':45')).toBeInTheDocument()
      expect(queryByDisplayValue(LITERAL_NO_SELECTION)).not.toBeInTheDocument()
    })
    // eslint-disable-next-line prettier/prettier
    it.each([
      { value: '1', expected: '01' },
      { value: '0', expected: '00' },
    ])(
      'should be set minute to "00" automatically when not selected and hour is selected',
      (table) => {
        setup(
          dj.format(PATH_DETAIL),
          makeRecordsTestState(makeTestState(dj, null))
        )
        const { getAllByDisplayValue, getByDisplayValue } = within(
          screen.getByTestId(TEST_ID_BREAK_TIME_LENGTH)
        )

        userEvent.selectOptions(
          (getAllByDisplayValue(LITERAL_NO_SELECTION) as HTMLElement[])[0],
          table.value
        )

        expect(getByDisplayValue(table.expected)).toBeInTheDocument()
        expect(getByDisplayValue(':00')).toBeInTheDocument()
      }
    )
    it.each([
      { value: '45', expected: ':45' },
      { value: '0', expected: ':00' },
    ])(
      'should be set hour to "00" automatically when not selected and minute is selected',
      (table) => {
        setup(
          dj.format(PATH_DETAIL),
          makeRecordsTestState(makeTestState(dj, null))
        )
        const { getAllByDisplayValue, getByDisplayValue } = within(
          screen.getByTestId(TEST_ID_BREAK_TIME_LENGTH)
        )
        userEvent.selectOptions(
          (getAllByDisplayValue(LITERAL_NO_SELECTION) as HTMLElement[])[1],
          table.value
        )

        expect(getByDisplayValue('00')).toBeInTheDocument()
        expect(getByDisplayValue(table.expected)).toBeInTheDocument()
      }
    )
  })

  describe('Floating action button', () => {
    beforeEach(() => {
      setup(dj.format(PATH_DETAIL))[0]
    })

    it('should move to list of month including the day when click "Back to list" fab link', () => {
      userEvent.click(screen.getByText('list'))

      expect(screen.getByText(dj.format('MMM YYYY'))).toBeInTheDocument()
    })
  })
})
