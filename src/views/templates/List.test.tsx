/**
 * @file 'List' component unit tests
 */
import React from 'react'
import { Route } from 'react-router-dom'
import { AnyAction, Store } from 'redux'
import dayjs from 'dayjs'

import { AppState, INITIAL_STATE } from '../../state/store'
import { RecordsState } from '../../state/ducks/records'
import List from './List'

import { RenderResult, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProvider } from '../componentTestUtilities'

describe('"List" template', () => {
  function setup(
    route = '/2019/1',
    state: AppState = INITIAL_STATE
  ): [RenderResult, Store<AppState, AnyAction>] {
    return renderWithProvider(
      <Route
        exact
        path="/:year(\d{4})/:month([1-9]|10|11|12)"
        component={List}
      />,
      route,
      state
    )
  }

  describe('header', () => {
    // eslint-disable-next-line prettier/prettier
    it.each([
      [2019, 1],
      [2018, 12],
    ])(
      'should exist an formatted year %i and month %i heading',
      (year, month) => {
        const target = dayjs(new Date(year, month - 1, 1))
        setup(target.format('/YYYY/M'))
        expect(screen.getByText(target.format('MMM YYYY'))).toBeInTheDocument()
      }
    )

    it('should exist "prev" and "next" icon links', () => {
      setup()
      expect(screen.getByText('navigate_before')).toBeInTheDocument()
      expect(screen.getByText('navigate_next')).toBeInTheDocument()
    })

    it('should move to the previous month when click "prev" icon link', () => {
      const dj = dayjs()
      setup(dj.format('/YYYY/M'))
      userEvent.click(screen.getByText('navigate_before'))

      expect(
        screen.getByText(dj.add(-1, 'month').format('MMM YYYY'))
      ).toBeInTheDocument()
    })

    it('should move to the next month when click "next" icon link', () => {
      const dj = dayjs()
      setup(dj.format('/YYYY/M'))
      userEvent.click(screen.getByText('navigate_next'))

      expect(
        screen.getByText(dj.add(1, 'month').format('MMM YYYY'))
      ).toBeInTheDocument()
    })
  })

  describe('records', () => {
    const TESTID_MEDIAN_START = 'median-start'
    const TESTID_MEDIAN_STOP = 'median-stop'

    it.each(Array.from(Array(12).keys()))(
      'should exist date rows for that month(%i)',
      (monthIndex) => {
        const target = dayjs(new Date()).month(monthIndex).startOf('month')
        setup(target.format('/YYYY/M'))

        Array.from(Array(target.daysInMonth()), (_, i) =>
          target.set('date', i + 1)
        ).forEach((date) => {
          expect(screen.getByText(date.format('D(ddd)'))).toBeInTheDocument()
        })
      }
    )

    it('should exist a button to that date page in each date rows', () => {
      const dj = dayjs(new Date())
      setup(dj.format('/YYYY/M'))
      expect(screen.getAllByText('…')).toHaveLength(dj.daysInMonth())
    })

    it('should exist "Median" row heading', () => {
      setup()
      const { getByText } = within(
        screen.getByTestId('data-list-footer-median')
      )
      expect(getByText('Median')).toBeInTheDocument()
    })

    it('should be empty the median start time when the start time list is empty', () => {
      setup()
      expect(screen.getByTestId(TESTID_MEDIAN_START)).toHaveTextContent('')
    })

    it.each([
      { month: '/2019/1', starts: ['20190101T0900'], expected: '09:00' },
      {
        month: '/2019/1',
        starts: ['20190101T0900', '20190110T1000'],
        expected: '09:30',
      },
      {
        month: '/2019/1',
        starts: ['20190101T0900', '20190123T0923', '20190131T1000'],
        expected: '09:23',
      },
    ])(
      'should be exist the median start time when the start time list is not empty',
      (table) => {
        const recordsState: RecordsState = {
          records: {},
        }
        table.starts.forEach((start) => {
          const dj = dayjs(start)
          recordsState.records[dj.format('YYYYMMDD')] = {
            starts: [dayjs(start).toDate()],
            stops: [],
            memos: [],
            breakTimeLengthsMin: [],
          }
        })

        setup(table.month, {
          ...INITIAL_STATE,
          records: recordsState,
        })
        expect(screen.getByTestId(TESTID_MEDIAN_START)).toHaveTextContent(
          table.expected
        )
      }
    )

    it('should be empty the median stop time when the stop time list is empty', () => {
      setup()
      expect(screen.getByTestId(TESTID_MEDIAN_STOP)).toHaveTextContent('')
    })

    it.each([
      { month: '/2019/1', stops: ['20190101T1833'], expected: '18:33' },
      {
        month: '/2019/1',
        stops: ['20190101T1800', '20190110T1930'],
        expected: '18:45',
      },
      {
        month: '/2019/1',
        stops: ['20190101T1800', '20190123T1946', '20190131T2000'],
        expected: '19:46',
      },
    ])(
      'should be exist the median stop time when the stop time list is not empty',
      (table) => {
        const recordsState: RecordsState = {
          records: {},
        }
        table.stops.forEach((stop) => {
          const dj = dayjs(stop)
          recordsState.records[dj.format('YYYYMMDD')] = {
            starts: [],
            stops: [dayjs(stop).toDate()],
            memos: [],
            breakTimeLengthsMin: [],
          }
        })

        setup(table.month, {
          ...INITIAL_STATE,
          records: recordsState,
        })
        expect(screen.getByTestId(TESTID_MEDIAN_STOP)).toHaveTextContent(
          table.expected
        )
      }
    )
  })

  describe('statistics', () => {
    const NO_RESULT_TIME = '--:--'

    describe('Working day', () => {
      const TESTID_STATISTICS_DAY = 'statistics-day'
      const NO_RESULT_DAY = '-'

      it('should exist "Total work day" row heading', () => {
        setup()
        const { getByText } = within(screen.getByTestId(TESTID_STATISTICS_DAY))
        expect(getByText('Total working day')).toBeInTheDocument()
      })

      it('should exist "- as total work day if no record', () => {
        setup()
        const { getByText } = within(screen.getByTestId(TESTID_STATISTICS_DAY))
        expect(getByText(NO_RESULT_DAY)).toBeInTheDocument()
      })

      it('should exist a calculated total work day', () => {
        const recordsState: RecordsState = {
          records: {},
        }
        let date = dayjs().startOf('month').startOf('day').add(9, 'hour')
        for (let day = 0; day < 10; ++day) {
          recordsState.records[date.format('YYYYMMDD')] = {
            starts: [date.toDate()],
            stops: [date.add(2, 'hour').toDate()],
            memos: [],
            breakTimeLengthsMin: [60],
          }
          date = date.add(1, 'day')
        }
        setup(date.format('/YYYY/M'), {
          ...INITIAL_STATE,
          records: recordsState,
        })
        const { getByText } = within(screen.getByTestId(TESTID_STATISTICS_DAY))
        expect(getByText('10')).toBeInTheDocument()
      })
    })

    describe('Total working time', () => {
      const TESTID_STATISTICS_TOTAL = 'statistics-total'

      it('should exist "Total work time" row heading', () => {
        setup()
        const { getByText } = within(
          screen.getByTestId(TESTID_STATISTICS_TOTAL)
        )
        expect(getByText('Total working time')).toBeInTheDocument()
      })

      it('should exist "--:--" as total work time if no record', () => {
        setup()
        const { getByText } = within(
          screen.getByTestId(TESTID_STATISTICS_TOTAL)
        )
        expect(getByText(NO_RESULT_TIME)).toBeInTheDocument()
      })

      it('should exist "--:--" as total work time if exists invalid record', () => {
        const dj = dayjs().startOf('month')
        const recordsState: RecordsState = {
          records: {},
        }
        recordsState.records[dj.format('YYYYMMDD')] = {
          starts: [dj.toDate()],
          stops: [dj.add(2, 'hour').toDate()],
          memos: [],
          breakTimeLengthsMin: [60],
        }
        const tomorrow = dj.add(1, 'day')
        recordsState.records[tomorrow.format('YYYYMMDD')] = {
          starts: [tomorrow.toDate()],
          stops: [tomorrow.toDate()],
          memos: [],
          breakTimeLengthsMin: [60],
        }

        setup(dj.format('/YYYY/M'), {
          ...INITIAL_STATE,
          records: recordsState,
        })
        const { getByText } = within(
          screen.getByTestId(TESTID_STATISTICS_TOTAL)
        )
        expect(getByText(NO_RESULT_TIME)).toBeInTheDocument()
      })

      it('should exist a calculated total work time', () => {
        const dj = dayjs().startOf('month').startOf('day').add(9, 'hour')
        const recordsState: RecordsState = {
          records: {},
        }
        recordsState.records[dj.format('YYYYMMDD')] = {
          starts: [dj.toDate()],
          stops: [dj.add(2, 'hour').toDate()],
          memos: [],
          breakTimeLengthsMin: [60],
        }
        const tomorrow = dj.add(1, 'day')
        recordsState.records[tomorrow.format('YYYYMMDD')] = {
          starts: [tomorrow.toDate()],
          stops: [tomorrow.add(2, 'hour').toDate()],
          memos: [],
          breakTimeLengthsMin: [30],
        }

        setup(dj.format('/YYYY/M'), {
          ...INITIAL_STATE,
          records: recordsState,
        })
        const { getByText } = within(
          screen.getByTestId(TESTID_STATISTICS_TOTAL)
        )
        expect(getByText('2:30')).toBeInTheDocument()
      })
    })

    describe('Median', () => {
      const TESTID_STATISTICS_MEDIAN = 'statistics-median'

      it('should exist "Median" row heading', () => {
        setup()
        const { getByText } = within(
          screen.getByTestId(TESTID_STATISTICS_MEDIAN)
        )
        expect(getByText('Median')).toBeInTheDocument()
      })

      it('should exist "--:--" as median if no record', () => {
        setup()
        const { getByText } = within(
          screen.getByTestId(TESTID_STATISTICS_MEDIAN)
        )
        expect(getByText(NO_RESULT_TIME)).toBeInTheDocument()
      })

      it('should exist "--:--" as median if exists invalid record', () => {
        const dj = dayjs().startOf('month')
        const recordsState: RecordsState = {
          records: {},
        }
        recordsState.records[dj.format('YYYYMMDD')] = {
          starts: [dj.toDate()],
          stops: [dj.add(2, 'hour').toDate()],
          memos: [],
          breakTimeLengthsMin: [60],
        }
        const tomorrow = dj.add(1, 'day')
        recordsState.records[tomorrow.format('YYYYMMDD')] = {
          starts: [tomorrow.toDate()],
          stops: [tomorrow.toDate()],
          memos: [],
          breakTimeLengthsMin: [60],
        }

        setup(dj.format('/YYYY/M'), {
          ...INITIAL_STATE,
          records: recordsState,
        })
        const { getByText } = within(
          screen.getByTestId(TESTID_STATISTICS_MEDIAN)
        )
        expect(getByText(NO_RESULT_TIME)).toBeInTheDocument()
      })

      it('should exist a calculated median', () => {
        const dj = dayjs().startOf('month').startOf('day').add(9, 'hour')
        const recordsState: RecordsState = {
          records: {},
        }
        recordsState.records[dj.format('YYYYMMDD')] = {
          starts: [dj.toDate()],
          stops: [dj.add(2, 'hour').toDate()],
          memos: [],
          breakTimeLengthsMin: [60],
        }
        const tomorrow = dj.add(1, 'day')
        recordsState.records[tomorrow.format('YYYYMMDD')] = {
          starts: [tomorrow.toDate()],
          stops: [tomorrow.add(2, 'hour').toDate()],
          memos: [],
          breakTimeLengthsMin: [30],
        }

        setup(dj.format('/YYYY/M'), {
          ...INITIAL_STATE,
          records: recordsState,
        })
        const { getByText } = within(
          screen.getByTestId(TESTID_STATISTICS_MEDIAN)
        )
        expect(getByText('1:15')).toBeInTheDocument()
      })
    })
  })

  describe('footer', () => {
    it('should exist a "Send mail" button', () => {
      setup()
      expect(screen.getByText('Send mail')).toBeInTheDocument()
    })
  })
})
