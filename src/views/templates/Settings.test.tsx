/**
 * @file 'Settings' component unit tests
 */
import React from 'react'
import { AnyAction, Store } from 'redux'

import { AppState } from '../../state/store'
import Settings from './Settings'

import { cleanup, RenderResult } from '@testing-library/react'
import { renderWithProvider } from '../componentTestUtilities'

describe('"Settings" template', () => {
  function setup(): [RenderResult, Store<AppState, AnyAction>] {
    return renderWithProvider(<Settings />, '/settings')
  }

  afterEach(cleanup)

  it('should exist "Settings" heading', () => {
    const [renderResult] = setup()
    const { getByText } = renderResult
    expect(getByText('Settings')).toBeInTheDocument()
  })
})
