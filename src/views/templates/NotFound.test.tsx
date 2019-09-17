/**
 * @file 'NotFound' component unit tests
 */
import React from 'react'
import { AnyAction, Store } from 'redux'

import { AppState } from '../../state/store'
import NotFound from './NotFound'

import { cleanup, RenderResult } from '@testing-library/react'
import { renderWithProvider } from '../componentTestUtilities'

describe('"NotFound" template', () => {
  function setup(): [RenderResult, Store<AppState, AnyAction>] {
    return renderWithProvider(<NotFound />, '/not-exist')
  }

  afterEach(cleanup)

  it('should report "Not found"', () => {
    const [renderResult] = setup()
    const { getByText } = renderResult
    expect(getByText('Not found')).toBeInTheDocument()
  })
})
