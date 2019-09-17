/**
 * @file 'CurrentState' component
 */
import React, { useCallback, useEffect, useRef } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import dayjs from 'dayjs'

import { Cell, Grid, Row } from '@material/react-layout-grid'
import Button from '@material/react-button'
import { Headline4 } from '@material/react-typography'
import TextField, { Input } from '@material/react-text-field'

import { AppState } from '../../state/store'
import {
  getDailyRecordOf,
  getLatestMemoOf,
  getLatestStartTimeOf,
  getLatestStopTimeOf,
  start,
  stop,
  updateLatestMemo,
} from '../../state/ducks/records'
import { getTime, updateTime } from '../../state/ducks/running'

//
// Components
//

/**
 * 'CurrentState' component
 */
const CurrentState: React.FC<RouteComponentProps<{}>> = props => {
  const intervalRef = useRef<number>()
  const dispatch = useDispatch()
  const intl = useIntl()

  function timeout(): void {
    dispatch(updateTime())
    intervalRef.current = window.setTimeout(() => timeout(), 1000)
  }
  useEffect(() => {
    timeout()
    return function cleanup() {
      window.clearTimeout(intervalRef.current)
    }
  }, [])

  const handleStart = useCallback(() => {
    dispatch(start())
  }, [])
  const handleStop = useCallback(() => {
    dispatch(stop())
  }, [])
  const handleInput = useCallback(e => {
    dispatch(updateLatestMemo(e.currentTarget.value))
  }, [])

  const time = useSelector((state: AppState) => getTime(state.running))
  const dj = dayjs(time)
  const tomorrow = dj.startOf('date').add(1, 'day')

  const record = useSelector((state: AppState) =>
    getDailyRecordOf(new Date(), state.records)
  )
  const stopTime = record !== null ? getLatestStopTimeOf(record) : null
  const startTime = record !== null ? getLatestStartTimeOf(record) : null
  const memo = record !== null ? getLatestMemoOf(record) : ''

  return (
    <Grid className="current-state">
      <Row>
        <Cell columns={12}>
          <StartButton
            disabled={stopTime !== null}
            time={startTime}
            onClick={handleStart}
          />
        </Cell>
      </Row>
      <Row className="gutter-top">
        <Cell columns={12}>
          <Button
            className="date full-width"
            onClick={() => {
              props.history.push(dj.format('/YYYY/M/D'))
            }}
          >
            <Headline4 tag="span">
              {dj.format(intl.formatMessage({ id: 'Format.date' }))}
            </Headline4>
          </Button>
        </Cell>
      </Row>
      <Row>
        <Cell columns={12}>
          <Headline4 tag="div" className="text-align-center">
            {dj.format(intl.formatMessage({ id: 'Format.time.24' }))}
          </Headline4>
        </Cell>
      </Row>
      <Row className="gutter-top">
        <Cell columns={12}>
          <StopButton time={stopTime} onClick={handleStop} />
        </Cell>
      </Row>
      <Row className="gutter-top">
        <Cell columns={12}>
          <TextField
            textarea={true}
            fullWidth={true}
            disabled={tomorrow.diff(dj, 'm') < 5}
          >
            <Input value={memo} onInput={handleInput} />
          </TextField>
        </Cell>
      </Row>
    </Grid>
  )
}
export default CurrentState

/**
 * StartButton component renderer
 */
const StartButton: React.FC<{
  time: Date | null
  onClick: () => void
  disabled: boolean
}> = props => (
  <Button
    className="full-width"
    data-testid="start"
    unelevated={true}
    disabled={props.disabled !== false || props.time !== null}
    onClick={props.onClick}
  >
    {props.time !== null ? (
      dayjs(props.time).format(
        useIntl().formatMessage({ id: 'Format.time.24' })
      )
    ) : (
      <FormattedMessage id="Start" />
    )}
  </Button>
)

/**
 * StopButton component renderer
 */
const StopButton: React.FC<{
  time: Date | null
  onClick: () => void
}> = props => (
  <Button
    className="full-width"
    data-testid="stop"
    unelevated={true}
    disabled={props.time !== null}
    onClick={props.onClick}
  >
    {props.time !== null ? (
      dayjs(props.time).format(
        useIntl().formatMessage({ id: 'Format.time.24' })
      )
    ) : (
      <FormattedMessage id="Stop" />
    )}
  </Button>
)
