/**
 * @file Application entry
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
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

import configureStore, { AppState } from './state/store'
import { getLang } from './state/ducks/settings'
import AppPage from './views/pages/App'
import { getMessageCatalogueOf } from './views/templates/Settings'

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
      <Router basename={process.env['BASE_PATH'] || '/'}>
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
const container = document.getElementById('root')
const root = createRoot(container)
root.render(<App />)
