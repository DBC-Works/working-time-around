/**
 * @file 'NotFound' component
 */
import React from 'react'
import { FormattedMessage } from 'react-intl'

import { Grid } from '@material/react-layout-grid'
import { Headline4 } from '@material/react-typography'

import SingleCellRow from '../molecules/SingleCellRow'

/**
 * 'NotFound' component
 */
const NotFound: React.FC = () => (
  <Grid>
    <SingleCellRow>
      <Headline4 tag="h1">
        <FormattedMessage id="Not.found" />
      </Headline4>
    </SingleCellRow>
  </Grid>
)
export default NotFound
