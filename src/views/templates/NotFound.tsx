/**
 * @file 'NotFound' component
 */
import React from 'react'
import { FormattedMessage } from 'react-intl'

import { Grid, GridCell } from '@rmwc/grid'
import '@rmwc/grid/styles'
import { Typography } from '@rmwc/typography'
import '@rmwc/typography/styles'

/**
 * 'NotFound' component
 */
const NotFound: React.FC = () => (
  <Grid>
    <GridCell span={12}>
      <Typography use="headline4" tag="h1">
        <FormattedMessage id="Not.found" />
      </Typography>
    </GridCell>
  </Grid>
)
export default NotFound
