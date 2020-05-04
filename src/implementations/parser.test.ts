/**
 * @file Test for parser
 */
import { ParseErrorType, parseExportedState } from './parser'

describe('Parser', () => {
  describe('parseExportedState', () => {
    const VALID_EXPORTED_STATE = {
      version: 202003,
      createTime: new Date(),
      records: {},
      settings: {},
    }
    it('should parse export state if a valid JSON is given', () => {
      const result = parseExportedState(JSON.stringify(VALID_EXPORTED_STATE))
      expect(result.isOk()).toBeTruthy()
      expect(result.ok()).toBeDefined()
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
