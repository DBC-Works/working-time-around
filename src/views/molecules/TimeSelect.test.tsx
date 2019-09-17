/**
 * @file 'TimeSelect' component unit tests
 */
import React from 'react'
import { IntlProvider } from 'react-intl'
import dayjs from 'dayjs'

import en from '../i18n/en.json'

import TimeSelect from './TimeSelect'

import {
  act,
  cleanup,
  fireEvent,
  render,
  RenderResult,
} from '@testing-library/react'

describe('"TimeSelect" molecule', () => {
  function setup(arg: {
    time?: Date
    onChange?: (time: Date) => void
  }): RenderResult {
    let result: RenderResult | null = null
    act(() => {
      result = render(
        <IntlProvider locale={'en'} messages={en}>
          <TimeSelect time={arg.time} onChange={arg.onChange} />
        </IntlProvider>
      )
    })
    return result!
  }

  afterEach(cleanup)

  it('should be no selection when there is no initial value', () => {
    const { getByTestId } = setup({})
    expect(getByTestId('hour')).toHaveProperty('value', '')
    expect(getByTestId('minute')).toHaveProperty('value', '')
  })

  it('should be selected time when there is an initial value', () => {
    const time = new Date(2019, 0, 1, 1, 2, 0)
    const { getByTestId } = setup({ time })
    expect(getByTestId('hour')).toHaveProperty('value', `${time.getHours()}`)
    expect(getByTestId('minute')).toHaveProperty(
      'value',
      `${time.getMinutes()}`
    )
  })

  it('should not call callback property when only hour is selected', () => {
    const mockOnChange = jest.fn()
    const { getByTestId } = setup({ onChange: mockOnChange })
    const hourSelector = getByTestId('hour')
    const minuteSelector = getByTestId('minute')

    act(() => {
      fireEvent.change(hourSelector, {
        target: { value: '1' },
      })
    })
    expect(hourSelector).toHaveProperty('value', '1')
    expect(mockOnChange).not.toHaveBeenCalled()

    act(() => {
      fireEvent.change(minuteSelector, {
        target: { value: '34' },
      })
    })
    expect(minuteSelector).toHaveProperty('value', '34')
    expect(mockOnChange).toHaveBeenCalled()
  })

  it('should not call callback property when only minute is selected', () => {
    const mockOnChange = jest.fn()
    const { getByTestId } = setup({ onChange: mockOnChange })
    const hourSelector = getByTestId('hour')
    const minuteSelector = getByTestId('minute')

    act(() => {
      fireEvent.change(minuteSelector, {
        target: { value: '34' },
      })
    })
    expect(minuteSelector).toHaveProperty('value', '34')
    expect(mockOnChange).not.toHaveBeenCalled()

    act(() => {
      fireEvent.change(hourSelector, {
        target: { value: '1' },
      })
    })
    expect(hourSelector).toHaveProperty('value', '1')
    expect(mockOnChange).toHaveBeenCalled()
  })

  it('should call callback property when there is an initial value and hour is changed', () => {
    const time = new Date(2019, 0, 1, 1, 2, 0)
    const mockOnChange = jest.fn()
    const { getByTestId } = setup({ time, onChange: mockOnChange })
    const hourSelector = getByTestId('hour')

    act(() => {
      fireEvent.change(hourSelector, {
        target: { value: `${time.getHours() + 1}` },
      })
    })
    expect(hourSelector).toHaveProperty('value', `${time.getHours() + 1}`)
    expect(mockOnChange).toHaveBeenCalledWith(
      dayjs(time)
        .add(1, 'hour')
        .toDate()
    )
  })

  it('should call callback property when there is an initial value and minute is changed', () => {
    const time = new Date(2019, 0, 1, 1, 35, 0)
    const mockOnChange = jest.fn()
    const { getByTestId } = setup({ time, onChange: mockOnChange })
    const minuteSelector = getByTestId('minute')

    act(() => {
      fireEvent.change(minuteSelector, {
        target: { value: `${time.getMinutes() - 8}` },
      })
    })
    expect(minuteSelector).toHaveProperty('value', `${time.getMinutes() - 8}`)
    expect(mockOnChange).toHaveBeenCalledWith(
      dayjs(time)
        .add(-8, 'minute')
        .toDate()
    )
  })
})
