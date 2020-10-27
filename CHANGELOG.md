# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2020-10-27

### Update

- Add total working day count to List(#23)
- Update package references

## [1.0.0] - 2020-08-23

### Update

- Replace [Material Components for React (MDC React)](https://github.com/material-components/material-components-web-react) with [RMWC - React Material Web Components](https://rmwc.io/)(#16)
- Fix some bugs
- Update package references

## [0.8.1] - 2020-05-09

### Updated

- Optimize unit tests
  - [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## [0.8.0] - 2020-05-05

### Added

- Import function(#9)

### Updated

- Update package references

## [0.7.2] - 2020-03-22

### Updated

- "List" template
  - Change the e-mail sending data format process that output the break time when both the start time and the end time are set

## [0.7.1] - 2020-03-08

### Updated

- "CurrentState" template
  - Fix a bug in memo send to slack button display judgment processing
- "Detail" template
  - Fix incorrect posting information to Slack

## [0.7.0] - 2020-03-01

### Added

- Export function(#9)

### Updated

- Fix "List" template test cases that failed only at the end of the month
- Adjust type of store properties
- Update some configurations
- Update package references

## [0.6.0] - 2020-02-02

### Updated

- Reform "Settings" page layout with tab component(#17)
- Update package references

## [0.5.0] - 2020-01-13

### Added

- Add break time length recording function
  - You can set default break time length in "Settings" page
  - You can also change break time length in "Details" page
- Add Monthly statistics(total working time by month and median working time by day) to list

### Updated

- Refactor some codes
- Update package references

## [0.4.0] - 2019-10-13

### Added

- Add median value display in list

### Updated

- Refactor some codes
- Update package references

## [0.3.1] - 2019-10-07

### Updated

- Fix a bug where change data isn't sent to Slack when detail page is unmounted
- Enable ESLint

## [0.3.0] - 2019-10-06

### Added

- Slack linkage function
- 'strictNullChecks' and 'noImplicitAny' compiler options

### Updated

- Add a style to hide the underline of FAB(only in Mobile Safari)
- Update core packages
- Fix some bugs

## [0.2.0] - 2019-09-22

### Added

- Transition controls to 'Detail' template
- Type attribute with value "email" to input element for setting email address of 'Settings' template
- Unit tests

### Updated

- Change send email button of 'List' template to floating action button
- Multilingual support for toolbar button label text
- Optimize layout, template headings and markup
- Refactor unit tests
- npm package
  - [react-intl](https://github.com/formatjs/react-intl)

## [0.1.0] - 2019-09-18

### Added

- Initial project files.

[unreleased]: https://github.com/DBC-Works/working-time-around/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/DBC-Works/working-time-around/releases/tag/v1.1.0
[1.0.0]: https://github.com/DBC-Works/working-time-around/releases/tag/v1.0.0
[0.8.1]: https://github.com/DBC-Works/working-time-around/releases/tag/v0.8.1
[0.8.0]: https://github.com/DBC-Works/working-time-around/releases/tag/v0.8.0
[0.7.2]: https://github.com/DBC-Works/working-time-around/releases/tag/v0.7.2
[0.7.1]: https://github.com/DBC-Works/working-time-around/releases/tag/v0.7.1
[0.7.0]: https://github.com/DBC-Works/working-time-around/releases/tag/v0.7.0
[0.6.0]: https://github.com/DBC-Works/working-time-around/releases/tag/v0.6.0
[0.5.0]: https://github.com/DBC-Works/working-time-around/releases/tag/v0.5.0
[0.4.0]: https://github.com/DBC-Works/working-time-around/releases/tag/v0.4.0
[0.3.1]: https://github.com/DBC-Works/working-time-around/releases/tag/v0.3.1
[0.3.0]: https://github.com/DBC-Works/working-time-around/releases/tag/v0.3.0
[0.2.0]: https://github.com/DBC-Works/working-time-around/releases/tag/v0.2.0
[0.1.0]: https://github.com/DBC-Works/working-time-around/releases/tag/v0.1.0
