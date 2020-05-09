/**
 * @file 'Select' component
 */
import React from 'react'

/**
 * 'Select' component
 * It's backward compatible version of [React Select]{@link https://github.com/material-components/material-components-web-react/tree/master/packages/select}
 */
const Select: React.FC<{
  className?: string
  testId?: string
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void
}> = (props) => (
  <div
    className={
      'mdc-select mdc-select--outlined' +
      (props.className ? ` ${props.className}` : '')
    }
  >
    <i className="mdc-select__dropdown-icon"></i>
    <select
      data-testid={props.testId}
      className="mdc-select__native-control full-width"
      value={props.value}
      onChange={props.onChange}
    >
      {props.children}
    </select>
    <div className="mdc-notched-outline mdc-notched-outline--no-label">
      <div className="mdc-notched-outline__leading"></div>
      <div className="mdc-notched-outline__trailing"></div>
    </div>
  </div>
)
export default Select
