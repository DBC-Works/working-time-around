# Working time around

"Working time around" is a personal attendance and working time recording web application. It save records to browser's local storage, initially does not access any Web APIs. You can also set up and send your activities to Slack by setting the connection(you need to register the app in the workspace and create an Incoming Webhook. Please see [Incoming Webhooks](https://api.slack.com/incoming-webhooks)).

## Live demo

Access [live demo site](https://workingtimearound.z11.web.core.windows.net/)

## Develop and build

1. Clone this repository
2. Run `npm install`
3. Run `npm start`

- If you want to run unit test, run `npm test`
- If you want to build distribution, run `npm run-script build`

## CHANGELOG

[CHANGELOG](CHANGELOG.md)

## Roadmap

A stable release(v1.0.0) will be released if the following conditions are met:

- Replace [Material Components for React (MDC React)](https://github.com/material-components/material-components-web-react) with [RMWC - React Material Web Components](https://rmwc.io/)(#16)
- When releases React with error boundary Hooks api support

## License

MIT
