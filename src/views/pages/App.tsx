/**
 * @file App page component
 */
import React from 'react'
import { NavLink, Route, Switch } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FormattedMessage } from 'react-intl'

import MaterialIcon from '@material/react-material-icon'
import TopAppBar, {
  TopAppBarFixedAdjust,
  TopAppBarIcon,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
} from '@material/react-top-app-bar'

import { AppState } from '../../state/store'
import { getTime } from '../../state/ducks/running'

import CurrentState from '../templates/CurrentState'
import List from '../templates/List'
import Detail from '../templates/Detail'
import Settings from '../templates/Settings'
import NotFound from '../templates/NotFound'

/**
 * 'App' component
 */
const App: React.FC = () => (
  <div className="whole-content-area">
    <AppBar />
    <TopAppBarFixedAdjust className="whole-content-area">
      <Switch>
        <Route
          exact
          path="/:year(\d{4})/:month([1-9]|10|11|12)/:date([1-9]|[12][0-9]|30|31)"
          component={Detail}
        />
        <Route
          exact
          path="/:year(\d{4})/:month([1-9]|10|11|12)"
          component={List}
        />
        <Route exact path="/settings" component={Settings} />
        <Route exact path="/" component={CurrentState} />
        <Route component={NotFound} />
      </Switch>
    </TopAppBarFixedAdjust>
  </div>
)
export default App

/**
 * 'AppBar' component
 */
const AppBar: React.FC = () => {
  const time = useSelector((state: AppState) => getTime(state.running))
  return (
    <TopAppBar>
      <TopAppBarRow>
        <TopAppBarSection align="start">
          <TopAppBarIcon>
            <MaterialIcon icon="timer" />
          </TopAppBarIcon>
          <TopAppBarTitle>
            <FormattedMessage id="Working.time.around" />
          </TopAppBarTitle>
        </TopAppBarSection>
        <TopAppBarSection align="end" role="toolbar">
          <TopAppBarIcon navIcon={true}>
            <NavLink to="/">
              <MaterialIcon aria-label="today" icon="today" />
            </NavLink>
          </TopAppBarIcon>
          <TopAppBarIcon navIcon={true}>
            <NavLink to={`/${time.getFullYear()}/${time.getMonth() + 1}`}>
              <MaterialIcon aria-label="list" icon="list" />
            </NavLink>
          </TopAppBarIcon>
          <TopAppBarIcon navIcon={true}>
            <NavLink to="/settings">
              <MaterialIcon aria-label="settings" icon="settings" />
            </NavLink>
          </TopAppBarIcon>
        </TopAppBarSection>
      </TopAppBarRow>
    </TopAppBar>
  )
}
