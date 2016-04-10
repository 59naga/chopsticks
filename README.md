![Chopsticks](https://cloud.githubusercontent.com/assets/1548478/14408405/822af84a-ff2e-11e5-81d9-9d2d05f48911.gif)
---

<p align="right">
  <a href="https://npmjs.org/package/chopsticks">
    <img src="https://img.shields.io/npm/v/chopsticks.svg?style=flat-square">
  </a>
  <a href="https://travis-ci.org/59naga/chopsticks">
    <img src="http://img.shields.io/travis/59naga/chopsticks.svg?style=flat-square">
  </a>
  <a href="https://ci.appveyor.com/project/59naga/chopsticks">
    <img src="https://img.shields.io/appveyor/ci/59naga/chopsticks.svg?style=flat-square">
  </a>
  <a href="https://codeclimate.com/github/59naga/chopsticks/coverage">
    <img src="https://img.shields.io/codeclimate/github/59naga/chopsticks.svg?style=flat-square">
  </a>
  <a href="https://codeclimate.com/github/59naga/chopsticks">
    <img src="https://img.shields.io/codeclimate/coverage/github/59naga/chopsticks.svg?style=flat-square">
  </a>
  <a href="https://gemnasium.com/59naga/chopsticks">
    <img src="https://img.shields.io/gemnasium/59naga/chopsticks.svg?style=flat-square">
  </a>
</p>

Installation
---
```bash
npm install chopsticks --save
```

Usage
---

## `chopsticks(args, opts={})` -> `argv`
- [x] `opts.string`
- [x] `opts.boolean`
- [x] `opts.alias`
- [x] `opts.default`
- [x] `opts.stopEarly`
- [x] `opts.dash` (aka `opts['--']`)
- [x] `opts.unknown`

> [minimist-v1.2.0](https://github.com/substack/minimist#methods) spec completed.

## New features
- [x] Emoji support :+1: - can use emoji to short flags.
  ```bash
  node -e 'console.log(require("minimist")(["-🍣👹👺"]))'
  # { _: [], '�': '�👹👺' }

  node -e 'console.log(require("chopsticks")(["-🍣👹👺"]))'
  # { '🍣': true, '👹': true, '👺': true, _: [] }
  ```

- [x] `opts.unknown=true` - return the detailed object at `argv.unknown`.

  ```js
  parse(['-f', 'true', '--no-foo', 'true', 'noop!', '--', 'huh'], { unknown: true });
  // {
  //   "_": [
  //     "huh"
  //   ],
  //   "unknown": [
  //     Flag { type: 'short', name: 'f', value: 'true' },
  //     Flag { type: 'long', name: 'foo', value: false },
  //     "true",
  //     "noop!"
  //   ]
  // }
  ```

- [x] `opts.array` - the specified flag takes the following argument continually. (like a [npm-run-all](https://github.com/mysticatea/npm-run-all#run-a-mix-of-sequential-and-parallel-tasks))

  ```js
  // $ node program.js -s cover lint report -s foo bar baz -- huh
  parse(process.argv.slice(2), { array: 's' });
  // {
  //   "_": [
  //     "huh"
  //   ],
  //   "s": [
  //     ['cover', 'lint', 'report'],
  //     ['foo', 'bar', 'baz']
  //   ]
  // }
  ```

- [x] `opts.sentence` - if `true`, argument with right-comma/right-period, is defined in "sentence". (like an [abigail](https://github.com/abigailjs/abigail#usage))

  ```js
  // $ node program.js lorem. cover, lint, report. 'foo bar', baz. huh -- huh
  parse(process.argv.slice(2), { sentence: true });
  // {
  //   "_": [
  //     "huh",
  //     "huh"
  //   ],
  //   "sentence": [
  //     ['lorem'],
  //     ['cover', 'lint', 'report'],
  //     ['foo bar', 'baz']
  //   ]
  // }
  ```

- [x] Relative Filename Flag - if the flag name begins with a dot(e.g. `--./path/to/file`), it handled as a flag name.

  ```js
  // $ node program.js --use-popular-plugin --./my-extra-plugin.js customValue
  parse(process.argv.slice(2));
  // {
  //   'use-popular-plugin': true,
  //   './my-extra-plugin.js': 'customValue',
  //   _: []
  // }
  ```

- [x] `opts.nest` - if `true`, recursively parsing the inside of brackets (`[]`). like a [browserify syntax(aka subarg)](https://github.com/substack/subarg#subarg)

  ```js
  // $ node program.js rawr --beep [ boop -a 3 ] -n4 --robots [ -x 8 -y 6 ]
  parse(process.argv.slice(2), { nest: true });
  // { _: [ 'rawr' ],
  // beep: { _: [ 'boop' ], a: 3 },
  // n: 4,
  // robots: { _: [], x: 8, y: 6 } }
  ```

Stacktrace was broken
---
```bash
node
> require('chopsticks')('error')
# TypeError: args is not an array
# at n.u.createClass.value (/path/to/chopsticks/lib/index.js:1:59798)
```
published code is compressed and the source map is provided.
sourcemap isn't supported on NodeJS(current v5.10.0). but this resolved in the [node-source-map-support](https://github.com/evanw/node-source-map-support#readme).

```bash
npm install source-map-support --save-dev
```
```js
import 'source-map-support/register';
```
or...
```bash
$ mocha --require source-map-support/register
```

you can check the original line number.

```bash
$ node
require('source-map-support/register');
require('chopsticks')('error');
# TypeError: args is not an array
#    at n.u.createClass.value (/Users/59naga/Downloads/chopsticks/src/Chopsticks.js:58:13)
```

Development
---
Requirement global
* NodeJS v5.10.0
* Npm v3.8.3

```bash
git clone https://github.com/59naga/chopsticks
cd chopsticks
npm install

npm test
```

License
---
[MIT](http://59naga.mit-license.org/)
