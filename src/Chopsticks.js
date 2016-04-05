import _get from 'lodash.get';
import _set from 'lodash.set';
import * as utils from './utils';

export default class Chopsticks {
  constructor(options = {}) {
    this.aliases = {};
    Object.keys(options.alias || {}).forEach((key) => {
      this.aliases[key] = utils.toArray(options.alias[key]);
    });

    this.defaults = {};
    Object.keys(options.default || {}).forEach((key) => {
      this.defaults[key] = options.default[key];
    });

    this.all = false;
    if (options.boolean === true) {
      this.all = 'boolean';
    }
    this.strings = utils.toArray(options.string);
    this.booleans = utils.toArray(options.boolean);

    this.unknownFn = typeof options.unknown === 'function' ? options.unknown : false;
    this.greedyFn = options.greedy;
    this.stopEarly = options.stopEarly === true;
    this.dash = options.dash === true || options['--'] === true;
    this['--'] = options['--'] === true;
    this.detail = true;
  }

  normalize(flag, value) {
    if (this.booleans.indexOf(flag) > -1) {
      if (typeof value === 'boolean') {
        return value;
      }
      return value === 'true';
    }
    if (this.strings.indexOf(flag) > -1) {
      return value;
    }
    if (utils.isNumber(value)) {
      return Number(value);
    }

    return value;
  }

  setValue(target, flag, value) {
    const targetValue = _get(target, flag);
    const actualValue = this.normalize(flag, value);
    if (
      targetValue === undefined
      || typeof targetValue === 'boolean'
    ) {
      _set(target, flag, actualValue);
    } else if (Array.isArray(targetValue)) {
      targetValue.push(actualValue);
    } else {
      _set(target, flag, [targetValue, actualValue]);
    }
  }

  parse(args) {
    if (process.env.NODE_ENV !== 'minimist' && args instanceof Array === false) {
      throw new TypeError('args is not an array');
    }

    const container = {
      _: [],
      flags: {},
      get flagCount() {
        return Object.keys(this.flags).length;
      },
      dash: [],
    };

    let noParse = false;
    for (let i = 0; i < args.length; i++) {
      const arg = typeof args[i] === 'string' ? args[i] : String(args[i]);
      if (arg.length === 0) {
        continue;
      }

      if (arg === '--' && noParse === false) {
        noParse = true;
        continue;
      }
      if (noParse) {
        if (this.dash) {
          container.dash.push(arg);
        } else {
          container._.push(arg);
        }
        continue;
      }

      const result = utils.parseArg(arg, args[i + 1], this);
      result.flags.forEach((flag) => {
        if (this.unknownFn && utils.getAttribute(flag, this) === 'unknown') {
          if (this.unknownFn(arg, flag) === false) {
            return;
          }
        }
        if (flag.value !== undefined) {
          this.setValue(container.flags, flag.origin, flag.value);
        } else if (this.strings.indexOf(flag.origin) > -1) {
          this.setValue(container.flags, flag.origin, '');
        } else {
          this.setValue(container.flags, flag.origin, true);
        }
      });
      if (result.validNext) {
        i++;
      }
      if (result.flags.length === 0) {
        if (this.unknownFn) {
          if (this.unknownFn(arg, {}) === false) {
            continue;
          }
        }
        this.setValue(container, '_', arg);
      } else if (this.stopEarly) {
        noParse = true;
      }
    }

    Object.keys(this.defaults).forEach((flag) => {
      const value = _get(container.flags, flag);
      if (value === undefined) {
        _set(container.flags, flag, this.defaults[flag]);
      }
    });

    // @see https://github.com/substack/minimist/blob/1.2.0/test/bool.js#L4
    this.booleans.forEach((flag) => {
      if (_get(container.flags, flag) === undefined) {
        _set(container.flags, flag, false);
      }
    });

    // @see github.com/substack/minimist/blob/1.2.0/test/parse.js#L82-L145
    this.strings.forEach((flag) => {
      if (_get(container.flags, flag) === undefined) {
        _set(container.flags, flag, '');
      }
    });

    Object.keys(this.aliases).forEach((origin) => {
      this.aliases[origin].forEach((alias) => {
        const value = _get(container.flags, origin);
        if (value === undefined) {
          return;
        }

        _set(container.flags, alias, value);
      });
    });

    const params = {
      ...container.flags,
      _: container._,
    };
    if (process.env.NODE_ENV !== 'minimist') {
      params.flagCount = container.flagCount;
    }
    if (this['--']) {
      params['--'] = container.dash;
    } else if (this.dash) {
      params.dash = container.dash;
    }
    return params;
  }
}
