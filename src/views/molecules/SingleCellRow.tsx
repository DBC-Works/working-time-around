/**
 * @file 'Single cell row' molecules component
 */
import React from 'react'

import { Cell, Row } from '@material/react-layout-grid'

/**
 * 'Single cell row' component
 */
const SingleCellRow: React.FC<{ className?: string }> = (props) => (
  <Row className={props.className}>
    <Cell columns={12}>{props.children}</Cell>
  </Row>
)
export default SingleCellRow
