/**
 * @file 'List' component
 */
import React, { useCallback } from 'react'
import { Link, useHistory, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import assert from 'assert'
import dayjs, { Dayjs } from 'dayjs'

import { Button } from '@rmwc/button'
import '@rmwc/button/styles'
import { Fab } from '@rmwc/fab'
import '@rmwc/fab/styles'
import { Grid, GridCell, GridRow } from '@rmwc/grid'
import '@rmwc/grid/styles'
import { Icon } from '@rmwc/icon'
import '@rmwc/icon/styles'
import { Typography } from '@rmwc/typography'
import '@rmwc/typography/styles'

import { AppState } from '../../state/store'
import {
  DailyLatestRecord,
  getLatestOf,
  getMonthlyRecordsOf,
  makeRecordKey,
  Records,
} from '../../state/ducks/records'
import {
  getDefaultBreakTimeLengthMin,
  getSendToMailAddress,
} from '../../state/ducks/settings'

import SingleCellRow from '../molecules/SingleCellRow'
import { getDaysInMonth } from '../../implementations/utilities'
import { formatSpecifiedMonthRecordsAsCsvForMail } from '../../implementations/formatter'

//
// Types
//

/**
 * Latest record
 */
interface LatestRecord {
  date: Dayjs
  latestRecord: DailyLatestRecord | null
}

//
// Functions
//

/**
 * Get median value
 * @param values Values
 * @returns Median value
 */
function getMedianOf(values: number[]): number {
  assert(0 < values.length)

  const sorted = [...values].sort((lhs, rhs) => (lhs < rhs ? -1 : 1))
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? Math.floor((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid]
}

/**
 * Get median time of specified times
 * @param times Times
 * @returns Median time(by minute)
 */
function getMedianMinuteOf(times: Date[]): number {
  assert(0 < times.length)

  return getMedianOf(
    times.map((time) => time.getHours() * 60 + time.getMinutes())
  )
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
    .hour(Math.floor(time / 60))
    .minute(time % 60)
    .format(format)
}

/**
 * Create mailto uri
 * @param firstDayOfMonth First day of target month
 * @param records Records to send
 * @param mailAddress Mail address to send
 * @param defaultBreakTimeLength Default break time length
 * @returns mailto uri
 */
function createMailToUri(
  firstDayOfMonth: Dayjs,
  records: Records,
  mailAddress: string,
  defaultBreakTimeLength: number | undefined
): string {
  const bodyLines = formatSpecifiedMonthRecordsAsCsvForMail(
    firstDayOfMonth,
    records,
    defaultBreakTimeLength
  )

  const hfieldsMap: { [index: string]: string } = {
    subject: `${firstDayOfMonth.format('ll')} - ${firstDayOfMonth
      .endOf('month')
      .format('ll')}`,
    body: bodyLines.join('\r\n'),
  }
  const hfields = Object.keys(hfieldsMap).map(
    (key) => `${key}=${encodeURIComponent(hfieldsMap[key])}`
  )
  return `mailto:${encodeURIComponent(mailAddress)}?${hfields.join('&')}`
}

/**
 * Format time for statistics
 * @param timeMin Target time (by minute)
 * @returns Formatted time
 */
function formatStatisticsTime(timeMin: number): string {
  return `${Math.floor(timeMin / 60)}:${(timeMin % 60)
    .toString()
    .padStart(2, '0')}`
}

//
// Components
//

/**
 * 'List' component
 */
const List: React.FC = () => {
  const { year, month } = useParams()
  const firstDayOfMonth = new Date(+(year as string), +(month as string) - 1, 1)
  const dj = dayjs(firstDayOfMonth)

  const records = useSelector((state: AppState) =>
    getMonthlyRecordsOf(firstDayOfMonth, state.records)
  )

  const defaultBreakTimeLength = useSelector((state: AppState) =>
    getDefaultBreakTimeLengthMin(state.settings)
  )
  const latestRecords = getDaysInMonth(dj).map((date) => {
    const key = makeRecordKey(date.toDate())
    return {
      date,
      latestRecord: Object.prototype.hasOwnProperty.call(records, key)
        ? getLatestOf(records[key], defaultBreakTimeLength)
        : null,
    }
  })
  return (
    <Grid className="list">
      <GridRow className="text-align-center">
        <MonthHeading target={dj} />
      </GridRow>
      <DateList latestRecords={latestRecords} />
      <Statistics latestRecords={latestRecords} />
      <Footer target={dj} records={records} />
    </Grid>
  )
}
export default List

/**
 * 'MonthHeading' component
 */
const MonthHeading: React.FC<{ target: Dayjs }> = (props) => {
  const intl = useIntl()

  return (
    <>
      <GridCell className="navigation-before" desktop={1} tablet={1} phone={1}>
        <Link to={props.target.add(-1, 'month').format('/YYYY/M')}>
          <Icon
            aria-label={intl.formatMessage({ id: 'Prev.month' })}
            icon="navigate_before"
          />
        </Link>
      </GridCell>
      <GridCell desktop={10} tablet={6} phone={2}>
        <Typography use="headline6" tag="h2">
          {props.target.format(intl.formatMessage({ id: 'Format.month' }))}
        </Typography>
      </GridCell>
      <GridCell className="navigation-next" desktop={1} tablet={1} phone={1}>
        <Link to={props.target.add(1, 'month').format('/YYYY/M')}>
          <Icon
            aria-label={intl.formatMessage({ id: 'Next.month' })}
            icon="navigate_next"
          />
        </Link>
      </GridCell>
    </>
  )
}

/**
 * 'DateList' component
 */
const DateList: React.FC<{
  latestRecords: LatestRecord[]
}> = (props) => {
  const { latestRecords } = props
  const timeFormat = useIntl().formatMessage({ id: 'Format.time.24' })
  return (
    <SingleCellRow>
      <Grid className="date-list">
        <GridRow className="date-list-header date-list-row">
          <DateListHeader />
        </GridRow>
        {latestRecords.map((record) => (
          <DateRecordRow
            key={record.date.format()}
            date={record.date}
            latest={record.latestRecord}
            timeFormat={timeFormat}
          />
        ))}
        <DateListFooter
          latestRecords={latestRecords.map((record) => record.latestRecord)}
          timeFormat={timeFormat}
        />
      </Grid>
    </SingleCellRow>
  )
}

/**
 * 'DateListHeader' component
 */
const DateListHeader: React.FC = () => (
  <>
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
  </>
)

/**
 * 'DateRecordRow' component
 */
const DateRecordRow: React.FC<{
  date: Dayjs
  latest: DailyLatestRecord | null
  timeFormat: string
}> = (props) => {
  let dayKind = ''
  if (props.date.day() === 0) {
    dayKind = 'sunday'
  } else if (props.date.day() === 6) {
    dayKind = 'saturday'
  }
  const history = useHistory()
  const handleClick = useCallback(() => {
    history.push(props.date.format('/YYYY/M/D'))
  }, [props.date])

  return (
    <GridRow className="date-list-row">
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
    </GridRow>
  )
}

/**
 * 'DateListFooter' component
 */
const DateListFooter: React.FC<{
  latestRecords: (DailyLatestRecord | null)[]
  timeFormat: string
}> = (props) => {
  const records = props.latestRecords.filter(
    (record) => record !== null
  ) as DailyLatestRecord[]
  const starts = records
    .map((record) => record.start)
    .filter((start) => start !== null) as Date[]
  const stops = records
    .map((record) => record.stop)
    .filter((stop) => stop !== null) as Date[]

  return (
    <GridRow
      className="date-list-footer date-list-row"
      data-testid="data-list-footer-median"
    >
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
    </GridRow>
  )
}

/**
 * 'DateListCell' component
 */
const DateListCell: React.FC<{ className?: string }> = (props) => (
  <GridCell className={props.className} desktop={3} tablet={2} phone={1}>
    {props.children}
  </GridCell>
)

/**
 * 'Statistics' component
 */
const Statistics: React.FC<{
  latestRecords: LatestRecord[]
}> = (props) => {
  let totalWorkingTimeString = '--:--'
  let medianWorkingTimeString = '--:--'
  const targets = props.latestRecords
    .map((record) => record.latestRecord)
    .filter(
      (record) =>
        record !== null && record.start !== null && record.stop !== null
    )
  if (
    targets.some(
      (record) => record !== null && record.breakTimeLengthMin === null
    ) === false
  ) {
    const workingTimes = targets.map((target) => {
      const record = target as DailyLatestRecord
      const start = record.start as Date
      const stop = record.stop as Date
      const startTimeMin = start.getHours() * 60 + start.getMinutes()
      const stopTimeMin = stop.getHours() * 60 + stop.getMinutes()
      return stopTimeMin - startTimeMin - (record.breakTimeLengthMin as number)
    })
    if (!(workingTimes.length === 0 || workingTimes.some((time) => time < 0))) {
      const totalWorkingTimeMin = workingTimes.reduce(
        (accumulator, time) => accumulator + time
      )
      totalWorkingTimeString = formatStatisticsTime(totalWorkingTimeMin)
      medianWorkingTimeString = formatStatisticsTime(getMedianOf(workingTimes))
    }
  }

  return (
    <SingleCellRow>
      <Grid className="statistics-list">
        <GridRow className="statistics-list-row" data-testid="statistics-total">
          <GridCell
            className="statistics-list-cell"
            desktop={9}
            tablet={6}
            phone={3}
          >
            <FormattedMessage id="Total.working.time" />
          </GridCell>
          <GridCell
            className="statistics-list-cell"
            desktop={3}
            tablet={2}
            phone={1}
          >
            {totalWorkingTimeString}
          </GridCell>
        </GridRow>
        <GridRow
          className="statistics-list-row"
          data-testid="statistics-median"
        >
          <GridCell
            className="statistics-list-cell"
            desktop={9}
            tablet={6}
            phone={3}
          >
            <FormattedMessage id="Median" />
          </GridCell>
          <GridCell
            className="statistics-list-cell"
            desktop={3}
            tablet={2}
            phone={1}
          >
            {medianWorkingTimeString}
          </GridCell>
        </GridRow>
      </Grid>
    </SingleCellRow>
  )
}

/**
 * 'Footer' component
 */
const Footer: React.FC<{
  target: Dayjs
  records: Records
}> = (props) => {
  const { target, records } = props
  const defaultBreakTimeLength = useSelector((state: AppState) =>
    getDefaultBreakTimeLengthMin(state.settings)
  )
  const mailAddress = useSelector((state: AppState) =>
    getSendToMailAddress(state.settings)
  )
  return (
    <SingleCellRow>
      <a
        className="app-fab--absolute"
        href={createMailToUri(
          target,
          records,
          mailAddress,
          defaultBreakTimeLength
        )}
      >
        <Fab
          icon={<i className="material-icons">mail</i>}
          label={useIntl().formatMessage({ id: 'Send.mail' })}
        />
      </a>
    </SingleCellRow>
  )
}
