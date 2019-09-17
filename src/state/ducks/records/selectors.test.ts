/**
 * @file Records state selectors unit tests
 */
import dayjs from 'dayjs'

import { getDailyRecordOf, getMonthlyRecordsOf } from './selectors'
import { RecordsState } from './types'

describe('Record state selector', () => {
  const STATE_EMPTY: RecordsState = {
    records: {},
  }
  const STATE_NOT_EMPTY: RecordsState = {
    records: {
      '20190101': {
        starts: [],
        stops: [],
        memos: [],
      },
    },
  }

  describe('getDailyRecordOf', () => {
    it('should return null when there is no record for the specified date', () => {
      expect(getDailyRecordOf(new Date(), STATE_EMPTY)).toBeNull()
    })

    it('should return DailyRecord when there is no record for the specified date', () => {
      expect(
        getDailyRecordOf(new Date(2019, 0, 1), STATE_NOT_EMPTY)
      ).not.toBeNull()
      expect(getDailyRecordOf(new Date(), STATE_NOT_EMPTY)).toBeNull()
    })
  })

  describe('getMonthlyRecordOf', () => {
    it('should return empty list when there is no record for the specified month', () => {
      const records = getMonthlyRecordsOf(new Date(), STATE_EMPTY)
      expect(Object.keys(records)).toHaveLength(0)
    })

    it('should return monthly records list', () => {
      const date = new Date(2019, 0, 1)
      const records = getMonthlyRecordsOf(date, STATE_NOT_EMPTY)
      expect(Object.keys(records)).toHaveLength(1)
      expect(records[dayjs(date).format('YYYYMMDD')]).toBeDefined()
      expect(
        records[
          dayjs(date)
            .endOf('month')
            .format('YYYYMMDD')
        ]
      ).not.toBeDefined()
    })
  })
})
