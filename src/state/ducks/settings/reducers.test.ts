/**
 * @file Tests for state
 */
import { mergeStateHandler } from './reducers'
import { Lang } from './types'

describe('"settings" state reducers', () => {
  describe('Functions', () => {
    describe('mergeStateHandler', () => {
      const STATE = {
        sendToMailAddress: '',
        slack: {
          incomingWebhookUrl: '',
          context: '',
        },
        lang: Lang.EN,
        defaultBreakTimeLengthMin: undefined,
      }

      it('should merge the state to be imported to the current state', () => {
        const current = {
          ...STATE,
          sendToMailAddress: 'current@example.com',
        }
        const exported = {
          sendToMailAddress: 'exported@example.com',
          slack: {
            incomingWebhookUrl: 'https://example.com/slack-webhook-url',
            context: 'Slack context',
          },
          lang: Lang.JA,
          defaultBreakTimeLengthMin: 60,
        }
        const merged = mergeStateHandler(current, exported)
        expect(merged).toEqual(exported)
      })
      it('should keep the current value of property if the value of the import property has no value', () => {
        const current = {
          ...STATE,
          sendToMailAddress: 'current@example.com',
          slack: {
            incomingWebhookUrl: 'https://example.com/current-url',
            context: 'Current slack context',
          },
          defaultBreakTimeLengthMin: 60,
        }
        const exported = {
          sendToMailAddress: '',
          slack: {
            incomingWebhookUrl: '',
            context: '',
          },
          lang: Lang.JA,
        }
        const merged = mergeStateHandler(current, exported)
        expect(merged.sendToMailAddress).toEqual(current.sendToMailAddress)
        expect(merged.slack).toEqual(current.slack)
        expect(merged.lang).toEqual(exported.lang)
        expect(merged.defaultBreakTimeLengthMin).toEqual(
          current.defaultBreakTimeLengthMin
        )
      })
    })
  })
})
