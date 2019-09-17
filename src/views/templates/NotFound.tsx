/**
 * @file 'NotFound' component
 */
import React from 'react'
import { FormattedMessage } from 'react-intl'

import { Cell, Grid, Row } from '@material/react-layout-grid'
import { Headline4 } from '@material/react-typography'

/**
 * 'NotFound' component
 */
const NotFound: React.FC = () => (
  <Grid>
    <Row>
      <Cell columns={12}>
        <Headline4 tag="h1">
          <FormattedMessage id="Not.found" />
        </Headline4>
      </Cell>
    </Row>
  </Grid>
)
export default NotFound
