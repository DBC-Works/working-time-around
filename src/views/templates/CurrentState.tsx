/**
 * @file 'CurrentState' component
 */
import React, { FormEvent, useCallback, useEffect, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import dayjs from 'dayjs'

import { Button } from '@rmwc/button'
import '@rmwc/button/styles'
import { Grid, GridCell, GridRow } from '@rmwc/grid'
import '@rmwc/grid/styles'
import { TextField } from '@rmwc/textfield'
import '@rmwc/textfield/styles'
import { Fab } from '@rmwc/fab'
import '@rmwc/fab/styles'
import { Typography } from '@rmwc/typography'
import '@rmwc/typography/styles'

import { AppState } from '../../state/store'
import {
  getDailyRecordOf,
  getLatestMemoOf,
  getLatestOf,
  start,
  stop,
  updateLatestMemo,
} from '../../state/ducks/records'
import {
  getTime,
  getWindow,
  showMessage,
  updateTime,
} from '../../state/ducks/running'
import {
  canSendMessageToSlack,
  getDefaultBreakTimeLengthMin,
  getSlackSettings,
} from '../../state/ducks/settings'

import SingleCellRow from '../molecules/SingleCellRow'
import { formatSendFailedMessage, sendMessageToSlack } from '../pages/App'

//
// Components
//

/**
 * 'CurrentState' component
 */
const CurrentState: React.FC = () => {
  const intervalRef = useRef<number>()

  const dispatch = useDispatch()
  useEffect((): (() => void) => {
    const timeout = (): void => {
      dispatch(updateTime())
      intervalRef.current = window.setTimeout(() => timeout(), 1000)
    }
    timeout()
    return function cleanup(): void {
      window.clearTimeout(intervalRef.current)
    }
  }, [])

  const time = useSelector((state: AppState) => getTime(state.running))
  const defaultBreakTimeLength = useSelector((state: AppState) =>
    getDefaultBreakTimeLengthMin(state.settings)
  )
  const record = useSelector((state: AppState) =>
    getDailyRecordOf(time, state.records)
  )
  const latest = getLatestOf(record, defaultBreakTimeLength)
  const dj = dayjs(time)

  const history = useHistory()
  const handleClick = useCallback(() => {
    history.push(dj.format('/YYYY/M/D'))
  }, [time])

  const intl = useIntl()
  return (
    <Grid className="current-state">
      <GridRow>
        <GridCell span={12}>
          <StartButton disabled={latest.stop !== null} time={latest.start} />
        </GridCell>
      </GridRow>
      <SingleCellRow rowClassName="gutter-top">
        <Button className="date full-width" onClick={handleClick}>
          <Typography use="headline4" tag="span">
            {dj.format(intl.formatMessage({ id: 'Format.date' }))}
          </Typography>
        </Button>
      </SingleCellRow>
      <SingleCellRow>
        <Typography use="headline4" tag="div" className="text-align-center">
          {dj.format(intl.formatMessage({ id: 'Format.time.24' }))}
        </Typography>
      </SingleCellRow>
      <SingleCellRow rowClassName="gutter-top">
        <StopButton time={latest.stop} />
      </SingleCellRow>
      <SingleCellRow rowClassName="gutter-top">
        <MemoTextField
          time={time}
          memo={latest.memo}
          afterStopped={latest.stop !== null}
        />
      </SingleCellRow>
    </Grid>
  )
}
export default CurrentState

/**
 * 'StartButton' component renderer
 */
const StartButton: React.FC<{
  time: Date | null
  disabled: boolean
}> = (props) => {
  const initialRef = useRef<{ time: Date | null }>({ time: props.time })

  const intl = useIntl()
  const labelStart = intl.formatMessage({ id: 'Start' })
  const timeFormat = intl.formatMessage({ id: 'Format.time.24' })

  const w = useSelector((state: AppState) => getWindow(state.running))
  const slackSettings = useSelector((state: AppState) =>
    getSlackSettings(state.settings)
  )
  const canPost = useSelector((state: AppState) =>
    canSendMessageToSlack(state.settings)
  )
  const dispatch = useDispatch()
  useEffect(
    canPost !== false
      ? (): void => {
          if (props.time !== null && props.time !== initialRef.current.time) {
            if (w.navigator.onLine === false) {
              dispatch(
                showMessage(
                  intl.formatMessage({ id: 'Could.not.send.because.offline.' })
                )
              )
              return
            }

            sendMessageToSlack(
              slackSettings,
              `[${labelStart}] ${dayjs(props.time).format(timeFormat)}`
            ).then((resultMessage) => {
              if (0 < resultMessage.length) {
                dispatch(
                  showMessage(formatSendFailedMessage(intl, resultMessage))
                )
              }
            })
          }
        }
      : (): void => {},
    [canPost, props.time]
  )

  const defaultBreakTimeLength = useSelector((state: AppState) =>
    getDefaultBreakTimeLengthMin(state.settings)
  )
  const handleClick = useCallback(() => {
    dispatch(start(defaultBreakTimeLength))
  }, [])

  return (
    <Button
      className="full-width"
      unelevated={true}
      disabled={props.disabled !== false || props.time !== null}
      onClick={handleClick}
    >
      {props.time !== null ? dayjs(props.time).format(timeFormat) : labelStart}
    </Button>
  )
}

/**
 * 'StopButton' component renderer
 */
const StopButton: React.FC<{
  time: Date | null
}> = (props) => {
  const initialRef = useRef<{ time: Date | null }>({ time: props.time })

  const record = useSelector((state: AppState) =>
    getDailyRecordOf(
      props.time !== null ? props.time : new Date(),
      state.records
    )
  )
  const memo = record !== null ? getLatestMemoOf(record) : ''

  const intl = useIntl()
  const labelStop = intl.formatMessage({ id: 'Stop' })
  const timeFormat = intl.formatMessage({ id: 'Format.time.24' })

  const w = useSelector((state: AppState) => getWindow(state.running))
  const canPost = useSelector((state: AppState) =>
    canSendMessageToSlack(state.settings)
  )
  const slackSettings = useSelector((state: AppState) =>
    getSlackSettings(state.settings)
  )
  const dispatch = useDispatch()
  useEffect(
    canPost !== false
      ? (): void => {
          if (props.time !== null && props.time !== initialRef.current.time) {
            if (w.navigator.onLine === false) {
              dispatch(
                showMessage(
                  intl.formatMessage({ id: 'Could.not.send.because.offline.' })
                )
              )
              return
            }

            sendMessageToSlack(
              slackSettings,
              `[${labelStop}] ${dayjs(props.time).format(timeFormat)}\n${memo}`
            ).then((resultMessage) => {
              if (0 < resultMessage.length) {
                dispatch(
                  showMessage(formatSendFailedMessage(intl, resultMessage))
                )
              }
            })
          }
        }
      : (): void => {},
    [canPost, props.time]
  )

  const defaultBreakTimeLength = useSelector((state: AppState) =>
    getDefaultBreakTimeLengthMin(state.settings)
  )
  const handleClick = useCallback(() => {
    dispatch(stop(defaultBreakTimeLength))
  }, [])
  return (
    <Button
      className="full-width"
      unelevated={true}
      disabled={props.time !== null}
      onClick={handleClick}
    >
      {props.time !== null ? dayjs(props.time).format(timeFormat) : labelStop}
    </Button>
  )
}

/**
 * 'MemoTextField' component renderer
 */
const MemoTextField: React.FC<{
  memo: string
  time: Date
  afterStopped: boolean
}> = (props) => {
  const updateRef = useRef<{
    initial: string | null
    updated: string | null
  }>({
    initial: props.memo,
    updated: props.memo,
  })

  const dj = dayjs(props.time)
  const tomorrow = dj.startOf('date').add(1, 'day')

  const canPost = useSelector((state: AppState) =>
    canSendMessageToSlack(state.settings)
  )
  const w = useSelector((state: AppState) => getWindow(state.running))
  const slackSettings = useSelector((state: AppState) =>
    getSlackSettings(state.settings)
  )
  const intl = useIntl()
  const dispatch = useDispatch()
  const postUpdate = (): void => {
    const postMemo = updateRef.current.updated
    if (
      postMemo === null ||
      postMemo.length === 0 ||
      postMemo === updateRef.current.initial
    ) {
      return
    }
    if (w.navigator.onLine === false) {
      dispatch(
        showMessage(
          intl.formatMessage({ id: 'Could.not.send.because.offline.' })
        )
      )
      return
    }

    sendMessageToSlack(
      slackSettings,
      `[${intl.formatMessage({ id: 'Memo' })}] ${postMemo}`
    ).then((resultMessage) => {
      if (0 < resultMessage.length) {
        dispatch(showMessage(formatSendFailedMessage(intl, resultMessage)))
      }
    })
  }

  useEffect(() => {
    updateRef.current.initial = props.memo
    updateRef.current.updated = props.memo
  }, [props.afterStopped])

  const requirePost =
    props.afterStopped !== false &&
    canPost !== false &&
    props.memo !== updateRef.current.initial
  useEffect(
    requirePost !== false
      ? (): (() => void) => {
          w.addEventListener('unload', postUpdate)

          const beforeUnloadHandler = (e: BeforeUnloadEvent): string => {
            e.returnValue = 'Do you want to leave this page?'
            return e.returnValue
          }
          w.addEventListener('beforeunload', beforeUnloadHandler)

          return function cleanup(): void {
            w.removeEventListener('beforeunload', beforeUnloadHandler)
            w.removeEventListener('unload', postUpdate)
            postUpdate()
          }
        }
      : (): void => {},
    [requirePost]
  )

  const handleClickSendUpdate =
    requirePost !== false
      ? (): void => {
          postUpdate()
          updateRef.current.initial = props.memo
          updateRef.current.updated = props.memo
        }
      : undefined

  const handleChange = useCallback((e: FormEvent<HTMLInputElement>) => {
    updateRef.current.updated = e.currentTarget.value
    dispatch(updateLatestMemo(e.currentTarget.value))
  }, [])

  return (
    <>
      <TextField
        textarea={true}
        outlined={true}
        fullwidth={true}
        disabled={tomorrow.diff(dj, 'm') < 5}
        value={props.memo}
        onChange={handleChange}
      />
      {requirePost !== false && (
        <div className="app-fab--absolute">
          <Fab
            icon={<i className="material-icons">send</i>}
            label={intl.formatMessage({ id: 'Send.update' })}
            onClick={handleClickSendUpdate}
          />
        </div>
      )}
    </>
  )
}
