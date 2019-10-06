/**
 * @file "App" component unit tests
 */
import React from 'react'
import { MemoryRouter as Router } from 'react-router-dom'
import { AnyAction, Store } from 'redux'
import dayjs from 'dayjs'

import { AppState } from '../../state/store'
import App from './App'

import { act, cleanup, fireEvent, RenderResult } from '@testing-library/react'
import { renderWithProvider } from '../componentTestUtilities'

describe('App', () => {
  function setup(route = '/'): [RenderResult, Store<AppState, AnyAction>] {
    return renderWithProvider(
      <Router initialEntries={[route]}>
        <App />
      </Router>,
      route
    )
  }

  afterEach(cleanup)

  it('should have an application name.', () => {
    const [renderResult] = setup()
    const { getByText } = renderResult
    expect(getByText('Working time around')).toBeInTheDocument()
  })

  it('should have timer icon.', () => {
    const [renderResult] = setup()
    const { getByText } = renderResult
    expect(getByText('timer')).toBeInTheDocument()
  })

  it('should have today, list, and settings action icon', () => {
    const [renderResult] = setup()
    const { getByText } = renderResult
    expect(getByText('today')).toBeInTheDocument()
    expect(getByText('list')).toBeInTheDocument()
    expect(getByText('settings')).toBeInTheDocument()
  })

  it('should change content to current state when click today action icon', () => {
    const dj = dayjs(new Date())

    const [renderResult] = setup()
    const { getByText } = renderResult
    act(() => {
      fireEvent.click(getByText(dj.format('ll')))
    })
    expect(getByText(dj.format('ll'))).toBeInTheDocument()
    expect(getByText('Time')).toBeInTheDocument()
    expect(getByText('Memo')).toBeInTheDocument()
  })

  it('should change content to monthly list when click list action icon', () => {
    const [renderResult] = setup()
    const { getByText } = renderResult
    act(() => {
      fireEvent.click(getByText('list'))
    })
    expect(getByText(dayjs(new Date()).format('MMM YYYY'))).toBeInTheDocument()
  })

  it('should change content to settings when click settings action icon', () => {
    const [renderResult] = setup()
    const { getByText } = renderResult
    act(() => {
      fireEvent.click(getByText('settings'))
    })
    expect(getByText('Settings')).toBeInTheDocument()
  })

  it('should report "Not found" when the path is invalid.', () => {
    const [renderResult] = setup('/not-exist')
    const { getByText } = renderResult
    expect(getByText('Not found')).toBeInTheDocument()
  })
})
