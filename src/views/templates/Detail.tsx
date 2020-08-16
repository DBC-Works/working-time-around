/**
 * @file 'Detail' template component
 */
import React, {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FormattedMessage, IntlShape, useIntl } from 'react-intl'
import { Action } from 'typescript-fsa'
import dayjs, { Dayjs } from 'dayjs'

import { Button } from '@rmwc/button'
import '@rmwc/button/styles'
import { Fab } from '@rmwc/fab'
import '@rmwc/fab/styles'
import { Cell, Grid, Row } from '@material/react-layout-grid'
import { Icon } from '@rmwc/icon'
import '@rmwc/icon/styles'
import { TextField } from '@rmwc/textfield'
import '@rmwc/textfield/styles'
import { Typography } from '@rmwc/typography'
import '@rmwc/typography/styles'
import assert from 'assert'

import { AppState } from '../../state/store'
import {
  DailyLatestRecord,
  DailyRecord,
  getDailyRecordOf,
  getLatestOf,
  KEY_RECORD,
  UpdateBreakTimeActionPayload,
  updateBreakTimeLengthMin,
  updateMemo,
  updateStartTime,
  updateStopTime,
} from '../../state/ducks/records'
import { getWindow, showMessage } from '../../state/ducks/running'
import {
  canSendMessageToSlack,
  getDefaultBreakTimeLengthMin,
  getSlackSettings,
  SlackSettings,
} from '../../state/ducks/settings'

import BreakTimeLengthSelect from '../molecules/BreakTimeLengthSelect'
import SingleCellRow from '../molecules/SingleCellRow'
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
  breakTimeLengthMin: number | null
}

/**
 * Update data place holder initial value
 */
const UPDATED_PLACE_HOLDER_INITIAL_VALUE: UpdatePlaceHolder = {
  start: null,
  stop: null,
  memo: null,
  breakTimeLengthMin: null,
}

/**
 * Latest indexes of DailyRecord properties
 */
interface LatestIndexes {
  dateKey: string
  latestStart: number
  latestStop: number
  latestMemo: number
  latestBreakTimeMin: number
}

/**
 * Latest indexes initial value
 */
const LATEST_INDEXES_INITIAL_VALUE: LatestIndexes = {
  dateKey: '',
  latestStart: 0,
  latestStop: 0,
  latestMemo: 0,
  latestBreakTimeMin: 0,
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
  initial: DailyLatestRecord,
  update: UpdatePlaceHolder,
  settings: SlackSettings,
  intl: IntlShape
): Promise<string> {
  assert(update.start !== null || update.stop !== null || update.memo !== null)

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

/**
 * Translate time to target date
 * @param time Selected time
 * @param dj Dayjs instance of target day
 * @returns Target date including time
 */
function translateTimeToDate(time: Date, dj: Dayjs): Date {
  return dj.hour(time.getHours()).minute(time.getMinutes()).toDate()
}

/**
 * Get latest indexes of DaylyRecord properties
 * @param dateKey Date key
 * @param record Target record
 * @returns Latest indexes
 */
function getDailyRecordLatestIndexes(
  dateKey: string,
  record: DailyRecord | null
): LatestIndexes {
  if (record === null) {
    return {
      ...LATEST_INDEXES_INITIAL_VALUE,
      dateKey,
    }
  }
  return {
    dateKey,
    latestStart: record.starts.length,
    latestStop: record.stops.length,
    latestMemo: record.memos.length,
    latestBreakTimeMin:
      record.breakTimeLengthsMin !== undefined
        ? record.breakTimeLengthsMin.length
        : 0,
  }
}

//
// Components
//

/**
 * 'Detail' component
 */
const Detail: React.FC = () => {
  const { year, month, date } = useParams()
  const target = new Date(
    +(year as string),
    +(month as string) - 1,
    +(date as string)
  )
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
            <Icon
              aria-label={intl.formatMessage({ id: 'Prev.day' })}
              icon="navigate_before"
            />
          </Link>
        </Cell>
        <Cell desktopColumns={10} tabletColumns={6} phoneColumns={2}>
          <Typography use="headline6" tag="h1" className={headingClassName}>
            {dj.format(intl.formatMessage({ id: 'Format.date' }))}
          </Typography>
        </Cell>
        <Cell
          desktopColumns={1}
          tabletColumns={1}
          phoneColumns={1}
          className="navigation-next"
        >
          <Link to={dj.add(1, 'day').format('/YYYY/M/D')}>
            <Icon
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
              label={intl.formatMessage({ id: 'Back.to.list' })}
            />
          </Link>
        </Cell>
      </Row>
    </Grid>
  )
}
export default Detail

/**
 * 'Heading in detail' component
 */
const HeadingInDetail: React.FC = (props) => (
  <SingleCellRow>
    <Typography use="headline6" tag="h2">
      {props.children}
    </Typography>
  </SingleCellRow>
)

/**
 * 'DetailForm' component
 */
const DetailForm: React.FC<{ target: Date }> = (props) => {
  const dj = dayjs(props.target)
  const dateKey = dj.format(KEY_RECORD)

  const w = useSelector((state: AppState) => getWindow(state.running))
  const canPost = useSelector((state: AppState) =>
    canSendMessageToSlack(state.settings)
  )
  const slackSettings = useSelector((state: AppState) =>
    getSlackSettings(state.settings)
  )
  const record = useSelector((state: AppState) =>
    getDailyRecordOf(props.target, state.records)
  )
  const defaultBreakTimeLength = useSelector((state: AppState) =>
    getDefaultBreakTimeLengthMin(state.settings)
  )
  const latest = getLatestOf(record, defaultBreakTimeLength)

  const recordRef = useRef<LatestIndexes>(
    getDailyRecordLatestIndexes(dateKey, record)
  )
  const updateRef = useRef<{
    initial: DailyLatestRecord
    updated: UpdatePlaceHolder
  }>({
    initial: latest,
    updated: { ...UPDATED_PLACE_HOLDER_INITIAL_VALUE },
  })
  const [requireUpdate, setRequireUpdate] = useState(false)

  const resetUpdate = (): void => {
    setRequireUpdate(false)
    updateRef.current.updated = {
      ...UPDATED_PLACE_HOLDER_INITIAL_VALUE,
    }
  }

  const intl = useIntl()
  const dispatch = useDispatch()
  const updated = isUpdated(updateRef.current.updated)
  const postUpdate = (target: Date): void => {
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
        target,
        updateRef.current.initial,
        updateRef.current.updated,
        slackSettings,
        intl
      ).then((resultMessage) => {
        if (0 < resultMessage.length) {
          dispatch(showMessage(formatSendFailedMessage(intl, resultMessage)))
        }
      })
    }
  }

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
            postUpdate(props.target)
          }
        }
      : (): void => {},
    [canPost, updated]
  )

  useEffect((): void => {
    if (dateKey === recordRef.current.dateKey) {
      return
    }

    if (0 < recordRef.current.dateKey.length && canPost !== false) {
      const dj = dayjs(recordRef.current.dateKey, KEY_RECORD)
      postUpdate(dj.toDate())
    }
    recordRef.current = getDailyRecordLatestIndexes(dateKey, record)
    updateRef.current.initial = latest
    resetUpdate()
  }, [dateKey, record])

  const handleChangeStartTime = useCallback((time: Date) => {
    updateRef.current.updated.start = translateTimeToDate(time, dj)
    dispatch(
      updateStartTime({
        time: updateRef.current.updated.start,
        targetIndex: recordRef.current.latestStart,
      })
    )
  }, [])
  const handleChangeStopTime = useCallback((time: Date) => {
    updateRef.current.updated.stop = translateTimeToDate(time, dj)
    dispatch(
      updateStopTime({
        time: updateRef.current.updated.stop,
        targetIndex: recordRef.current.latestStop,
      })
    )
  }, [])
  const handleInputMemo = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
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
    postUpdate(props.target)
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
      <BreakTimeLength
        date={props.target}
        lengthMin={latest.breakTimeLengthMin}
        targetIndex={recordRef.current.latestBreakTimeMin}
      />
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
}> = (props) => {
  const intl = useIntl()
  return (
    <>
      <HeadingInDetail>
        <FormattedMessage id="Time" />
      </HeadingInDetail>
      <SingleCellRow>
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
      </SingleCellRow>
    </>
  )
}

/**
 * 'Memo' component
 */
const Memo: React.FC<{
  memo: string
  onInput: React.FormEventHandler<HTMLInputElement>
}> = (props) => {
  return (
    <>
      <HeadingInDetail>
        <FormattedMessage id="Memo" />
      </HeadingInDetail>
      <SingleCellRow>
        <TextField
          textarea={true}
          outlined={true}
          fullwidth={true}
          value={props.memo}
          onInput={props.onInput}
        />
      </SingleCellRow>
    </>
  )
}

/**
 * 'BreakTimeLength' component
 */
const BreakTimeLength: React.FC<{
  date: Date
  lengthMin: number | null
  targetIndex: number
}> = (props) => {
  const { date, lengthMin, targetIndex } = props
  return (
    <div data-testid="break-time-length">
      <HeadingInDetail>
        <FormattedMessage id="Break.time.length" />
      </HeadingInDetail>
      <SingleCellRow>
        <BreakTimeLengthSelect
          lengthMin={lengthMin}
          actionCreators={{
            update: (lengthMin: number): Action<UpdateBreakTimeActionPayload> =>
              updateBreakTimeLengthMin({
                date,
                breakTimeLengthMin: lengthMin,
                targetIndex,
              }),
          }}
        />
      </SingleCellRow>
    </div>
  )
}

/**
 * 'RequireUpdateButton' component
 */
const RequireUpdateButton: React.FC<{
  require: boolean
  onClick: React.MouseEventHandler<HTMLButtonElement>
}> = (props) => {
  if (props.require === false) {
    return null
  }

  return (
    <SingleCellRow className="gutter-top">
      <Button className="full-width" unelevated={true} onClick={props.onClick}>
        <FormattedMessage id="Send.update" />
      </Button>
    </SingleCellRow>
  )
}
