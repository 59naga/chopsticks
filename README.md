Chopsticks
---

<p align="right">
  <a href="https://npmjs.org/package/chopsticks">
    <img src="https://img.shields.io/npm/v/chopsticks.svg?style=flat-square">
  </a>
  <a href="https://travis-ci.org/59naga/chopsticks">
    <img src="http://img.shields.io/travis/59naga/chopsticks.svg?style=flat-square">
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

> WIP

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
- [x] `opts.dash` (`opts['--']`)
- [x] `opts.unknown`
- [ ] `opts.greedy`
- [ ] `opts.comma`

> [minimist-v1.2.0](https://github.com/substack/minimist#methods) spec completed.

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
