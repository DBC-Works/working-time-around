/**
 * @file 'Single cell row' molecules component
 */
import React from 'react'

import { GridCell, GridRow } from '@rmwc/grid'
import '@rmwc/grid/styles'

/**
 * 'Single cell row' component
 */
const SingleCellRow: React.FC<{
  cellClassName?: string
  rowClassName?: string
}> = (props) => (
  <GridRow className={props.rowClassName}>
    <GridCell className={props.cellClassName} span={12}>
      {props.children}
    </GridCell>
  </GridRow>
)
export default SingleCellRow
