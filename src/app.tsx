/**
 * @file Application entry
 */
import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { Provider, useSelector } from 'react-redux'
import { persistStore } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'
import { IntlProvider } from 'react-intl'
import dayjs from 'dayjs'
import 'dayjs/locale/en'
import 'dayjs/locale/ja'
import localizedFormat from 'dayjs/plugin/localizedFormat'
dayjs.extend(localizedFormat)

import '@material/react-layout-grid/dist/layout-grid.css'
import '@material/react-material-icon/dist/material-icon.css'
import '@material/react-select/dist/select.css'
import '@material/react-text-field/dist/text-field.css'
import '@material/react-tab-bar/dist/tab-bar.css'
import '@material/react-tab-scroller/dist/tab-scroller.css'
import '@material/react-tab/dist/tab.css'
import '@material/react-tab-indicator/dist/tab-indicator.css'

import configureStore, { AppState } from './state/store'
import { getLang } from './state/ducks/settings'
import AppPage from './views/pages/App'
import { getMessageCatalogueOf } from './views/templates/settings'

import './app.scss'

//
// Component
//

/**
 * Container
 */
const Container: React.FC = () => {
  const currentLang = useSelector((app: AppState) => getLang(app.settings))
  dayjs.locale(currentLang)
  return (
    <IntlProvider
      locale={currentLang}
      messages={getMessageCatalogueOf(currentLang)}
    >
      <Router>
        <AppPage />
      </Router>
    </IntlProvider>
  )
}

/**
 * Application renderer
 */
const App: React.FC = () => {
  const store = configureStore()
  const persistor = persistStore(store)
  //persistor.purge()

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Container />
      </PersistGate>
    </Provider>
  )
}
render(<App />, document.getElementById('root'))
