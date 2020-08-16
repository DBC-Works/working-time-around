/**
 * @file 'NotFound' component
 */
import React from 'react'
import { FormattedMessage } from 'react-intl'

import { Grid } from '@material/react-layout-grid'
import { Typography } from '@rmwc/typography'
import '@rmwc/typography/styles'

import SingleCellRow from '../molecules/SingleCellRow'

/**
 * 'NotFound' component
 */
const NotFound: React.FC = () => (
  <Grid>
    <SingleCellRow>
      <Typography use="headline4" tag="h1">
        <FormattedMessage id="Not.found" />
      </Typography>
    </SingleCellRow>
  </Grid>
)
export default NotFound
