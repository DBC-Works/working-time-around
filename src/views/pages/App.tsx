/**
 * @file App page component
 */
import React, { useCallback, useEffect } from 'react'
import { NavLink, Route, Switch } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FormattedMessage, IntlShape, useIntl } from 'react-intl'

import MaterialIcon from '@material/react-material-icon'
import { Snackbar } from '@material/react-snackbar'
import TopAppBar, {
  TopAppBarFixedAdjust,
  TopAppBarIcon,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
} from '@material/react-top-app-bar'

import { AppState } from '../../state/store'
import {
  clearMessage,
  getMessage,
  getTime,
  getWindow,
  updateOnLine,
} from '../../state/ducks/running'
import { settingsTypes } from '../../state/ducks/settings'

import CurrentState from '../templates/CurrentState'
import List from '../templates/List'
import Detail from '../templates/Detail'
import Settings from '../templates/Settings'
import NotFound from '../templates/NotFound'

//
// Functions
//

/**
 * Format send failed message
 * @param intl IntlShape instance
 * @param resultMessage Result message
 * @returns Formatted message
 */
export function formatSendFailedMessage(
  intl: IntlShape,
  resultMessage: string
): string {
  return intl.formatMessage(
    {
      id: 'Format.send.failed.',
    },
    { message: resultMessage }
  )
}

/**
 * Send message to Slack using incoming webhook
 * @param settings Slack linkage settings
 * @param message message to post
 * @returns Result message(success if empty)
 */
export async function sendMessageToSlack(
  settings: settingsTypes.SlackSettings,
  message: string
): Promise<string> {
  const payload: any = {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message,
        },
      },
    ],
  }
  if (0 < settings.context.length) {
    payload.blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: settings.context,
        },
      ],
    })
  }

  try {
    const response = await fetch(settings.incomingWebhookUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (response.ok === false) {
      console.error(response.statusText)
      return response.statusText
    }
    const body = await response.text()
    if (body !== 'ok') {
      console.error(body)
      return body
    }
    return ''
  } catch (e) {
    console.error(e.toString())
    return e.message
  }
}

//
// Components
//

/**
 * 'App' component
 */
const App: React.FC = () => {
  const w = useSelector((state: AppState) => getWindow(state.running))
  const dispatch = useDispatch()
  useEffect(() => {
    const onlineEventHandler = () => {
      dispatch(updateOnLine(true))
    }
    const offlineEventHandler = () => {
      dispatch(updateOnLine(false))
    }
    w.addEventListener('online', onlineEventHandler)
    w.addEventListener('offline', offlineEventHandler)

    return function cleanup() {
      w.removeEventListener('offline', offlineEventHandler)
      w.removeEventListener('online', onlineEventHandler)
    }
  }, [])

  const handleCloseSnackbar = useCallback(() => {
    dispatch(clearMessage())
  }, [])

  const message = useSelector((state: AppState) => getMessage(state.running))
  return (
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
      {0 < message.length && (
        <Snackbar message={message} onClose={handleCloseSnackbar} />
      )}
    </div>
  )
}
export default App

/**
 * 'AppBar' component
 */
const AppBar: React.FC = () => {
  const time = useSelector((state: AppState) => getTime(state.running))
  const intl = useIntl()

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
              <MaterialIcon
                aria-label={intl.formatMessage({ id: 'Top' })}
                icon="today"
              />
            </NavLink>
          </TopAppBarIcon>
          <TopAppBarIcon navIcon={true}>
            <NavLink to={`/${time.getFullYear()}/${time.getMonth() + 1}`}>
              <MaterialIcon
                aria-label={intl.formatMessage({ id: 'List' })}
                icon="list"
              />
            </NavLink>
          </TopAppBarIcon>
          <TopAppBarIcon navIcon={true}>
            <NavLink to="/settings">
              <MaterialIcon
                aria-label={intl.formatMessage({ id: 'Settings' })}
                icon="settings"
              />
            </NavLink>
          </TopAppBarIcon>
        </TopAppBarSection>
      </TopAppBarRow>
    </TopAppBar>
  )
}
