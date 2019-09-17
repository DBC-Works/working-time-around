/**
 * @file 'Detail' component
 */
import React, { useCallback, useEffect, useRef } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import dayjs from 'dayjs'

import { Cell, Grid, Row } from '@material/react-layout-grid'
import TextField, { Input } from '@material/react-text-field'
import { Headline4, Headline5 } from '@material/react-typography'

import { AppState } from '../../state/store'
import {
  getDailyRecordOf,
  getLatestMemoOf,
  getLatestStartTimeOf,
  getLatestStopTimeOf,
  updateMemo,
  updateStartTime,
  updateStopTime,
} from '../../state/ducks/records'

import TimeSelect from '../molecules/TimeSelect'

/**
 * 'Detail' component
 */
const Detail: React.FC<
  RouteComponentProps<{ year: string; month: string; date: string }>
> = props => {
  const { year, month, date } = props.match.params
  const target = new Date(+year, +month - 1, +date)
  const dj = dayjs(target)

  const latestRef = useRef<{
    latestStart: number
    latestStop: number
    latestMemo: number
  }>({
    latestStart: 0,
    latestStop: 0,
    latestMemo: 0,
  })
  const dispatch = useDispatch()
  const intl = useIntl()

  const record = useSelector((state: AppState) =>
    getDailyRecordOf(target, state.records)
  )
  const start = record !== null ? getLatestStartTimeOf(record) : null
  const stop = record !== null ? getLatestStopTimeOf(record) : null
  const memo = record !== null ? getLatestMemoOf(record) : ''

  useEffect(() => {
    if (record !== null) {
      latestRef.current.latestStart = record.starts.length
      latestRef.current.latestStop = record.stops.length
      latestRef.current.latestMemo = record.memos.length
    }
  }, [])

  const handleChangeStartTime = useCallback(time => {
    dispatch(
      updateStartTime({
        time: dj
          .hour(time.getHours())
          .minute(time.getMinutes())
          .toDate(),
        targetIndex: latestRef.current.latestStart,
      })
    )
  }, [])
  const handleChangeStopTime = useCallback(time => {
    dispatch(
      updateStopTime({
        time: dj
          .hour(time.getHours())
          .minute(time.getMinutes())
          .toDate(),
        targetIndex: latestRef.current.latestStop,
      })
    )
  }, [])
  const handleInputMemo = useCallback(e => {
    dispatch(
      updateMemo({
        date: target,
        memo: e.currentTarget.value,
        targetIndex: latestRef.current.latestMemo,
      })
    )
  }, [])

  const headingClassNames = ['text-align-center']
  if (dj.day() === 0) {
    headingClassNames.push('sunday')
  } else if (dj.day() === 6) {
    headingClassNames.push('saturday')
  }

  return (
    <Grid className="detail">
      <Row>
        <Cell columns={12}>
          <Headline4 tag="h1" className={headingClassNames.join(' ')}>
            {dj.format(intl.formatMessage({ id: 'Format.date' }))}
          </Headline4>
        </Cell>
      </Row>
      <Row>
        <Cell columns={12}>
          <Headline5 tag="h2">
            <FormattedMessage id="Time" />
          </Headline5>
        </Cell>
      </Row>
      <Row>
        <Cell columns={12}>
          <TimeSelect
            time={start}
            label={intl.formatMessage({ id: 'Start' })}
            onChange={handleChangeStartTime}
          />
          <span className="between">-</span>
          <TimeSelect
            time={stop}
            label={intl.formatMessage({ id: 'Stop' })}
            onChange={handleChangeStopTime}
          />
        </Cell>
      </Row>
      <Row>
        <Cell columns={12}>
          <Headline5 tag="h2">
            <FormattedMessage id="Memo" />
          </Headline5>
        </Cell>
      </Row>
      <Row>
        <Cell columns={12}>
          <TextField textarea={true} fullWidth={true}>
            <Input value={memo} onInput={handleInputMemo} />
          </TextField>
        </Cell>
      </Row>
    </Grid>
  )
}
export default Detail
