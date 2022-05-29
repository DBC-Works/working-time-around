/**
 * @file App page component
 */
import React, { useCallback, useEffect } from 'react'
import { NavLink, Route, Switch } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FormattedMessage, IntlShape, useIntl } from 'react-intl'

import { Icon } from '@rmwc/icon'
import '@rmwc/icon/styles'
import { Snackbar } from '@rmwc/snackbar'
import '@rmwc/snackbar/styles'
import {
  TopAppBar,
  TopAppBarFixedAdjust,
  TopAppBarNavigationIcon,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
} from '@rmwc/top-app-bar'
import '@rmwc/top-app-bar/styles'

import { AppState } from '../../state/store'
import {
  clearMessage,
  getMessage,
  getTime,
  getWindow,
  updateOnLine,
} from '../../state/ducks/running'
import { SlackSettings } from '../../state/ducks/settings'

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
  settings: SlackSettings,
  message: string
): Promise<string> {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
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
  useEffect((): (() => void) => {
    const onlineEventHandler = (): void => {
      dispatch(updateOnLine(true))
    }
    const offlineEventHandler = (): void => {
      dispatch(updateOnLine(false))
    }
    w.addEventListener('online', onlineEventHandler)
    w.addEventListener('offline', offlineEventHandler)

    return function cleanup(): void {
      w.removeEventListener('offline', offlineEventHandler)
      w.removeEventListener('online', onlineEventHandler)
    }
  }, [dispatch, w])

  const handleCloseSnackbar = useCallback(() => {
    dispatch(clearMessage())
  }, [dispatch])

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
      <Snackbar
        open={0 < message.length}
        message={message}
        onClose={handleCloseSnackbar}
      />
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
        <TopAppBarSection alignStart={true}>
          <Icon icon="timer" />
          <TopAppBarTitle>
            <FormattedMessage id="Working.time.around" />
          </TopAppBarTitle>
        </TopAppBarSection>
        <TopAppBarSection alignEnd={true} role="toolbar">
          <NavLink to="/">
            <TopAppBarNavigationIcon
              icon="today"
              label={intl.formatMessage({ id: 'Top' })}
            />
          </NavLink>
          <NavLink to={`/${time.getFullYear()}/${time.getMonth() + 1}`}>
            <TopAppBarNavigationIcon
              icon="list"
              label={intl.formatMessage({ id: 'List' })}
            />
          </NavLink>
          <NavLink to="/settings">
            <TopAppBarNavigationIcon
              icon="settings"
              label={intl.formatMessage({ id: 'Settings' })}
            />
          </NavLink>
        </TopAppBarSection>
      </TopAppBarRow>
    </TopAppBar>
  )
}
