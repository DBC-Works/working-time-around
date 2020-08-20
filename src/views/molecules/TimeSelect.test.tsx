/**
 * @file 'TimeSelect' component unit tests
 */
import React from 'react'
import { IntlProvider } from 'react-intl'
import dayjs from 'dayjs'

import en from '../i18n/en.json'

import TimeSelect from './TimeSelect'

import '@testing-library/jest-dom/extend-expect'
import { act, render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('"TimeSelect" molecule', () => {
  function setup(arg: {
    time?: Date
    onChange?: (time: Date) => void
  }): RenderResult {
    return render(
      <IntlProvider locale={'en'} messages={en}>
        <TimeSelect time={arg.time} onChange={arg.onChange} />
      </IntlProvider>
    )
  }

  it('should be no selection when there is no initial value', () => {
    setup({})

    const hourSelector = screen.getByDisplayValue('')
    expect(hourSelector).toBeInTheDocument()
    expect(hourSelector).toHaveProperty('value', '')
    const minuteSelector = screen.getByDisplayValue('--')
    expect(minuteSelector).toBeInTheDocument()
    expect(minuteSelector).toHaveProperty('value', '')
  })

  it('should be selected time when there is an initial value', () => {
    const time = new Date(2019, 0, 1, 1, 2, 0)
    setup({ time })

    const hourSelector = screen.getByDisplayValue(`0${time.getHours()}`)
    expect(hourSelector).toBeInTheDocument()
    expect(hourSelector).toHaveProperty('value', `${time.getHours()}`)
    const minuteSelector = screen.getByDisplayValue(`:0${time.getMinutes()}`)
    expect(minuteSelector).toBeInTheDocument()
    expect(minuteSelector).toHaveProperty('value', `${time.getMinutes()}`)
  })

  it('should not call callback property when only hour is selected', (done) => {
    const mockOnChange = jest.fn()
    setup({ onChange: mockOnChange })
    const hourSelector = screen.getByDisplayValue('')
    const minuteSelector = screen.getByDisplayValue('--')

    act(() => {
      window.requestAnimationFrame(() => {
        userEvent.selectOptions(hourSelector, '1')

        expect(screen.getByDisplayValue('01')).toBeInTheDocument()
        expect(hourSelector).toHaveProperty('value', '1')
        expect(mockOnChange).not.toHaveBeenCalled()

        userEvent.selectOptions(minuteSelector, '34')

        expect(screen.getByDisplayValue(':34')).toBeInTheDocument()
        expect(minuteSelector).toHaveProperty('value', '34')
        expect(mockOnChange).toHaveBeenCalled()

        done()
      })
    })
  })

  it('should not call callback property when only minute is selected', (done) => {
    const mockOnChange = jest.fn()
    setup({ onChange: mockOnChange })
    const hourSelector = screen.getByDisplayValue('')
    const minuteSelector = screen.getByDisplayValue('--')

    act(() => {
      window.requestAnimationFrame(() => {
        userEvent.selectOptions(minuteSelector, '34')

        expect(screen.getByDisplayValue(':34')).toBeInTheDocument()
        expect(minuteSelector).toHaveProperty('value', '34')
        expect(mockOnChange).not.toHaveBeenCalled()

        userEvent.selectOptions(hourSelector, '1')

        expect(screen.getByDisplayValue('01')).toBeInTheDocument()
        expect(hourSelector).toHaveProperty('value', '1')
        expect(mockOnChange).toHaveBeenCalled()

        done()
      })
    })
  })

  it('should call callback property when there is an initial value and hour is changed', (done) => {
    const time = new Date(2019, 0, 1, 1, 2, 0)
    const mockOnChange = jest.fn()
    setup({ time, onChange: mockOnChange })
    const hourSelector = screen.getByDisplayValue('01')

    act(() => {
      window.requestAnimationFrame(() => {
        userEvent.selectOptions(hourSelector, `${time.getHours() + 1}`)

        expect(
          screen.getByDisplayValue(`0${time.getHours() + 1}`)
        ).toBeInTheDocument()
        expect(hourSelector).toHaveProperty('value', `${time.getHours() + 1}`)
        expect(mockOnChange).toHaveBeenCalledWith(
          dayjs(time).add(1, 'hour').toDate()
        )

        done()
      })
    })
  })

  it('should call callback property when there is an initial value and minute is changed', (done) => {
    const time = new Date(2019, 0, 1, 1, 35, 0)
    const mockOnChange = jest.fn()
    setup({ time, onChange: mockOnChange })
    const minuteSelector = screen.getByDisplayValue(`:${time.getMinutes()}`)

    act(() => {
      window.requestAnimationFrame(() => {
        userEvent.selectOptions(minuteSelector, `${time.getMinutes() - 8}`)

        expect(
          screen.getByDisplayValue(`:${time.getMinutes() - 8}`)
        ).toBeInTheDocument()
        expect(minuteSelector).toHaveProperty(
          'value',
          `${time.getMinutes() - 8}`
        )
        expect(mockOnChange).toHaveBeenCalledWith(
          dayjs(time).add(-8, 'minute').toDate()
        )

        done()
      })
    })
  })
})
