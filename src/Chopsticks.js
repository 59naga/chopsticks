// dependencies
import _get from 'lodash.get';
import _set from 'lodash.set';
import * as utils from './utils';

// @class Chopsticks
export default class Chopsticks {
  /**
  * @constructor
  * @param {object} [options={}] - a customize specifies
  */
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
    this.arrays = utils.toArray(options.array);

    this.unknown = options.unknown;
    if (typeof options.unknown === 'function') {
      this.unknownFn = options.unknown;
    }
    if (options.unknown === true) {
      this.unknownFn = (arg, flag, container) => {
        if (container.unknown === undefined) {
          container.unknown = []; // eslint-disable-line no-param-reassign
        }
        container.unknown.push(flag.name ? flag : arg);
        return false;
      };
    }
    this.greedyFn = options.greedy;
    this.stopEarly = options.stopEarly === true;
    this.dash = options.dash === true || options['--'] === true;
    this['--'] = options['--'] === true;
    this.detail = true;
  }

  /**
  * @method parse
  * @param {string[]} args - a command line arguments
  * @returns {object} argv - the parsed options
  */
  parse(args) {
    if (process.env.NODE_ENV !== 'minimist' && args instanceof Array === false) {
      throw new TypeError('args is not an array');
    }

    const container = this.initialize();

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
        const attribute = utils.getAttribute(flag, this);
        if (this.unknownFn && attribute.unknown) {
          if (this.unknownFn(arg, flag, container) === false) {
            return;
          }
        }
        if (attribute.array) {
          const j = _get(container.flags, flag.origin, []).length;
          let k = 0;
          for (; i < args.length; i++) {
            const value = args[i + 1];
            const path = `${flag.origin}[${j}][${k}]`;
            if (value !== undefined && utils.isValidValue(flag, value, this)) {
              this.setValue(container.flags, path, value, attribute);
              k++;
            } else {
              break;
            }
          }
          result.validNext = false;
        } else if (flag.value !== undefined) {
          this.setValue(container.flags, flag.origin, flag.value, attribute);
        } else if (attribute.string) {
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
          if (this.unknownFn(arg, {}, container) === false) {
            continue;
          }
        }
        this.setValue(container, '_', arg);
      } else if (this.stopEarly) {
        noParse = true;
      }
    }

    return this.finalize(container);
  }

  /**
  * @method normalize
  * @param {string} flag - a confirm the definition name
  * @param {any} value - a value to be normalized
  * @param {object} attribute - a flag attribute
  * @returns {any} value - the normalized value
  */
  normalize(flag, value, attribute = {}) {
    if (attribute.boolean) {
      return value === 'true';
    }
    if (attribute.string) {
      return value;
    }
    if (utils.isNumber(value)) {
      return Number(value);
    }

    return value;
  }

  /**
  * @method setValue
  * @param {object} target - a object to assign a value
  * @param {string} flag - a flag name
  * @param {string} value - an assignment value(are normalize)
  * @param {object} attribute - a flag attribute
  * @returns {undefined}
  */
  setValue(target, flag, value, attribute = {}) {
    const targetValue = _get(target, flag);
    const actualValue = this.normalize(flag, value, attribute);
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

  /**
  * generate container object for parse
  *
  * @returns {object} container
  */
  initialize() {
    return {
      _: [],
      flags: {},
      get flagCount() {
        return Object.keys(this.flags).length;
      },
      dash: [],
    };
  }

  /*
  * a final processing of the parse container
  *
  * @param {object} container - a initialized container object
  * @returns {object} argv - the parsed object like a minimist
  */
  finalize(container = {}) {
    Object.keys(this.defaults).forEach((flag) => {
      const value = _get(container.flags, flag);
      if (value === undefined) {
        _set(container.flags, flag, this.defaults[flag]);
      }
    });

    this.arrays.forEach((flag) => {
      if (_get(container.flags, flag) === undefined) {
        _set(container.flags, flag, []);
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
    if (process.env.NODE_ENV === 'chopsticks') {
      params.flagCount = container.flagCount;
    }
    if (this['--']) {
      params['--'] = container.dash;
    } else if (this.dash) {
      params.dash = container.dash;
    }
    if (this.unknown === true) {
      params.unknown = container.unknown;
    }
    return params;
  }
}
