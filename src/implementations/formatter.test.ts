/**
 * @file Test for formatter
 */
import dayjs from 'dayjs'

import { formatSpecifiedMonthRecordsAsCsvForMail } from './formatter'

describe('Formatter', () => {
  describe('formatSpecifiedMonthRecordsAsCsvForMail', () => {
    it('should format records to list of CSV string for mail', () => {
      const dj = dayjs('20200515')
      const startTime = dj.hour(9)
      const records = {
        '20200515': {
          starts: [startTime.minute(20).toDate(), startTime.toDate()],
          stops: [dj.hour(17).minute(30).toDate()],
          memos: [],
          breakTimeLengthsMin: [60],
        },
      }
      const result = formatSpecifiedMonthRecordsAsCsvForMail(
        dj.startOf('month'),
        records,
        undefined
      )

      expect(result).toHaveLength(dj.endOf('month').date())
      const formatted = result[14]
      expect(formatted).toBeDefined()
      expect(formatted).not.toBeNull()
      const columns = formatted.split(',')
      expect(columns).toHaveLength(5)
      expect(columns[0]).toEqual('"2020-05-15"')
      expect(columns[1]).toEqual('"09:00"')
      expect(columns[2]).toEqual('"17:30"')
      expect(columns[3]).toEqual('""')
      expect(columns[4]).toEqual('"01:00"')
    })
    it('should be the same that the number of days in the month month and the number of lines', () => {
      for (let month = 1; month <= 12; ++month) {
        const dj = dayjs().month(month).startOf('month')
        const result = formatSpecifiedMonthRecordsAsCsvForMail(
          dj,
          [],
          undefined
        )
        expect(result).toHaveLength(dj.endOf('month').date())
      }
    })
    it('should be 5 that the number of columns in each row', () => {
      for (let month = 1; month <= 12; ++month) {
        const dj = dayjs().month(month).startOf('month')
        const result = formatSpecifiedMonthRecordsAsCsvForMail(
          dj,
          [],
          undefined
        )
        expect(
          result.every((line) => line.split(',').length === 5)
        ).toBeTruthy()
      }
    })
  })
})
