# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[unreleased]: https://github.com/DBC-Works/SoundVisualShaderBase/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/DBC-Works/SoundVisualShaderBase/releases/tag/v0.4.0
[0.3.1]: https://github.com/DBC-Works/SoundVisualShaderBase/releases/tag/v0.3.1
[0.3.0]: https://github.com/DBC-Works/SoundVisualShaderBase/releases/tag/v0.3.0
[0.2.0]: https://github.com/DBC-Works/SoundVisualShaderBase/releases/tag/v0.2.0
[0.1.0]: https://github.com/DBC-Works/SoundVisualShaderBase/releases/tag/v0.1.0
