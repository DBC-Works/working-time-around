/**
 * @file 'NotFound' component unit tests
 */
import React from 'react'
import { AnyAction, Store } from 'redux'

import { AppState } from '../../state/store'
import NotFound from './NotFound'

import { RenderResult, screen } from '@testing-library/react'
import { renderWithProvider } from '../componentTestUtilities'

describe('"NotFound" template', () => {
  function setup(): [RenderResult, Store<AppState, AnyAction>] {
    return renderWithProvider(<NotFound />, '/not-exist')
  }

  it('should report "Not found"', () => {
    setup()
    expect(screen.getByText('Not found')).toBeInTheDocument()
  })
})
