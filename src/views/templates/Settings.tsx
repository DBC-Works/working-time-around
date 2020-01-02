/**
 * @file 'Settings' template component
 */
import React, { useCallback, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'

import Button from '@material/react-button'
import { Cell, Grid, Row } from '@material/react-layout-grid'
import TextField, { Input } from '@material/react-text-field'
import MaterialIcon from '@material/react-material-icon'
import { Headline6, Subtitle1 } from '@material/react-typography'

import en from '../i18n/en.json'
import ja from '../i18n/ja.json'

import { AppState } from '../../state/store'
import { getOnLine, showMessage } from '../../state/ducks/running'
import {
  canSendMessageToSlack,
  clearDefaultBreakTimeLength,
  getDefaultBreakTimeLengthMin,
  getLang,
  getSendToMailAddress,
  getSlackSettings,
  selectLanguage,
  settingsTypes,
  updateDefaultBreakTimeLengthMin,
  updateSendToMailAddress,
  updateSlackContext,
  updateSlackIncomingWebhookUrl,
} from '../../state/ducks/settings'
import Select from '../atoms/Select'
import TimeSelect from '../molecules/TimeSelect'
import { formatSendFailedMessage, sendMessageToSlack } from '../pages/App'

//
// Types
//

/**
 * Language information
 */
interface LanguageInformation {
  [index: string]: {
    literal: string
    catalogue: Record<string, string>
  }
}

//
// Variables
//

/**
 * Language information definition
 */
const langs: LanguageInformation = {
  en: {
    literal: 'English',
    catalogue: en,
  },
  ja: {
    literal: '日本語',
    catalogue: ja,
  },
}

//
// Functions
//

/**
 * Get message catalogue of specified language
 * @param lang Language to get
 * @returns Message catalogue
 */
export function getMessageCatalogueOf(
  lang: settingsTypes.Lang
): Record<string, string> {
  return langs[lang].catalogue
}

//
// Components
//

/**
 * 'Settings' component
 */
const Settings: React.FC = () => (
  <Grid>
    <Row className="text-align-center">
      <Cell columns={12}>
        <Headline6 tag="h1">
          <FormattedMessage id="Settings" />
        </Headline6>
      </Cell>
    </Row>
    <BreakTimeLength />
    <MailAddress />
    <SlackSettings />
    <LanguageSelection />
  </Grid>
)
export default Settings

/**
 * 'BreakTimeLength' component
 */
const BreakTimeLength: React.FC = () => {
  const breakTimeLength = useSelector((state: AppState) =>
    getDefaultBreakTimeLengthMin(state.settings)
  )

  const dispatch = useDispatch()
  const handleChangeHour = useCallback(
    e => {
      if (!breakTimeLength) {
        dispatch(updateDefaultBreakTimeLengthMin(+e.currentTarget.value * 60))
      }
    },
    [breakTimeLength]
  )
  const handleChangeMinute = useCallback(
    e => {
      if (!breakTimeLength) {
        dispatch(updateDefaultBreakTimeLengthMin(+e.currentTarget.value))
      }
    },
    [breakTimeLength]
  )
  const handleChangeTime = useCallback(time => {
    dispatch(
      updateDefaultBreakTimeLengthMin(time.getHours() * 60 + time.getMinutes())
    )
  }, [])
  const handleClickClear = useCallback(() => {
    dispatch(clearDefaultBreakTimeLength())
  }, [])

  const time = breakTimeLength
    ? dayjs()
        .startOf('date')
        .add(breakTimeLength, 'minute')
        .toDate()
    : undefined
  return (
    <div data-testid="break-time-length">
      <Row>
        <Cell columns={12}>
          <Headline6 tag="h2">
            <FormattedMessage id="Default.break.time.length" />
          </Headline6>
        </Cell>
      </Row>
      <Row>
        <Cell columns={12}>
          <TimeSelect
            label="--"
            time={time}
            onChangeHour={handleChangeHour}
            onChangeMinute={handleChangeMinute}
            onChange={handleChangeTime}
          />
          <Button disabled={!breakTimeLength} onClick={handleClickClear}>
            <MaterialIcon icon="clear" />
          </Button>
        </Cell>
      </Row>
    </div>
  )
}

/**
 * 'MailAddress' component
 */
const MailAddress: React.FC = () => {
  const mailAddress = useSelector((state: AppState) =>
    getSendToMailAddress(state.settings)
  )

  const dispatch = useDispatch()
  const handleInputMailAddress = useCallback(e => {
    dispatch(updateSendToMailAddress(e.currentTarget.value))
  }, [])

  return (
    <>
      <Row>
        <Cell columns={12}>
          <Headline6 tag="h2">
            <FormattedMessage id="Send.to.mail.address" />
          </Headline6>
        </Cell>
      </Row>
      <Row>
        <Cell columns={12}>
          <TextField
            textarea={false}
            fullWidth={true}
            label="foobar@example.com"
          >
            <Input
              type="email"
              value={mailAddress}
              onInput={handleInputMailAddress}
            />
          </TextField>
        </Cell>
      </Row>
    </>
  )
}

/**
 * 'SlackSettings' component
 */
const SlackSettings: React.FC = () => {
  const slackSettings = useSelector((state: AppState) =>
    getSlackSettings(state.settings)
  )

  const dispatch = useDispatch()
  const handleInputUrl = useCallback(e => {
    dispatch(updateSlackIncomingWebhookUrl(e.currentTarget.value))
  }, [])
  const handleInputContext = useCallback(e => {
    dispatch(updateSlackContext(e.currentTarget.value))
  }, [])

  return (
    <>
      <Row>
        <Cell columns={12}>
          <Headline6 tag="h2">
            <FormattedMessage id="Slack.linkage" />
          </Headline6>
        </Cell>
      </Row>
      <Row>
        <Cell columns={12}>
          <Subtitle1 tag="h3">
            <FormattedMessage id="Incoming.webhook.URL" />
          </Subtitle1>
        </Cell>
      </Row>
      <Row>
        <Cell columns={12}>
          <TextField
            textarea={false}
            fullWidth={true}
            label="https://hooks.slack.com/services/..."
          >
            <Input
              type="url"
              value={slackSettings.incomingWebhookUrl}
              onInput={handleInputUrl}
            />
          </TextField>
        </Cell>
      </Row>
      <Row>
        <Cell columns={12}>
          <Subtitle1 tag="h3">
            <FormattedMessage id="Context" />
          </Subtitle1>
        </Cell>
      </Row>
      <Row>
        <Cell columns={12}>
          <TextField textarea={false} fullWidth={true}>
            <Input
              type="text"
              value={slackSettings.context}
              onInput={handleInputContext}
            />
          </TextField>
        </Cell>
      </Row>
      <Row>
        <Cell columns={12} className="gutter-top">
          <SendTestMessageButton />
        </Cell>
      </Row>
    </>
  )
}

/**
 * 'SendTestMessageButton' component
 */
const SendTestMessageButton: React.FC = () => {
  const [posting, setPosting] = useState(false)

  const onLine = useSelector((state: AppState) => getOnLine(state.running))
  const canPost = useSelector((state: AppState) =>
    canSendMessageToSlack(state.settings)
  )
  const slackSettings = useSelector((state: AppState) =>
    getSlackSettings(state.settings)
  )

  const dispatch = useDispatch()
  const intl = useIntl()
  const handleClick = useCallback(async () => {
    if (canPost === false) {
      return
    }

    setPosting(true)
    const resultMessage = await sendMessageToSlack(
      slackSettings,
      intl.formatMessage({
        id: 'Test.message.posted.from.Working.time.around.',
      })
    )
    const message =
      0 < resultMessage.length
        ? formatSendFailedMessage(intl, resultMessage)
        : intl.formatMessage({ id: 'Send.succeeded.' })
    dispatch(showMessage(message))
    setPosting(false)
  }, [canPost, slackSettings.incomingWebhookUrl, slackSettings.context])

  return (
    <Button
      className="full-width"
      unelevated={true}
      disabled={onLine === false || canPost === false || posting !== false}
      onClick={handleClick}
    >
      <FormattedMessage id={onLine ? 'Send.a.test.message' : 'Offline'} />
    </Button>
  )
}

/**
 * 'LanguageSelection' component
 */
const LanguageSelection: React.FC = () => {
  const lang = useSelector((state: AppState) => getLang(state.settings))

  const dispatch = useDispatch()
  const handleChange = useCallback(e => {
    dispatch(selectLanguage(e.target.value))
  }, [])

  return (
    <>
      <Row>
        <Cell columns={12}>
          <Headline6 tag="h2">
            <FormattedMessage id="Language" />
          </Headline6>
        </Cell>
      </Row>
      <Row>
        <Cell columns={12}>
          <Select value={lang} className="full-width" onChange={handleChange}>
            {Array.from(Object.keys(langs), key => (
              <option key={key} value={key}>
                {langs[key].literal}
              </option>
            ))}
          </Select>
        </Cell>
      </Row>
    </>
  )
}
