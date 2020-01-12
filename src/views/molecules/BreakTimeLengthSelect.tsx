/**
 * @file 'BreakTimeLengthSelect' molecules component
 */
import React, { ChangeEvent, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { Action } from 'typescript-fsa'
import dayjs from 'dayjs'

import Button from '@material/react-button'
import MaterialIcon from '@material/react-material-icon'

import { recordsTypes } from '../../state/ducks/records'

import TimeSelect from './TimeSelect'

/**
 * 'BreakTimeLengthSelect' component
 */
const BreakTimeLengthSelect: React.FC<{
  lengthMin: number | undefined | null
  actionCreators: {
    update: (
      lengthMin: number
    ) => Action<number | recordsTypes.UpdateBreakTimeActionPayload>
    clear?: () => Action<void>
  }
}> = props => {
  const {
    actionCreators: { update, clear },
    lengthMin,
  } = props
  const time =
    lengthMin !== undefined && lengthMin !== null
      ? dayjs()
          .startOf('date')
          .add(lengthMin, 'minute')
          .toDate()
      : undefined

  const dispatch = useDispatch()
  const handleChangeHour = useCallback(
    time === undefined
      ? (e: ChangeEvent<HTMLSelectElement>): void => {
          dispatch(update(+e.currentTarget.value * 60))
        }
      : (): void => {},
    [update, time]
  )
  const handleChangeMinute = useCallback(
    time === undefined
      ? (e: ChangeEvent<HTMLSelectElement>): void => {
          dispatch(update(+e.currentTarget.value))
        }
      : (): void => {},
    [update, time]
  )
  const handleChangeTime = useCallback(
    (time: Date) => {
      dispatch(update(time.getHours() * 60 + time.getMinutes()))
    },
    [update]
  )
  const handleClickClear = useCallback(
    clear !== undefined
      ? (): void => {
          dispatch(clear())
        }
      : (): void => {},
    [clear]
  )
  return (
    <>
      <TimeSelect
        label="--"
        time={time}
        onChangeHour={handleChangeHour}
        onChangeMinute={handleChangeMinute}
        onChange={handleChangeTime}
      />
      {clear !== undefined && (
        <Button disabled={time === undefined} onClick={handleClickClear}>
          <MaterialIcon icon="clear" />
        </Button>
      )}
    </>
  )
}
export default BreakTimeLengthSelect
