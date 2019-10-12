/**
 * @file 'List' component
 */
import React, { useCallback } from 'react'
import { Link, RouteComponentProps } from 'react-router-dom'
import H from 'history'
import { useSelector } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import assert from 'assert'
import dayjs, { Dayjs } from 'dayjs'

import Button from '@material/react-button'
import Fab from '@material/react-fab'
import { Cell, Grid, Row } from '@material/react-layout-grid'
import MaterialIcon from '@material/react-material-icon'
import { Headline6 } from '@material/react-typography'

import { AppState } from '../../state/store'
import {
  getLatestOf,
  getMonthlyRecordsOf,
  recordsTypes,
} from '../../state/ducks/records'
import { getSendToMailAddress } from '../../state/ducks/settings'

import {
  makeRecordKey,
  DailyLatestRecord,
} from '../../state/ducks/records/types'

//
// Functions
//

/**
 * Get days in month
 * @param month Target month
 * @returns Array of Dayjs instance
 */
function getDaysInMonth(month: Dayjs): Dayjs[] {
  return Array.from(Array(month.daysInMonth()), (_, i) =>
    dayjs(month).set('date', i + 1)
  )
}

/**
 * Get median time of specified times
 * @param times Times
 * @returns Median time(by minute)
 */
function getMedianMinuteOf(times: Date[]): number {
  assert(0 < times.length)

  const sorted = times
    .map(time => {
      const dj = dayjs(time)
      return dj.hour() * 60 + dj.minute()
    })
    .sort((lhs, rhs) => (lhs < rhs ? -1 : 1))
  const mid = Math.floor(times.length / 2)
  return sorted.length % 2 === 0
    ? Math.floor((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid]
}

/**
 * Make median time string
 * @param times Times to get median
 * @param format Time format
 * @returns Formatted time
 */
function makeMedianTimeStringOf(times: Date[], format: string): string {
  assert(0 < format.length)

  if (times.length === 0) {
    return ''
  }

  const time = getMedianMinuteOf(times)
  return dayjs()
    .hour(time / 60)
    .minute(time % 60)
    .format(format)
}

/**
 * Create mailto uri
 * @param firstDayOfMonth First day of target month
 * @param records Records to send
 * @param mailAddress Mail address to send
 * @returns mailto uri
 */
function createMailToUri(
  firstDayOfMonth: Dayjs,
  records: recordsTypes.Records,
  mailAddress: string
): string {
  const bodyLines = getDaysInMonth(firstDayOfMonth).map(date => {
    const key = makeRecordKey(date.toDate())
    const record = Object.prototype.hasOwnProperty.call(records, key)
      ? records[key]
      : null
    const latest = getLatestOf(record)
    const columns = [
      date.format('YYYY-MM-DD'),
      latest.start !== null ? dayjs(latest.start).format('HH:mm') : '',
      latest.stop !== null ? dayjs(latest.stop).format('HH:mm') : '',
      latest.memo,
    ]
    return columns.map(column => `"${column}"`).join(',')
  })

  const hfieldsMap: { [index: string]: string } = {
    subject: `${firstDayOfMonth.format('ll')} - ${firstDayOfMonth
      .endOf('month')
      .format('ll')}`,
    body: bodyLines.join('\r\n'),
  }
  const hfields = Object.keys(hfieldsMap).map(
    key => `${key}=${encodeURIComponent(hfieldsMap[key])}`
  )
  return `mailto:${encodeURIComponent(mailAddress)}?${hfields.join('&')}`
}

//
// Components
//

/**
 * 'List' component
 */
const List: React.FC<
  RouteComponentProps<{ year: string; month: string }>
> = props => {
  const { year, month } = props.match.params
  const firstDayOfMonth = new Date(+year, +month - 1, 1)
  const dj = dayjs(firstDayOfMonth)

  const records = useSelector((state: AppState) =>
    getMonthlyRecordsOf(firstDayOfMonth, state.records)
  )
  const mailAddress = useSelector((state: AppState) =>
    getSendToMailAddress(state.settings)
  )

  const intl = useIntl()
  const timeFormat = intl.formatMessage({ id: 'Format.time.24' })
  return (
    <Grid className="list">
      <MonthHeading target={dj} />
      <Row>
        <Cell columns={12}>
          <DateList
            target={dj}
            records={records}
            timeFormat={timeFormat}
            history={props.history}
          />
        </Cell>
      </Row>
      <Row>
        <Cell columns={12}>
          <a
            className="app-fab--absolute"
            href={createMailToUri(dj, records, mailAddress)}
          >
            <Fab
              icon={<i className="material-icons">mail</i>}
              textLabel={intl.formatMessage({ id: 'Send.mail' })}
            />
          </a>
        </Cell>
      </Row>
    </Grid>
  )
}
export default List

/**
 * 'MonthHeading' component
 */
const MonthHeading: React.FC<{ target: Dayjs }> = props => {
  const intl = useIntl()

  return (
    <Row className="text-align-center">
      <Cell
        desktopColumns={1}
        tabletColumns={1}
        phoneColumns={1}
        className="navigation-before"
      >
        <Link to={props.target.add(-1, 'month').format('/YYYY/M')}>
          <MaterialIcon
            aria-label={intl.formatMessage({ id: 'Prev.month' })}
            icon="navigate_before"
          />
        </Link>
      </Cell>
      <Cell desktopColumns={10} tabletColumns={6} phoneColumns={2}>
        <Headline6 tag="h2">
          {props.target.format(intl.formatMessage({ id: 'Format.month' }))}
        </Headline6>
      </Cell>
      <Cell
        desktopColumns={1}
        tabletColumns={1}
        phoneColumns={1}
        className="navigation-next"
      >
        <Link to={props.target.add(1, 'month').format('/YYYY/M')}>
          <MaterialIcon
            aria-label={intl.formatMessage({ id: 'Next.month' })}
            icon="navigate_next"
          />
        </Link>
      </Cell>
    </Row>
  )
}

/**
 * 'DateList' component
 */
const DateList: React.FC<{
  target: Dayjs
  records: recordsTypes.Records
  timeFormat: string
  history: H.History
}> = props => {
  const records = getDaysInMonth(props.target).map(date => {
    const key = makeRecordKey(date.toDate())
    return {
      date,
      latestRecord: Object.prototype.hasOwnProperty.call(props.records, key)
        ? getLatestOf(props.records[key])
        : null,
    }
  })

  return (
    <Grid className="date-list">
      <DateListHeader />
      {records.map(record => (
        <DateRecordRow
          key={record.date.format()}
          date={record.date}
          latest={record.latestRecord}
          timeFormat={props.timeFormat}
          history={props.history}
        />
      ))}
      <DateListFooter
        latestRecords={records.map(record => record.latestRecord)}
        timeFormat={props.timeFormat}
      />
    </Grid>
  )
}

/**
 * 'DateListHeader' component
 */
const DateListHeader: React.FC = () => (
  <Row className="date-list-header date-list-row">
    <DateListCell>
      <FormattedMessage id="Date" />
    </DateListCell>
    <DateListCell>
      <FormattedMessage id="Start" />
    </DateListCell>
    <DateListCell>
      <FormattedMessage id="Stop" />
    </DateListCell>
    <DateListCell>
      <FormattedMessage id="Edit" />
    </DateListCell>
  </Row>
)

/**
 * 'DateRecordRow' component
 */
const DateRecordRow: React.FC<{
  date: Dayjs
  latest: DailyLatestRecord | null
  timeFormat: string
  history: H.History
}> = props => {
  let dayKind = ''
  if (props.date.day() === 0) {
    dayKind = 'sunday'
  } else if (props.date.day() === 6) {
    dayKind = 'saturday'
  }
  const handleClick = useCallback(() => {
    props.history.push(props.date.format('/YYYY/M/D'))
  }, [props.date])

  return (
    <Row className="date-list-row">
      <DateListCell className={dayKind}>
        {props.date.format('D(ddd)')}
      </DateListCell>
      <DateListCell>
        {props.latest !== null && props.latest.start !== null
          ? dayjs(props.latest.start).format(props.timeFormat)
          : ''}
      </DateListCell>
      <DateListCell>
        {props.latest !== null && props.latest.stop !== null
          ? dayjs(props.latest.stop).format(props.timeFormat)
          : ''}
      </DateListCell>
      <DateListCell>
        <Button dense={true} onClick={handleClick}>
          <span dangerouslySetInnerHTML={{ __html: '&hellip;' }} />
        </Button>
      </DateListCell>
    </Row>
  )
}

/**
 * 'DateListFooter' component
 */
const DateListFooter: React.FC<{
  latestRecords: (recordsTypes.DailyLatestRecord | null)[]
  timeFormat: string
}> = props => {
  const records = props.latestRecords.filter(
    record => record !== null
  ) as recordsTypes.DailyLatestRecord[]
  const starts = records
    .map(record => record.start)
    .filter(start => start !== null) as Date[]
  const stops = records
    .map(record => record.stop)
    .filter(stop => stop !== null) as Date[]

  return (
    <Row className="date-list-footer date-list-row">
      <DateListCell>
        <FormattedMessage id="Median" />
      </DateListCell>
      <DateListCell>
        <span data-testid="median-start">
          {makeMedianTimeStringOf(starts, props.timeFormat)}
        </span>
      </DateListCell>
      <DateListCell>
        <span data-testid="median-stop">
          {makeMedianTimeStringOf(stops, props.timeFormat)}
        </span>
      </DateListCell>
      <DateListCell />
    </Row>
  )
}

/**
 * 'DateListCell' component
 */
const DateListCell: React.FC<{ className?: string }> = props => (
  <Cell
    desktopColumns={3}
    tabletColumns={2}
    phoneColumns={1}
    className={props.className}
  >
    {props.children}
  </Cell>
)
