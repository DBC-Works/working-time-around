/**
 * @file 'Settings' template component
 */
import React, { useCallback } from 'react'
import { FormattedMessage } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'

import { Cell, Grid, Row } from '@material/react-layout-grid'
import TextField, { Input } from '@material/react-text-field'
import { Headline6 } from '@material/react-typography'

import en from '../i18n/en.json'
import ja from '../i18n/ja.json'

import { AppState } from '../../state/store'
import {
  getLang,
  getSendToMailAddress,
  selectLanguage,
  settingsTypes,
  updateSendToMailAddress,
} from '../../state/ducks/settings'
import Select from '../atoms/Select'

//
// Types
//

/**
 * Language information
 */
interface LanguageInformation {
  [index: string]: {
    literal: string
    catalogue: Record<string, string>
  }
}

//
// Variables
//

/**
 * Language information definition
 */
const langs: LanguageInformation = {
  en: {
    literal: 'English',
    catalogue: en,
  },
  ja: {
    literal: '日本語',
    catalogue: ja,
  },
}

//
// Functions
//

/**
 * Get message catalogue of specified language
 * @param lang Language to get
 * @returns Message catalogue
 */
export function getMessageCatalogueOf(
  lang: settingsTypes.Lang
): Record<string, string> {
  return langs[lang].catalogue
}

//
// Components
//

/**
 * 'Settings' component
 */
const Settings: React.FC = () => {
  const dispatch = useDispatch()

  const lang = useSelector((state: AppState) => getLang(state.settings))
  const mailAddress = useSelector((state: AppState) =>
    getSendToMailAddress(state.settings)
  )

  const handleInputMailAddress = useCallback(
    e => {
      dispatch(updateSendToMailAddress(e.currentTarget.value))
    },
    [mailAddress]
  )
  const handleChangeLang = useCallback(e => {
    dispatch(selectLanguage(e.target.value))
  }, [])

  return (
    <Grid>
      <Row className="text-align-center">
        <Cell columns={12}>
          <Headline6 tag="h1">
            <FormattedMessage id="Settings" />
          </Headline6>
        </Cell>
      </Row>
      <Row>
        <Cell columns={12}>
          <Headline6 tag="h2">
            <FormattedMessage id="Send.to.mail.address" />
          </Headline6>
        </Cell>
      </Row>
      <Row>
        <Cell columns={12}>
          <TextField textarea={false} fullWidth={true}>
            <Input
              type="email"
              value={mailAddress}
              onInput={handleInputMailAddress}
            />
          </TextField>
        </Cell>
      </Row>
      <Row>
        <Cell columns={12}>
          <Headline6 tag="h2">
            <FormattedMessage id="Language" />
          </Headline6>
        </Cell>
      </Row>
      <Row>
        <Cell columns={12}>
          <Select
            value={lang}
            className="full-width"
            onChange={handleChangeLang}
          >
            {Array.from(Object.keys(langs), key => (
              <option key={key} value={key}>
                {langs[key].literal}
              </option>
            ))}
          </Select>
        </Cell>
      </Row>
    </Grid>
  )
}
export default Settings
