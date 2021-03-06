#!/usr/bin/env node

const minimist = require('minimist')
const pump = require('pump')
const tapePuppet = require('./index.js')
const version = require('./package.json').version

const exit = code => {
  process.title = ''
  process.exit(code)
}

const argv = minimist(process.argv.slice(2), {
  alias: { help: 'h', version: 'v' },
  boolean: 'devtools'
})

argv.headless = ![ 'false', 0 ].includes(argv.headless)

process.title = `tape-puppet v${version}`

if (argv.version) {
  console.log(`v${version}`)
  exit(0)
}

if (argv.help) {
  console.log(`tape-puppet v${version}\n\n` +
    `A duplex stream that runs browserified tape tests with puppeteer.\n` +
    `Just pipe a browserify stream into this and consume its TAP output.\n\n` +
    `Usage:\n\n` +
    `  browserify [opts] [files] | tape-puppet [opts]\n\n` +
    `Options:\n\n` +
    `  -h, --help\t\tprint usage instructions\n` +
    `  -v, --version\t\tprint version\n` +
    `      --headless\trun chromium in headless mode; default: true\n` +
    `      --devtools\topen devtools; forces !headless; default: false\n` +
    `      --emulate\t\temulate a mobile device; fx "iPhone X"\n` +
    `      --devices\t\tlist mobile devices that can be emulated\n` +
    `      --width\t\tchromium window width in px\n` +
    `      --height\t\tchromium window height in px\n` +
    `      --timeout\t\ttimeout for chromium launch in ms; default: 30000\n` +
    `      --wait\t\ttimeout for tap-finished in ms; default: 1000\n\n` +
    `Examples:\n\n` +
    `  browserify ./test.js | tape-puppet\n` +
    `  browserify ./test.js | tape-puppet --devtools\n` +
    `  browserify ./test.js | tape-puppet --headless 0 --emulate "iPhone X"\n` +
    `  browserify ./test.js | tape-puppet > ./test.tap`)
  exit(0)
}

pump(
  process.stdin,
  tapePuppet(argv).once('results', results => exit(Number(!results.ok))),
  process.stdout,
  err => err && (console.error(err) && exit(1))
)
