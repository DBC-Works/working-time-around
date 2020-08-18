/**
 * @file 'Single cell row' molecules component
 */
import React from 'react'

import { GridCell, GridRow } from '@rmwc/grid'
import '@rmwc/grid/styles'

/**
 * 'Single cell row' component
 * This component cannot be the first child element of a Grid component.
 * Because when the first child element of the Grid component is not a GridRow component,
 * the Grid component wraps its children in the GridRow component, which breaks the layout.
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
