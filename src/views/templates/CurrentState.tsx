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
  getOnLine,
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
  }, [dispatch])

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
  }, [dj, history])

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
  const { time } = props
  const initialRef = useRef<{ time: Date | null }>({ time })

  const intl = useIntl()
  const labelStart = intl.formatMessage({ id: 'Start' })
  const timeFormat = intl.formatMessage({ id: 'Format.time.24' })

  const onLine = useSelector((state: AppState) => getOnLine(state.running))
  const { incomingWebhookUrl, context } = useSelector((state: AppState) =>
    getSlackSettings(state.settings)
  )
  const canPost = useSelector((state: AppState) =>
    canSendMessageToSlack(state.settings)
  )
  const dispatch = useDispatch()
  useEffect((): void => {
    if (canPost !== false) {
      if (time !== null && time !== initialRef.current.time) {
        if (onLine === false) {
          dispatch(
            showMessage(
              intl.formatMessage({ id: 'Could.not.send.because.offline.' })
            )
          )
          return
        }

        sendMessageToSlack(
          { incomingWebhookUrl, context },
          `[${labelStart}] ${dayjs(time).format(timeFormat)}`
        ).then((resultMessage) => {
          if (0 < resultMessage.length) {
            dispatch(showMessage(formatSendFailedMessage(intl, resultMessage)))
          }
        })
      }
    }
  }, [
    canPost,
    context,
    dispatch,
    incomingWebhookUrl,
    intl,
    labelStart,
    onLine,
    time,
    timeFormat,
  ])

  const defaultBreakTimeLength = useSelector((state: AppState) =>
    getDefaultBreakTimeLengthMin(state.settings)
  )
  const handleClick = useCallback(() => {
    dispatch(start(defaultBreakTimeLength))
  }, [defaultBreakTimeLength, dispatch])

  return (
    <Button
      className="full-width"
      unelevated={true}
      disabled={props.disabled !== false || time !== null}
      onClick={handleClick}
    >
      {time !== null ? dayjs(time).format(timeFormat) : labelStart}
    </Button>
  )
}

/**
 * 'StopButton' component renderer
 */
const StopButton: React.FC<{
  time: Date | null
}> = (props) => {
  const { time } = props
  const initialRef = useRef<{ time: Date | null }>({ time: time })

  const record = useSelector((state: AppState) =>
    getDailyRecordOf(time !== null ? time : new Date(), state.records)
  )
  const memo = record !== null ? getLatestMemoOf(record) : ''

  const intl = useIntl()
  const labelStop = intl.formatMessage({ id: 'Stop' })
  const timeFormat = intl.formatMessage({ id: 'Format.time.24' })

  const onLine = useSelector((state: AppState) => getOnLine(state.running))
  const canPost = useSelector((state: AppState) =>
    canSendMessageToSlack(state.settings)
  )
  const { incomingWebhookUrl, context } = useSelector((state: AppState) =>
    getSlackSettings(state.settings)
  )
  const dispatch = useDispatch()
  useEffect((): void => {
    if (canPost !== false) {
      if (time !== null && time !== initialRef.current.time) {
        if (onLine === false) {
          dispatch(
            showMessage(
              intl.formatMessage({ id: 'Could.not.send.because.offline.' })
            )
          )
          return
        }

        sendMessageToSlack(
          { incomingWebhookUrl, context },
          `[${labelStop}] ${dayjs(time).format(timeFormat)}\n${memo}`
        ).then((resultMessage) => {
          if (0 < resultMessage.length) {
            dispatch(showMessage(formatSendFailedMessage(intl, resultMessage)))
          }
        })
      }
    }
  }, [
    canPost,
    context,
    dispatch,
    incomingWebhookUrl,
    intl,
    labelStop,
    memo,
    onLine,
    time,
    timeFormat,
  ])

  const defaultBreakTimeLength = useSelector((state: AppState) =>
    getDefaultBreakTimeLengthMin(state.settings)
  )
  const handleClick = useCallback(() => {
    dispatch(stop(defaultBreakTimeLength))
  }, [defaultBreakTimeLength, dispatch])

  return (
    <Button
      className="full-width"
      unelevated={true}
      disabled={time !== null}
      onClick={handleClick}
    >
      {time !== null ? dayjs(time).format(timeFormat) : labelStop}
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
  const onLine = useSelector((state: AppState) => getOnLine(state.running))
  const { incomingWebhookUrl, context } = useSelector((state: AppState) =>
    getSlackSettings(state.settings)
  )
  const intl = useIntl()
  const dispatch = useDispatch()
  const postUpdate = useCallback((): void => {
    const postMemo = updateRef.current.updated
    if (
      postMemo === null ||
      postMemo.length === 0 ||
      postMemo === updateRef.current.initial
    ) {
      return
    }
    if (onLine === false) {
      dispatch(
        showMessage(
          intl.formatMessage({ id: 'Could.not.send.because.offline.' })
        )
      )
      return
    }

    sendMessageToSlack(
      { incomingWebhookUrl, context },
      `[${intl.formatMessage({ id: 'Memo' })}] ${postMemo}`
    ).then((resultMessage) => {
      if (0 < resultMessage.length) {
        dispatch(showMessage(formatSendFailedMessage(intl, resultMessage)))
      }
    })
  }, [context, dispatch, incomingWebhookUrl, intl, onLine])

  useEffect(() => {
    updateRef.current.initial = props.memo
    updateRef.current.updated = props.memo
  }, [props.afterStopped, props.memo])

  const requirePost =
    props.afterStopped !== false &&
    canPost !== false &&
    props.memo !== updateRef.current.initial
  useEffect((): (() => void) => {
    if (requirePost !== false) {
      w.addEventListener('unload', postUpdate)

      const beforeUnloadHandler = (e: BeforeUnloadEvent): void => {
        e.returnValue = 'Do you want to leave this page?'
        return
      }
      w.addEventListener('beforeunload', beforeUnloadHandler)

      return function cleanup(): void {
        w.removeEventListener('beforeunload', beforeUnloadHandler)
        w.removeEventListener('unload', postUpdate)
        postUpdate()
      }
    } else {
      return function cleanup(): void {}
    }
  }, [postUpdate, requirePost, w])

  const handleClickSendUpdate =
    requirePost !== false
      ? (): void => {
          postUpdate()
          updateRef.current.initial = props.memo
          updateRef.current.updated = props.memo
        }
      : undefined

  const handleChange = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
      updateRef.current.updated = e.currentTarget.value
      dispatch(updateLatestMemo(e.currentTarget.value))
    },
    [dispatch]
  )

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
