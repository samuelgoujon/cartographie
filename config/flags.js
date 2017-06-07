const NPM_TASK = process.env.npm_lifecycle_event

const DEV = NPM_TASK === 'start'
const PUBLISH = NPM_TASK === 'deploy'
const BUILD = NPM_TASK === 'build'
const DEMO = DEV || PUBLISH

module.exports = { DEV, DEMO, BUILD, PUBLISH }
