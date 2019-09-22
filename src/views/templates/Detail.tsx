/**
 * @file 'Detail' component
 */
import React, { useCallback, useEffect, useRef } from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import dayjs from 'dayjs'

import Fab from '@material/react-fab'
import { Cell, Grid, Row } from '@material/react-layout-grid'
import MaterialIcon from '@material/react-material-icon'
import TextField, { Input } from '@material/react-text-field'
import { Headline6 } from '@material/react-typography'

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

  const intl = useIntl()

  let headingClassName = ''
  switch (dj.day()) {
    case 0:
      headingClassName = 'sunday'
      break
    case 6:
      headingClassName = 'saturday'
      break
  }

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
  const dispatch = useDispatch()
  const intl = useIntl()

  const dj = dayjs(props.target)

  const latestRef = useRef<{
    latestStart: number
    latestStop: number
    latestMemo: number
  }>({
    latestStart: 0,
    latestStop: 0,
    latestMemo: 0,
  })

  useEffect(() => {
    if (record !== null) {
      latestRef.current.latestStart = record.starts.length
      latestRef.current.latestStop = record.stops.length
      latestRef.current.latestMemo = record.memos.length
    }
  }, [])

  const record = useSelector((state: AppState) =>
    getDailyRecordOf(props.target, state.records)
  )
  const start = record !== null ? getLatestStartTimeOf(record) : null
  const stop = record !== null ? getLatestStopTimeOf(record) : null
  const memo = record !== null ? getLatestMemoOf(record) : ''

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
        date: props.target,
        memo: e.currentTarget.value,
        targetIndex: latestRef.current.latestMemo,
      })
    )
  }, [])

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
          <Headline6 tag="h2">
            <FormattedMessage id="Memo" />
          </Headline6>
        </Cell>
      </Row>
      <Row>
        <Cell columns={12}>
          <TextField textarea={true} fullWidth={true}>
            <Input value={memo} onInput={handleInputMemo} />
          </TextField>
        </Cell>
      </Row>
    </>
  )
}
