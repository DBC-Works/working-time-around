/**
 * @file Tests for reducers
 */
import { RecordsState } from './types'
import { mergeStateHandler } from './reducers'

describe('"records" state reducers', () => {
  describe('Functions', () => {
    describe('mergeStateHandler', () => {
      const RECORD_KEY_20200501 = '20200501'
      const RECORD_KEY_20200502 = '20200502'

      it('should merge the state to be imported to the current state', () => {
        const current: RecordsState = {
          records: {
            '20200501': {
              starts: [new Date(2020, 4, 1, 10, 0, 0)],
              stops: [new Date(2020, 4, 1, 17, 45, 0)],
              memos: [],
              breakTimeLengthsMin: [60],
            },
          },
        }
        const exported: RecordsState = {
          records: {
            '20200502': {
              starts: [new Date(2020, 4, 2, 9, 0, 0)],
              stops: [new Date(2020, 4, 2, 18, 0, 0)],
              memos: [],
              breakTimeLengthsMin: [60],
            },
          },
        }
        const merged = mergeStateHandler(current, exported)
        expect(merged.records[RECORD_KEY_20200501]).toEqual(
          current.records[RECORD_KEY_20200501]
        )
        expect(merged.records[RECORD_KEY_20200502]).toEqual(
          exported.records[RECORD_KEY_20200502]
        )
      })
      it('should keep the current value of the property if the value of the import property is the same.', () => {
        const current: RecordsState = {
          records: {
            '20200501': {
              starts: [new Date(2020, 4, 1, 10, 0, 0)],
              stops: [new Date(2020, 4, 1, 17, 45, 0)],
              memos: [],
              breakTimeLengthsMin: [60],
            },
          },
        }
        const merged = mergeStateHandler(current, current)
        expect(merged).toEqual(current)
      })
      it('should combine the imported value with current value if the value of the property is different', () => {
        const current: RecordsState = {
          records: {
            '20200501': {
              starts: [new Date(2020, 4, 1, 10, 0, 0)],
              stops: [new Date(2020, 4, 1, 17, 45, 0)],
              memos: [],
              breakTimeLengthsMin: [60],
            },
          },
        }
        const exported: RecordsState = {
          records: {
            '20200501': {
              starts: [new Date(2020, 4, 1, 9, 0, 0)],
              stops: [new Date(2020, 4, 1, 18, 0, 0)],
              memos: ['memo'],
              breakTimeLengthsMin: [90],
            },
          },
        }
        const merged = mergeStateHandler(current, exported)
        const mergedRecord = merged.records[RECORD_KEY_20200501]
        expect(mergedRecord.starts).toEqual([
          ...current.records[RECORD_KEY_20200501].starts,
          ...exported.records[RECORD_KEY_20200501].starts,
        ])
        expect(mergedRecord.stops).toEqual([
          ...current.records[RECORD_KEY_20200501].stops,
          ...exported.records[RECORD_KEY_20200501].stops,
        ])
        expect(mergedRecord.breakTimeLengthsMin).toEqual([
          ...(current.records[RECORD_KEY_20200501]
            .breakTimeLengthsMin as number[]),
          ...(exported.records[RECORD_KEY_20200501]
            .breakTimeLengthsMin as number[]),
        ])
        expect(mergedRecord.memos).toEqual([
          ...current.records[RECORD_KEY_20200501].memos,
          ...exported.records[RECORD_KEY_20200501].memos,
        ])
      })
    })
  })
})
