/**
 * @file 'Detail' component
 */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FormattedMessage, IntlShape, useIntl } from 'react-intl'
import dayjs from 'dayjs'

import Button from '@material/react-button'
import Fab from '@material/react-fab'
import { Cell, Grid, Row } from '@material/react-layout-grid'
import MaterialIcon from '@material/react-material-icon'
import TextField, { Input } from '@material/react-text-field'
import { Headline6 } from '@material/react-typography'

import { AppState } from '../../state/store'
import {
  getDailyRecordOf,
  getLatestOf,
  recordsTypes,
  updateMemo,
  updateStartTime,
  updateStopTime,
} from '../../state/ducks/records'
import { getWindow, showMessage } from '../../state/ducks/running'
import {
  canSendMessageToSlack,
  getSlackSettings,
  settingsTypes,
} from '../../state/ducks/settings'

import TimeSelect from '../molecules/TimeSelect'
import { formatSendFailedMessage, sendMessageToSlack } from '../pages/App'

//
// Types & variables
//

/**
 * Update data place holder
 */
interface UpdatePlaceHolder {
  start: Date | null
  stop: Date | null
  memo: string | null
}

/**
 * Update data place holder initial value
 */
const UPDATED_PLACE_HOLDER_INITIAL_VALUE = {
  start: null,
  stop: null,
  memo: null,
}

//
// Functions
//

/**
 * Updated?
 * @param update Update data place holder
 * @returns True if updated
 */
function isUpdated(update: UpdatePlaceHolder): boolean {
  return update.start !== null || update.stop !== null || update.memo !== null
}

/**
 * Format time updated message
 * @param initial Initial time
 * @param updated Updated time
 * @param heading Heading text
 * @param formatTime Time format
 * @param noRecordLiteral No record literal
 * @returns Formatted message
 */
function formatTimeUpdateMessage(
  initial: Date | null,
  updated: Date,
  heading: string,
  formatTime: string,
  noRecordLiteral: string
): string {
  return `${heading}: ${
    initial !== null ? dayjs(initial).format(formatTime) : noRecordLiteral
  } -> ${dayjs(updated).format(formatTime)}`
}

/**
 * Send update info to Slack
 * @param target Date to update
 * @param initial Initial record
 * @param update Update place holder
 * @param settings Slack settings
 * @param intl IntlShape instance
 * @returns Result message(empty if succeeded)
 */
async function sendUpdateToSlack(
  target: Date,
  initial: recordsTypes.DailyLatestRecord,
  update: UpdatePlaceHolder,
  settings: settingsTypes.SlackSettings,
  intl: IntlShape
): Promise<string> {
  const formatDate = intl.formatMessage({ id: 'Format.date' })
  const formatTime = intl.formatMessage({ id: 'Format.time.24' })
  const noRecordLiteral = intl.formatMessage({ id: '(No.record)' })

  const messages = [
    `[${intl.formatMessage({ id: 'Edit' })}] ${dayjs(target).format(
      formatDate
    )}`,
  ]
  if (update.start !== null) {
    messages.push(
      formatTimeUpdateMessage(
        initial.start,
        update.start,
        intl.formatMessage({ id: 'Start' }),
        formatTime,
        noRecordLiteral
      )
    )
  }
  if (update.stop !== null) {
    messages.push(
      formatTimeUpdateMessage(
        initial.stop,
        update.stop,
        intl.formatMessage({ id: 'Stop' }),
        formatTime,
        noRecordLiteral
      )
    )
  }
  if (update.memo !== null) {
    messages.push(`${intl.formatMessage({ id: 'Memo' })}: "${initial.memo}"`)
    messages.push(` -> "${update.memo}"`)
  }
  return await sendMessageToSlack(settings, messages.join('\n'))
}

//
// Components
//

/**
 * 'Detail' component
 */
const Detail: React.FC<
  RouteComponentProps<{ year: string; month: string; date: string }>
> = props => {
  const { year, month, date } = props.match.params
  const target = new Date(+year, +month - 1, +date)
  const dj = dayjs(target)

  let headingClassName = ''
  switch (dj.day()) {
    case 0:
      headingClassName = 'sunday'
      break
    case 6:
      headingClassName = 'saturday'
      break
  }

  const intl = useIntl()
  return (
    <Grid className="detail">
      <Row className="text-align-center">
        <Cell
          desktopColumns={1}
          tabletColumns={1}
          phoneColumns={1}
          className="navigation-before"
        >
          <Link to={dj.add(-1, 'day').format('/YYYY/M/D')}>
            <MaterialIcon
              aria-label={intl.formatMessage({ id: 'Prev.day' })}
              icon="navigate_before"
            />
          </Link>
        </Cell>
        <Cell desktopColumns={10} tabletColumns={6} phoneColumns={2}>
          <Headline6 tag="h1" className={headingClassName}>
            {dj.format(intl.formatMessage({ id: 'Format.date' }))}
          </Headline6>
        </Cell>
        <Cell
          desktopColumns={1}
          tabletColumns={1}
          phoneColumns={1}
          className="navigation-next"
        >
          <Link to={dj.add(1, 'day').format('/YYYY/M/D')}>
            <MaterialIcon
              aria-label={intl.formatMessage({ id: 'Next.day' })}
              icon="navigate_next"
            />
          </Link>
        </Cell>
      </Row>
      <DetailForm target={target} />
      <Row>
        <Cell columns={12} className="app-fab--absolute">
          <Link to={dj.format('/YYYY/M')}>
            <Fab
              icon={<i className="material-icons">list</i>}
              textLabel={intl.formatMessage({ id: 'Back.to.list' })}
            />
          </Link>
        </Cell>
      </Row>
    </Grid>
  )
}
export default Detail

/**
 * 'DetailForm' component
 */
const DetailForm: React.FC<{ target: Date }> = props => {
  const recordRef = useRef<{
    dateKey: string
    latestStart: number
    latestStop: number
    latestMemo: number
  }>({
    dateKey: '',
    latestStart: 0,
    latestStop: 0,
    latestMemo: 0,
  })
  const updateRef = useRef<{
    initial: recordsTypes.DailyLatestRecord
    updated: UpdatePlaceHolder
  }>({
    initial: {
      start: null,
      stop: null,
      memo: '',
    },
    updated: { ...UPDATED_PLACE_HOLDER_INITIAL_VALUE },
  })
  const [requireUpdate, setRequireUpdate] = useState(false)

  const resetUpdate = (): void => {
    setRequireUpdate(false)
    updateRef.current.updated = {
      ...UPDATED_PLACE_HOLDER_INITIAL_VALUE,
    }
  }

  const dj = dayjs(props.target)
  const dateKey = dj.format('YYYYMMDD')

  const w = useSelector((state: AppState) => getWindow(state.running))
  const canPost = useSelector((state: AppState) =>
    canSendMessageToSlack(state.settings)
  )
  const slackSettings = useSelector((state: AppState) =>
    getSlackSettings(state.settings)
  )
  const intl = useIntl()
  const dispatch = useDispatch()
  const updated = isUpdated(updateRef.current.updated)
  const postUpdate = (): void => {
    if (updated !== false) {
      if (w.navigator.onLine === false) {
        dispatch(
          showMessage(
            intl.formatMessage({ id: 'Could.not.send.because.offline.' })
          )
        )
        return
      }

      sendUpdateToSlack(
        props.target,
        updateRef.current.initial,
        updateRef.current.updated,
        slackSettings,
        intl
      ).then(resultMessage => {
        if (0 < resultMessage.length) {
          dispatch(showMessage(formatSendFailedMessage(intl, resultMessage)))
        }
      })
    }
  }

  useEffect(
    canPost !== false
      ? (): (() => void) => {
          w.addEventListener('unload', postUpdate)
          return function cleanup(): void {
            w.removeEventListener('unload', postUpdate)
            postUpdate()
          }
        }
      : (): void => {},
    [canPost]
  )
  useEffect(
    canPost !== false && updated !== false
      ? (): (() => void) => {
          const beforeUnloadHandler = (e: BeforeUnloadEvent): string => {
            setRequireUpdate(true)
            e.returnValue = 'Do you want to leave this page?'
            return e.returnValue
          }
          w.addEventListener('beforeunload', beforeUnloadHandler)
          return function cleanup(): void {
            w.removeEventListener('beforeunload', beforeUnloadHandler)
          }
        }
      : (): void => {},
    [canPost, updated]
  )

  const record = useSelector((state: AppState) =>
    getDailyRecordOf(props.target, state.records)
  )
  const latest = getLatestOf(record)
  useEffect((): void => {
    if (dateKey === recordRef.current.dateKey) {
      return
    }

    if (0 < recordRef.current.dateKey.length && canPost !== false) {
      postUpdate()
    }
    recordRef.current.dateKey = dateKey
    updateRef.current.initial = latest
    if (record !== null) {
      recordRef.current.latestStart = record.starts.length
      recordRef.current.latestStop = record.stops.length
      recordRef.current.latestMemo = record.memos.length
    } else {
      recordRef.current.latestStart = 0
      recordRef.current.latestStop = 0
      recordRef.current.latestMemo = 0
    }
    resetUpdate()
  }, [dateKey, record])

  const handleChangeStartTime = useCallback(time => {
    updateRef.current.updated.start = dj
      .hour(time.getHours())
      .minute(time.getMinutes())
      .toDate()
    dispatch(
      updateStartTime({
        time: updateRef.current.updated.start,
        targetIndex: recordRef.current.latestStart,
      })
    )
  }, [])
  const handleChangeStopTime = useCallback(time => {
    updateRef.current.updated.stop = dj
      .hour(time.getHours())
      .minute(time.getMinutes())
      .toDate()
    dispatch(
      updateStopTime({
        time: updateRef.current.updated.stop,
        targetIndex: recordRef.current.latestStop,
      })
    )
  }, [])
  const handleInputMemo = useCallback(
    e => {
      updateRef.current.updated.memo = e.currentTarget.value
      dispatch(
        updateMemo({
          date: props.target,
          memo: e.currentTarget.value,
          targetIndex: recordRef.current.latestMemo,
        })
      )
    },
    [props.target]
  )
  const handleClickRequireUpdate = useCallback((): void => {
    postUpdate()
    resetUpdate()
  }, [])

  return (
    <>
      <Time
        start={latest.start}
        stop={latest.stop}
        onChangeStartTime={handleChangeStartTime}
        onChangeStopTime={handleChangeStopTime}
      />
      <Memo memo={latest.memo} onInput={handleInputMemo} />
      <RequireUpdateButton
        require={requireUpdate}
        onClick={handleClickRequireUpdate}
      />
    </>
  )
}

/**
 * 'Time' component
 */
const Time: React.FC<{
  start: Date | null
  stop: Date | null
  onChangeStartTime: (time: Date) => void
  onChangeStopTime: (time: Date) => void
}> = props => {
  const intl = useIntl()
  return (
    <>
      <Row>
        <Cell columns={12}>
          <Headline6 tag="h2">
            <FormattedMessage id="Time" />
          </Headline6>
        </Cell>
      </Row>
      <Row>
        <Cell columns={12}>
          <TimeSelect
            time={props.start}
            label={intl.formatMessage({ id: 'Start' })}
            onChange={props.onChangeStartTime}
          />
          <span className="between">-</span>
          <TimeSelect
            time={props.stop}
            label={intl.formatMessage({ id: 'Stop' })}
            onChange={props.onChangeStopTime}
          />
        </Cell>
      </Row>
    </>
  )
}

/**
 * 'Memo' component
 */
const Memo: React.FC<{
  memo: string
  onInput: React.FormEventHandler<HTMLInputElement>
}> = props => {
  return (
    <>
      <Row>
        <Cell columns={12}>
          <Headline6 tag="h2">
            <FormattedMessage id="Memo" />
          </Headline6>
        </Cell>
      </Row>
      <Row>
        <Cell columns={12}>
          <TextField textarea={true} fullWidth={true}>
            <Input value={props.memo} onInput={props.onInput} />
          </TextField>
        </Cell>
      </Row>
    </>
  )
}

/**
 * 'RequireUpdateButton' component
 */
const RequireUpdateButton: React.FC<{
  require: boolean
  onClick: React.MouseEventHandler<HTMLButtonElement>
}> = props => {
  if (props.require === false) {
    return null
  }

  return (
    <Row className="gutter-top">
      <Cell columns={12}>
        <Button
          className="full-width"
          unelevated={true}
          onClick={props.onClick}
        >
          <FormattedMessage id="Send.update" />
        </Button>
      </Cell>
    </Row>
  )
}
