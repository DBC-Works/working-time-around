/**
 * @file Test for parser
 */
import { ParseErrorType, parseExportedState } from './parser'

describe('Parser', () => {
  describe('parseExportedState', () => {
    const VALID_EXPORTED_STATE = {
      version: 202003,
      createTime: new Date(),
      records: {
        records: {
          '20200501': {
            starts: [new Date()],
            stops: [new Date()],
            memos: [],
          },
        },
      },
      settings: {},
    }
    it('should parse export state if a valid JSON is given', () => {
      const result = parseExportedState(JSON.stringify(VALID_EXPORTED_STATE))
      expect(result.isOk()).toBeTruthy()
      const state = result.ok()
      expect(state).toBeDefined()
      expect(
        Object.entries(state.records.records).every(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ([key, record]) =>
            record.starts.every((start) => start instanceof Date) &&
            record.stops.every((stop) => stop instanceof Date)
        )
      ).toBeTruthy()
    })
    it('should return an error when a invalid text is given', () => {
      const result = parseExportedState('{')
      expect(result.isOk()).toBeFalsy()
      expect(result.isErr()).toBeTruthy()
      expect(result.err()).toEqual(ParseErrorType.InvalidText)
    })
    it.each(['version', 'createTime', 'records', 'settings'])(
      'should return an error if the required property "%s" does not exist',
      (propertyName) => {
        const state = { ...VALID_EXPORTED_STATE }
        delete (state as never)[propertyName]
        const result = parseExportedState(JSON.stringify(state))
        expect(result.isOk()).toBeFalsy()
        expect(result.isErr()).toBeTruthy()
        expect(result.err()).toEqual(ParseErrorType.NoRequiredProperty)
      }
    )
    it('should return an error if the version is invalid', () => {
      const state = { ...VALID_EXPORTED_STATE, version: 1 }
      const result = parseExportedState(JSON.stringify(state))
      expect(result.isOk()).toBeFalsy()
      expect(result.isErr()).toBeTruthy()
      expect(result.err()).toEqual(ParseErrorType.InvalidVersion)
    })
  })
})
