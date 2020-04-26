/**
 * @file Test for utilities
 */
import dayjs from 'dayjs'

import { getDaysInMonth } from './utilities'

describe('Utilities', () => {
  describe('Date', () => {
    describe('getDaysInMonth', () => {
      it('should return a list of dates(dayjs instance) for given month', () => {
        for (let month = 1; month <= 12; ++month) {
          const dj = dayjs().month(month).startOf('month')

          const days = getDaysInMonth(dj)
          const endOfMonth = dj.endOf('month').date()
          expect(days).toHaveLength(endOfMonth)
          let date = 0
          days.forEach((day) => {
            expect(day.date()).toBe(++date)
          })
        }
      })
    })
  })
})
