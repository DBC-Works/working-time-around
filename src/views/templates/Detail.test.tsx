/**
 * @file 'Detail' component unit tests
 */
import React from 'react'
import { Route } from 'react-router-dom'
import { AnyAction, Store } from 'redux'
import dayjs from 'dayjs'

import { AppState, INITIAL_STATE } from '../../state/store'
import Detail from './Detail'

import { cleanup, RenderResult } from '@testing-library/react'
import { renderWithProvider } from '../componentTestUtilities'

describe('"Detail" template', () => {
  function setup(
    route: string = '/2019/1/1',
    state: AppState = INITIAL_STATE
  ): [RenderResult, Store<AppState, AnyAction>] {
    return renderWithProvider(
      <Route
        exact
        path="/:year(\d{4})/:month([1-9]|10|11|12)/:date([1-9]|1[0-9]|2[0-9]|30|31)"
        component={Detail}
      />,
      route,
      state
    )
  }

  afterEach(cleanup)

  it('should exist date text heading', () => {
    const target = dayjs(new Date())
    const [renderResult] = setup(target.format('/YYYY/M/D'))
    const { getByText } = renderResult
    expect(getByText(target.format('ll'))).toBeInTheDocument()
  })
})
