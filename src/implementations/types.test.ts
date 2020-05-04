/**
 * @file Test for types
 */
import { Result } from './types'

describe('Types', () => {
  describe('Result', () => {
    describe('Success', () => {
      let result: Result<string, string>
      beforeEach(() => {
        result = new Result({ ok: 'success' })
      })

      it('should get success value', () => {
        expect(result.isOk()).toBeTruthy()
        expect(result.ok()).toEqual('success')
      })

      it('should not have error result', () => {
        expect(result.isErr()).toBeFalsy()
      })
    })

    describe('Error', () => {
      let result: Result<string, string>
      beforeEach(() => {
        result = new Result({ err: 'error' })
      })

      it('should get error detail', () => {
        expect(result.isErr()).toBeTruthy()
        expect(result.err()).toEqual('error')
      })

      it('should not have success result', () => {
        expect(result.isOk()).toBeFalsy()
      })
    })
  })
})
