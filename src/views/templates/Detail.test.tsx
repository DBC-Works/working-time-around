/**
 * @file 'Detail' component unit tests
 */
import React from 'react'
import { Route } from 'react-router-dom'
import { AnyAction, Store } from 'redux'
import dayjs, { Dayjs } from 'dayjs'

import { AppState, INITIAL_STATE } from '../../state/store'
import List from './List'
import Detail from './Detail'

import { act, cleanup, fireEvent, RenderResult } from '@testing-library/react'
import { renderWithProvider } from '../componentTestUtilities'

describe('"Detail" template', () => {
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

  let now: Date
  let dj: Dayjs
  let renderResult: RenderResult

  beforeAll(() => {
    now = new Date()
    dj = dayjs(now)
  })

  beforeEach(() => {
    renderResult = setup(dj.format('/YYYY/M/D'))[0]
  })

  afterEach(cleanup)

  it('should exist date text heading', () => {
    const { getByText } = renderResult
    expect(getByText(dj.format('ll'))).toBeInTheDocument()
  })

  it('should exist "Time" and "Memo" heading', () => {
    const { getByText } = renderResult
    expect(getByText('Time')).toBeInTheDocument()
    expect(getByText('Memo')).toBeInTheDocument()
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

  it('should move to list of month including the day when click "Back to list" fab link', () => {
    const { getByText } = renderResult
    act(() => {
      fireEvent.click(getByText('list'))
    })
    expect(getByText(dj.format('MMM YYYY'))).toBeInTheDocument()
  })
})
