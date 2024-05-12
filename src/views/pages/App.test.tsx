/**
 * @file "App" component unit tests
 */
import React from 'react'
import { MemoryRouter as Router } from 'react-router-dom'
import { AnyAction, Store } from 'redux'
import dayjs from 'dayjs'

import { AppState } from '../../state/store'
import App from './App'

import { RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  beforeAll(() => {
    window.scrollTo = jest.fn()
  })

  it('should have an application name.', () => {
    setup()
    expect(screen.getByText('Working time around')).toBeInTheDocument()
  })

  it('should have timer icon.', () => {
    setup()
    expect(screen.getByText('timer')).toBeInTheDocument()
  })

  it('should have today, list, and settings action icon', () => {
    setup()
    expect(screen.getByText('today')).toBeInTheDocument()
    expect(screen.getByText('list')).toBeInTheDocument()
    expect(screen.getByText('settings')).toBeInTheDocument()
  })

  it('should change content to current state when click today action icon', async () => {
    const dj = dayjs(new Date())

    setup()
    await userEvent.click(screen.getByText(dj.format('ll')))

    expect(screen.getByText(dj.format('ll'))).toBeInTheDocument()
    expect(screen.getByText('Time')).toBeInTheDocument()
    expect(screen.getByText('Memo')).toBeInTheDocument()
  })

  it('should change content to monthly list when click list action icon', async () => {
    setup()
    await userEvent.click(screen.getByText('list'))

    expect(
      screen.getByText(dayjs(new Date()).format('MMM YYYY'))
    ).toBeInTheDocument()
  })

  it('should change content to settings when click settings action icon', async () => {
    setup()
    await userEvent.click(screen.getByText('settings'))

    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('should report "Not found" when the path is invalid.', () => {
    setup('/not-exist')
    expect(screen.getByText('Not found')).toBeInTheDocument()
  })
})
