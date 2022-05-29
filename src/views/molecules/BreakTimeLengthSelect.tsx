/**
 * @file 'BreakTimeLengthSelect' molecules component
 */
import React, { ChangeEvent, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { Action } from 'typescript-fsa'
import dayjs from 'dayjs'

import { Button } from '@rmwc/button'
import '@rmwc/button/styles'

import { Icon } from '@rmwc/icon'
import '@rmwc/icon/styles'

import { UpdateBreakTimeActionPayload } from '../../state/ducks/records'

import TimeSelect from './TimeSelect'

/**
 * 'BreakTimeLengthSelect' component
 */
const BreakTimeLengthSelect: React.FC<{
  lengthMin: number | undefined | null
  actionCreators: {
    update: (lengthMin: number) => Action<number | UpdateBreakTimeActionPayload>
    clear?: () => Action<void>
  }
}> = (props) => {
  const {
    actionCreators: { update, clear },
    lengthMin,
  } = props
  const time =
    lengthMin !== undefined && lengthMin !== null
      ? dayjs().startOf('date').add(lengthMin, 'minute').toDate()
      : undefined

  const dispatch = useDispatch()
  const handleChangeHour = useCallback(
    (e: ChangeEvent<HTMLSelectElement>): void => {
      if (time === undefined) {
        dispatch(update(+e.currentTarget.value * 60))
      }
    },
    [time, dispatch, update]
  )
  const handleChangeMinute = useCallback(
    (e: ChangeEvent<HTMLSelectElement>): void => {
      if (time === undefined) {
        dispatch(update(+e.currentTarget.value))
      }
    },
    [time, dispatch, update]
  )
  const handleChangeTime = useCallback(
    (time: Date) => {
      dispatch(update(time.getHours() * 60 + time.getMinutes()))
    },
    [dispatch, update]
  )
  const handleClickClear = useCallback((): void => {
    if (clear !== undefined) {
      dispatch(clear())
    }
  }, [clear, dispatch])

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
          <Icon icon="clear" />
        </Button>
      )}
    </>
  )
}
export default BreakTimeLengthSelect
