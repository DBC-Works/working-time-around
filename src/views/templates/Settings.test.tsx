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

  let renderResult: RenderResult

  beforeEach(() => {
    renderResult = setup()[0]
  })

  afterEach(cleanup)

  it('should exist "Settings" heading', () => {
    const { getByText } = renderResult
    expect(getByText('Settings')).toBeInTheDocument()
  })

  it('should exist "Send to mail address" and "Language" heading', () => {
    const { getByText } = renderResult
    expect(getByText('Send to mail address')).toBeInTheDocument()
    expect(getByText('Language')).toBeInTheDocument()
  })
})
