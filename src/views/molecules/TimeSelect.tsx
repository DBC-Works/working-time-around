/**
 * @file 'TimeSelect' component
 */
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react'
import dayjs from 'dayjs'

import { Select } from '@rmwc/Select'
import '@rmwc/select/styles'

//
// Components
//

/**
 * 'TimeSelect' component
 */
const TimeSelect: React.FC<{
  label?: string
  time?: Date | null
  onChange?: (time: Date) => void
  onChangeHour?: (e: ChangeEvent<HTMLSelectElement>) => void
  onChangeMinute?: (e: ChangeEvent<HTMLSelectElement>) => void
}> = (props) => {
  const dj = dayjs(props.time ? props.time : new Date())

  const [hour, setHour] = useState(props.time ? `${props.time.getHours()}` : '')
  const [minute, setMinute] = useState(
    props.time ? `${props.time.getMinutes()}` : ''
  )
  useEffect(() => {
    setHour(props.time ? `${props.time.getHours()}` : '')
    setMinute(props.time ? `${props.time.getMinutes()}` : '')
  }, [props.time])

  const handleChangeHour = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      if (props.onChangeHour) {
        props.onChangeHour(e)
      }
      const newHour = e.currentTarget.value
      setHour(newHour)
      if (props.onChange && 0 < newHour.length && 0 < minute.length) {
        props.onChange(
          dj
            .hour(+newHour)
            .minute(+minute)
            .toDate()
        )
      }
    },
    [props.onChangeHour, hour, minute]
  )
  const handleChangeMinute = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      if (props.onChangeMinute) {
        props.onChangeMinute(e)
      }
      const newMinute = e.currentTarget.value
      setMinute(newMinute)
      if (props.onChange && 0 < hour.length && 0 < newMinute.length) {
        props.onChange(
          dj
            .hour(+hour)
            .minute(+newMinute)
            .toDate()
        )
      }
    },
    [props.onChangeMinute, hour, minute]
  )

  return (
    <div className="time-select" data-testid="time-select">
      <div className="container">
        <Select
          data-testid="hour"
          outlined
          placeholder={!hour ? props.label : undefined}
          options={Array.from(Array(24), (_, i) => ({
            label: `${dj.hour(i).format('HH')}`,
            value: `${i}`,
          }))}
          value={hour}
          onChange={handleChangeHour}
        />
        <Select
          data-testid="minute"
          outlined
          placeholder={!minute ? '--' : undefined}
          value={minute}
          options={Array.from(Array(60), (_, i) => ({
            label: `:${dj.minute(i).format('mm')}`,
            value: `${i}`,
          }))}
          onChange={handleChangeMinute}
        />
      </div>
    </div>
  )
}
export default TimeSelect
