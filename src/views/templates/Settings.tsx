/**
 * @file 'Settings' template component
 */
import React, { useCallback, useEffect, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { Action } from 'typescript-fsa'
import assert from 'assert'

import Button from '@material/react-button'
import Checkbox from '@material/react-checkbox'
import { Cell, Grid, Row } from '@material/react-layout-grid'
import TextField, { Input } from '@material/react-text-field'
import { Body1, Headline6, Subtitle1 } from '@material/react-typography'
import Tab from '@material/react-tab'
import TabBar from '@material/react-tab-bar'

import { formatStateForExport } from '../../implementations/formatter'
import { parseExportedState } from '../../implementations/parser'

import en from '../i18n/en.json'
import ja from '../i18n/ja.json'

import { AppState } from '../../state/store'
import { mergeExportedState as mergeExportedRecordsState } from '../../state/ducks/records'
import {
  getExportObjectUrl,
  getOnLine,
  getWindow,
  setExportObjectUrl,
  showMessage,
} from '../../state/ducks/running'
import {
  canSendMessageToSlack,
  clearDefaultBreakTimeLength,
  getDefaultBreakTimeLengthMin,
  getLang,
  getSendToMailAddress,
  getSlackSettings,
  mergeExportedState as mergeExportedSettingsState,
  selectLanguage,
  Lang,
  updateDefaultBreakTimeLengthMin,
  updateSendToMailAddress,
  updateSlackContext,
  updateSlackIncomingWebhookUrl,
} from '../../state/ducks/settings'
import Select from '../atoms/Select'
import BreakTimeLengthSelect from '../molecules/BreakTimeLengthSelect'
import SingleCellRow from '../molecules/SingleCellRow'
import { formatSendFailedMessage, sendMessageToSlack } from '../pages/App'

//
// Types
//

/**
 * Tab type
 */
enum TabType {
  Operation,
  Record,
  Linkage,
}

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
export function getMessageCatalogueOf(lang: Lang): Record<string, string> {
  return langs[lang].catalogue
}

/**
 * Get upload text
 * @description Export for mock this in a unit test.
 * @param files Upload file list
 * @returns Upload file content
 */
export function getUploadText(files: FileList): Promise<string> {
  assert(files.length === 1)
  return files[0].text()
}

//
// Components
//

/**
 * 'Settings' component
 */
const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState(TabType.Operation)

  const handleActiveIndexUpdate = useCallback(
    (index) => {
      setActiveTab(index)
    },
    [setActiveTab]
  )

  return (
    <Grid className="settings">
      <Row className="text-align-center">
        <Cell columns={12}>
          <Headline6 tag="h1">
            <FormattedMessage id="Settings" />
          </Headline6>
        </Cell>
      </Row>
      <SingleCellRow>
        <TabBar
          activeIndex={activeTab}
          handleActiveIndexUpdate={handleActiveIndexUpdate}
        >
          <Tab>
            <FormattedMessage id="Operation" />
          </Tab>
          <Tab>
            <FormattedMessage id="Record" />
          </Tab>
          <Tab>
            <FormattedMessage id="Linkage" />
          </Tab>
        </TabBar>
      </SingleCellRow>
      {activeTab === TabType.Operation && (
        <>
          <DefaultBreakTimeLength />
          <LanguageSelection />
        </>
      )}
      {activeTab === TabType.Record && (
        <div className="record">
          <Export />
          <Import />
        </div>
      )}
      {activeTab === TabType.Linkage && (
        <>
          <MailAddress />
          <SlackSettings />
        </>
      )}
    </Grid>
  )
}
export default Settings

/**
 * 'Heading in tab' component
 */
const HeadingInTab: React.FC = (props) => (
  <SingleCellRow>
    <Headline6 tag="h2">{props.children}</Headline6>
  </SingleCellRow>
)

/**
 * 'DefaultBreakTimeLength' component
 */
const DefaultBreakTimeLength: React.FC = () => {
  const breakTimeLength = useSelector((state: AppState) =>
    getDefaultBreakTimeLengthMin(state.settings)
  )
  return (
    <>
      <HeadingInTab>
        <FormattedMessage id="Default.break.time.length" />
      </HeadingInTab>
      <SingleCellRow>
        <BreakTimeLengthSelect
          lengthMin={breakTimeLength}
          actionCreators={{
            update: (lengthMin: number): Action<number> =>
              updateDefaultBreakTimeLengthMin(lengthMin),
            clear: (): Action<void> => clearDefaultBreakTimeLength(),
          }}
        />
      </SingleCellRow>
    </>
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
  const handleInputMailAddress = useCallback((e) => {
    dispatch(updateSendToMailAddress(e.currentTarget.value))
  }, [])

  return (
    <>
      <HeadingInTab>
        <label htmlFor="mail-address">
          <FormattedMessage id="Send.to.mail.address" />
        </label>
      </HeadingInTab>
      <SingleCellRow>
        <TextField textarea={false} fullWidth={true} label="foobar@example.com">
          <Input
            type="email"
            id="mail-address"
            value={mailAddress}
            onInput={handleInputMailAddress}
          />
        </TextField>
      </SingleCellRow>
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
  const handleInputUrl = useCallback((e) => {
    dispatch(updateSlackIncomingWebhookUrl(e.currentTarget.value))
  }, [])
  const handleInputContext = useCallback((e) => {
    dispatch(updateSlackContext(e.currentTarget.value))
  }, [])

  return (
    <>
      <HeadingInTab>
        <FormattedMessage id="Slack.linkage" />
      </HeadingInTab>
      <SingleCellRow>
        <Subtitle1 tag="h3">
          <label htmlFor="incoming-webhook-url">
            <FormattedMessage id="Incoming.webhook.URL" />
          </label>
        </Subtitle1>
      </SingleCellRow>
      <SingleCellRow>
        <TextField
          textarea={false}
          fullWidth={true}
          label="https://hooks.slack.com/services/..."
        >
          <Input
            type="url"
            id="incoming-webhook-url"
            value={slackSettings.incomingWebhookUrl}
            onInput={handleInputUrl}
          />
        </TextField>
      </SingleCellRow>
      <SingleCellRow>
        <Subtitle1 tag="h3">
          <label htmlFor="context">
            <FormattedMessage id="Context" />
          </label>
        </Subtitle1>
      </SingleCellRow>
      <SingleCellRow>
        <TextField textarea={false} fullWidth={true}>
          <Input
            type="text"
            id="context"
            value={slackSettings.context}
            onInput={handleInputContext}
          />
        </TextField>
      </SingleCellRow>
      <SingleCellRow className="gutter-top">
        <SendTestMessageButton />
      </SingleCellRow>
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
  const handleChange = useCallback((e) => {
    dispatch(selectLanguage(e.target.value))
  }, [])

  return (
    <>
      <HeadingInTab>
        <FormattedMessage id="Language" />
      </HeadingInTab>
      <SingleCellRow>
        <Select value={lang} className="full-width" onChange={handleChange}>
          {Array.from(Object.keys(langs), (key: string) => (
            <option key={key} value={key}>
              {langs[key].literal}
            </option>
          ))}
        </Select>
      </SingleCellRow>
    </>
  )
}

/**
 * 'Export' component
 */
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    URL: any
  }
}
const Export: React.FC = () => {
  const records = useSelector((state: AppState) => state.records)
  const settings = useSelector((state: AppState) => state.settings)
  const exportObjectUrl = useSelector((state: AppState) =>
    getExportObjectUrl(state.running)
  )
  const w = useSelector((state: AppState) => getWindow(state.running))
  const dispatch = useDispatch()
  useEffect((): (() => void) => {
    const blob = new Blob([formatStateForExport(records, settings)], {
      type: 'application/json',
    })
    dispatch(setExportObjectUrl(w.URL.createObjectURL(blob)))
    return function cleanup(): void {
      w.URL.revokeObjectURL(exportObjectUrl)
      dispatch(setExportObjectUrl('#'))
    }
  }, [])

  return (
    <>
      <HeadingInTab>
        <FormattedMessage id="Export" />
      </HeadingInTab>
      <SingleCellRow>
        <Body1>
          <a
            href={exportObjectUrl}
            download="working-time-around-record-data.json"
          >
            <FormattedMessage id="Download" />
          </a>
        </Body1>
      </SingleCellRow>
    </>
  )
}

/**
 * 'Import' component
 */
const Import: React.FC = () => {
  const fileInputRef = React.createRef<HTMLInputElement>()
  const [importSettings, setImportSettings] = useState(false)
  const [resultMessage, setResultMessage] = useState('')

  const intl = useIntl()
  const dispatch = useDispatch()
  const handleChangeImportSettings = useCallback(() => {
    setResultMessage('')
    setImportSettings(!importSettings)
  }, [])
  const handleClickBrowse = useCallback(() => {
    if (fileInputRef.current === null) {
      return
    }
    setResultMessage('')
    fileInputRef.current.click()
  }, [fileInputRef])
  const handleChangeFile = useCallback(async () => {
    if (fileInputRef.current === null || fileInputRef.current.files === null) {
      return
    }
    const text = await getUploadText(fileInputRef.current.files)
    const result = parseExportedState(text)
    if (result.isErr()) {
      const msg = intl.formatMessage(
        {
          id: 'Format.error.import',
        },
        { message: intl.formatMessage({ id: result.err().replace(/ /g, '.') }) }
      )

      setResultMessage(msg)
      return
    }

    const importedState = result.ok()
    dispatch(mergeExportedRecordsState(importedState.records))
    if (importSettings !== false) {
      dispatch(mergeExportedSettingsState(importedState.settings))
    }
    setResultMessage(
      intl.formatMessage({
        id:
          importSettings !== false
            ? 'Imported.records.and.settings.'
            : 'Imported.records.',
      })
    )
  }, [fileInputRef, importSettings])

  return (
    <>
      <HeadingInTab>
        <FormattedMessage id="Import" />
      </HeadingInTab>
      <SingleCellRow>
        <div className="import-settings">
          <Checkbox
            nativeControlId="import-settings"
            checked={importSettings}
            onChange={handleChangeImportSettings}
          />
          <Body1>
            <label htmlFor="import-settings">
              <FormattedMessage id="Import.settings" />
            </label>
          </Body1>
        </div>
      </SingleCellRow>
      <SingleCellRow className="file-upload">
        <input
          type="file"
          data-testid="file-upload"
          accept=".json,application/json"
          ref={fileInputRef}
          onChange={handleChangeFile}
        />
        <Button unelevated={true} onClick={handleClickBrowse}>
          <FormattedMessage id="Browse..." />
        </Button>
      </SingleCellRow>
      <SingleCellRow>
        <Body1>{resultMessage}</Body1>
      </SingleCellRow>
    </>
  )
}
