/**
 * @file 'List' component unit tests
 */
import React from 'react'
import { Route } from 'react-router-dom'
import { AnyAction, Store } from 'redux'
import dayjs from 'dayjs'

import { AppState, INITIAL_STATE } from '../../state/store'
import List from './List'

import { act, cleanup, fireEvent, RenderResult } from '@testing-library/react'
import { renderWithProvider } from '../componentTestUtilities'
import { recordsTypes } from '../../state/ducks/records'

describe('"List" template', () => {
  const TESTID_MEDIAN_START = 'median-start'
  const TESTID_MEDIAN_STOP = 'median-stop'

  function setup(
    route = '/2019/1',
    state: AppState = INITIAL_STATE
  ): [RenderResult, Store<AppState, AnyAction>] {
    return renderWithProvider(
      <Route
        exact
        path="/:year(\d{4})/:month([1-9]|10|11|12)"
        component={List}
      />,
      route,
      state
    )
  }

  afterEach(cleanup)

  it.each([[2019, 1], [2018, 12]])(
    'should exist an formatted year %i and month %i heading',
    (year, month) => {
      const target = dayjs(new Date(year, month - 1, 1))
      const [renderResult] = setup(target.format('/YYYY/M'))
      const { getByText } = renderResult
      expect(getByText(target.format('MMM YYYY'))).toBeInTheDocument()
    }
  )

  it('should exist "prev" and "next" icon links', () => {
    const [renderResult] = setup()
    const { getByText } = renderResult
    expect(getByText('navigate_before')).toBeInTheDocument()
    expect(getByText('navigate_next')).toBeInTheDocument()
  })

  it('should exist a "Send mail" button', () => {
    const [renderResult] = setup()
    const { getByText } = renderResult
    expect(getByText('Send mail')).toBeInTheDocument()
  })

  it.each(Array.from(Array(12).keys()))(
    'should exist date rows for that month(%i)',
    monthIndex => {
      const target = dayjs(new Date())
        .month(monthIndex)
        .startOf('month')
      const [renderResult] = setup(target.format('/YYYY/M'))
      const { getByText } = renderResult

      Array.from(Array(target.daysInMonth()), (_, i) =>
        target.set('date', i + 1)
      ).forEach(date => {
        expect(getByText(date.format('D(ddd)'))).toBeInTheDocument()
      })
    }
  )

  it('should exist a button to that date page in each date rows', () => {
    const dj = dayjs(new Date())
    const [renderResult] = setup(dj.format('/YYYY/M'))
    const { getAllByText } = renderResult
    expect(getAllByText('…')).toHaveLength(dj.daysInMonth())
  })

  it('should exist "Median" row heading', () => {
    const [renderResult] = setup()
    const { getByText } = renderResult
    expect(getByText('Median')).toBeInTheDocument()
  })

  it('should be empty the median start time when the start time list is empty', () => {
    const [renderResult] = setup()
    const { getByTestId } = renderResult
    expect(getByTestId(TESTID_MEDIAN_START)).toHaveTextContent('')
  })

  it.each([
    { month: '/2019/1', starts: ['20190101T0900'], expected: '09:00' },
    {
      month: '/2019/1',
      starts: ['20190101T0900', '20190110T1000'],
      expected: '09:30',
    },
    {
      month: '/2019/1',
      starts: ['20190101T0900', '20190123T0923', '20190131T1000'],
      expected: '09:23',
    },
  ])(
    'should be exist the median start time when the start time list is not empty',
    table => {
      const recordsState: recordsTypes.RecordsState = {
        records: {},
      }
      table.starts.forEach(start => {
        const dj = dayjs(start)
        recordsState.records[dj.format('YYYYMMDD')] = {
          starts: [dayjs(start).toDate()],
          stops: [],
          memos: [],
          breakTimeLengthsMin: [],
        }
      })

      const state: AppState = {
        ...INITIAL_STATE,
        records: recordsState,
      }

      const [renderResult] = setup(table.month, state)
      const { getByTestId } = renderResult
      expect(getByTestId(TESTID_MEDIAN_START)).toHaveTextContent(table.expected)
    }
  )

  it('should be empty the median stop time when the stop time list is empty', () => {
    const [renderResult] = setup()
    const { getByTestId } = renderResult
    expect(getByTestId(TESTID_MEDIAN_STOP)).toHaveTextContent('')
  })

  it.each([
    { month: '/2019/1', stops: ['20190101T1833'], expected: '18:33' },
    {
      month: '/2019/1',
      stops: ['20190101T1800', '20190110T1930'],
      expected: '18:45',
    },
    {
      month: '/2019/1',
      stops: ['20190101T1800', '20190123T1946', '20190131T200'],
      expected: '19:46',
    },
  ])(
    'should be exist the median stop time when the stop time list is not empty',
    table => {
      const recordsState: recordsTypes.RecordsState = {
        records: {},
      }
      table.stops.forEach(stop => {
        const dj = dayjs(stop)
        recordsState.records[dj.format('YYYYMMDD')] = {
          starts: [],
          stops: [dayjs(stop).toDate()],
          memos: [],
          breakTimeLengthsMin: [],
        }
      })

      const state: AppState = {
        ...INITIAL_STATE,
        records: recordsState,
      }

      const [renderResult] = setup(table.month, state)
      const { getByTestId } = renderResult
      expect(getByTestId(TESTID_MEDIAN_STOP)).toHaveTextContent(table.expected)
    }
  )

  it('should move to the previous month when click "prev" icon link', () => {
    const dj = dayjs(new Date())
    const [renderResult] = setup(dj.format('/YYYY/M'))
    const { getByText } = renderResult
    act(() => {
      fireEvent.click(getByText('navigate_before'))
    })
    expect(
      getByText(dj.add(-1, 'month').format('MMM YYYY'))
    ).toBeInTheDocument()
  })

  it('should move to the next month when click "next" icon link', () => {
    const dj = dayjs(new Date())
    const [renderResult] = setup(dj.format('/YYYY/M'))
    const { getByText } = renderResult
    act(() => {
      fireEvent.click(getByText('navigate_next'))
    })
    expect(getByText(dj.add(1, 'month').format('MMM YYYY'))).toBeInTheDocument()
  })
})
