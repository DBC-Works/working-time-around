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

describe('"List" template', () => {
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
    'should exist an formatted year and month heading',
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
    'should exist date rows for that month',
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
