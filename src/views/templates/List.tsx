/**
 * @file 'List' component
 */
import React from 'react'
import { NavLink, RouteComponentProps } from 'react-router-dom'
import H from 'history'
import { useSelector } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import dayjs, { Dayjs } from 'dayjs'

import MaterialIcon from '@material/react-material-icon'
import Button from '@material/react-button'
import { Cell, Grid, Row } from '@material/react-layout-grid'
import { Headline5, Headline6 } from '@material/react-typography'

import { AppState } from '../../state/store'
import {
  getLatestMemoOf,
  getLatestStartTimeOf,
  getLatestStopTimeOf,
  getMonthlyRecordsOf,
  recordsTypes,
} from '../../state/ducks/records'
import { getSendToMailAddress } from '../../state/ducks/settings'

import { makeRecordKey } from '../../state/ducks/records/types'

//
// Functions
//

/**
 * Get days in month
 * @param month Target month
 * @returns Array of Dayjs
 */
function getDaysInMonth(month: Dayjs): Dayjs[] {
  return Array.from(Array(month.daysInMonth()), (_, i) =>
    dayjs(month).set('date', i + 1)
  )
}

/**
 * Create mailto uri
 * @param firstDayOfMonth First day of target month
 * @param records Records to send
 * @returns mailto uri
 */
function createMailToUri(
  firstDayOfMonth: Dayjs,
  records: recordsTypes.Records
): string {
  const bodyLines = getDaysInMonth(firstDayOfMonth).map(date => {
    const key = makeRecordKey(date.toDate())
    const record = records.hasOwnProperty(key) ? records[key] : null
    const start = record !== null ? getLatestStartTimeOf(record) : null
    const stop = record !== null ? getLatestStopTimeOf(record) : null
    const columns = [
      date.format('YYYY-MM-DD'),
      start !== null ? dayjs(start).format('HH:mm') : '',
      stop !== null ? dayjs(stop).format('HH:mm') : '',
      record ? getLatestMemoOf(record) : '',
    ]
    return columns.map(column => `"${column}"`).join(',')
  })

  const mailAddress = useSelector((state: AppState) =>
    getSendToMailAddress(state.settings)
  )

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

/**
 * 'List' component
 */
const List: React.FC<
  RouteComponentProps<{ year: string; month: string }>
> = props => {
  const { year, month } = props.match.params
  const firstDayOfMonth = new Date(+year, +month - 1, 1)
  const dj = dayjs(firstDayOfMonth)

  const timeFormat = useIntl().formatMessage({ id: 'Format.time.24' })

  const records = useSelector((state: AppState) =>
    getMonthlyRecordsOf(firstDayOfMonth, state.records)
  )

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
          <Button
            className="full-width"
            unelevated={true}
            href={createMailToUri(dj, records)}
            disabled={Object.keys(records).length === 0}
          >
            <FormattedMessage id="Send.mail" />
          </Button>
        </Cell>
      </Row>
    </Grid>
  )
}
export default List

/**
 * 'MonthHeading' component
 */
const MonthHeading: React.FC<{ target: Dayjs }> = props => (
  <>
    <Row>
      <Cell columns={12}>
        <Headline6 className="text-align-center" tag="h1">
          {props.target.format('YYYY')}
        </Headline6>
      </Cell>
    </Row>
    <Row>
      <Cell
        desktopColumns={1}
        tabletColumns={1}
        phoneColumns={1}
        className="text-align-center"
      >
        <NavLink to={props.target.add(-1, 'month').format('/YYYY/M')}>
          <MaterialIcon aria-label="prev" hasRipple icon="navigate_before" />
        </NavLink>
      </Cell>
      <Cell
        desktopColumns={10}
        tabletColumns={6}
        phoneColumns={2}
        className="text-align-center"
      >
        <Headline5 tag="h2">{props.target.format('MMMM')}</Headline5>
      </Cell>
      <Cell
        desktopColumns={1}
        tabletColumns={1}
        phoneColumns={1}
        className="text-align-center"
      >
        <NavLink to={props.target.add(1, 'month').format('/YYYY/M')}>
          <MaterialIcon aria-label="next" hasRipple icon="navigate_next" />
        </NavLink>
      </Cell>
    </Row>
  </>
)

/**
 * 'DateList' component
 */
const DateList: React.FC<{
  target: Dayjs
  records: recordsTypes.Records
  timeFormat: string
  history: H.History
}> = props => {
  const days = getDaysInMonth(props.target)

  return (
    <Grid>
      <Row className="date-list-header date-list-row">
        <Cell desktopColumns={3} tabletColumns={2} phoneColumns={1}>
          <FormattedMessage id="Date" />
        </Cell>
        <Cell desktopColumns={3} tabletColumns={2} phoneColumns={1}>
          <FormattedMessage id="Start" />
        </Cell>
        <Cell desktopColumns={3} tabletColumns={2} phoneColumns={1}>
          <FormattedMessage id="Stop" />
        </Cell>
        <Cell desktopColumns={3} tabletColumns={2} phoneColumns={1}>
          <FormattedMessage id="Edit" />
        </Cell>
      </Row>
      {days.map(date => {
        let dayKind = ''
        if (date.day() === 0) {
          dayKind = 'sunday'
        } else if (date.day() === 6) {
          dayKind = 'saturday'
        }
        const key = makeRecordKey(date.toDate())
        const record = props.records.hasOwnProperty(key)
          ? props.records[key]
          : null
        const start = record !== null ? getLatestStartTimeOf(record) : null
        const stop = record !== null ? getLatestStopTimeOf(record) : null
        return (
          <Row key={date.date()} className="date-list-row">
            <Cell
              desktopColumns={3}
              tabletColumns={2}
              phoneColumns={1}
              className={dayKind}
            >
              {date.format('D(ddd)')}
            </Cell>
            <Cell desktopColumns={3} tabletColumns={2} phoneColumns={1}>
              {start !== null ? dayjs(start).format(props.timeFormat) : ''}
            </Cell>
            <Cell desktopColumns={3} tabletColumns={2} phoneColumns={1}>
              {stop !== null ? dayjs(stop).format(props.timeFormat) : ''}
            </Cell>
            <Cell desktopColumns={3} tabletColumns={2} phoneColumns={1}>
              <Button
                dense={true}
                onClick={e => props.history.push(date.format('/YYYY/M/D'))}
              >
                <span dangerouslySetInnerHTML={{ __html: '&hellip;' }} />
              </Button>
            </Cell>
          </Row>
        )
      })}
    </Grid>
  )
}
