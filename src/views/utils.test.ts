/**
 * @file Utilities for views unit tests
 */

import { DailyLatestRecord } from '../state/ducks/records'
import { calcWorkingTimeMin } from './utils'

describe('Utilities', () => {
  describe('"calcWorkingTime" function', () => {
    it.each([
      {
        record: {
          start: new Date(2023, 9, 15, 9, 0, 0),
          stop: new Date(2023, 9, 15, 17, 0, 0),
          memo: '',
          breakTimeLengthMin: 60,
        },
        expected: 420,
      },
      {
        record: {
          start: new Date(2023, 9, 15, 9, 0, 0),
          stop: new Date(2023, 9, 15, 17, 0, 0),
          memo: '',
          breakTimeLengthMin: 0,
        },
        expected: 480,
      },
      {
        record: {
          start: new Date(2024, 4, 12, 0, 0, 0),
          stop: new Date(2024, 4, 12, 0, 0, 0),
          memo: '',
          breakTimeLengthMin: 60,
        },
        expected: -60,
      },
    ])(
      'should return working time from valid record',
      ({ record, expected }) => {
        // arrange & act
        const actual = calcWorkingTimeMin(record as DailyLatestRecord)

        // assert
        expect(actual).toEqual(expected)
      }
    )

    it.each([
      {
        record: {
          start: null,
          stop: null,
          memo: '',
          breakTimeLengthMin: null,
        },
      },
      {
        record: {
          start: new Date(2023, 9, 15, 9, 0, 0),
          stop: null,
          memo: '',
          breakTimeLengthMin: null,
        },
      },
      {
        record: {
          start: new Date(2023, 9, 15, 9, 0, 0),
          stop: new Date(2023, 9, 15, 17, 0, 0),
          memo: '',
          breakTimeLengthMin: null,
        },
      },
      {
        record: {
          start: null,
          stop: new Date(2023, 9, 15, 17, 0, 0),
          memo: '',
          breakTimeLengthMin: 0,
        },
      },
    ])('should return null from invalid record', ({ record }) => {
      // arrange & act
      const actual = calcWorkingTimeMin(record as DailyLatestRecord)

      // assert
      expect(actual).toBeNull()
    })
  })
})
