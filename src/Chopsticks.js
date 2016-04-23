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
    } else if (options.object === true) {
      this.all = 'object';
    }
    this.strings = utils.toArray(options.string);
    this.booleans = utils.toArray(options.boolean);
    this.arrays = utils.toArray(options.array);
    this.objects = utils.toArray(options.object);

    this.unknown = options.unknown;
    if (typeof options.unknown === 'function') {
      this.unknownFn = options.unknown;
    }
    if (options.unknown === true) {
      this.unknownFn = (arg, flag, container) => {
        container.unknown.push(flag.name ? flag : arg);
        return false;
      };
    }
    this.stopEarly = options.stopEarly === true;
    this.dash = options.dash === true || options['--'] === true;
    this['--'] = options['--'] === true;
    this.sentence = options.sentence === true;
    this.nest = options.nest === true;
    this.nestArgs = [];
  }

  /**
  * @method parse
  * @param {string[]} args - a command line arguments
  * @returns {object} argv - the parsed options
  */
  parse(args) {
    if (process.env.NODE_ENV === 'production' && args instanceof Array === false) {
      throw new TypeError('args is not an array');
    }

    const container = this.initialize();
    const resolvedArgs = this.nest ? this.resolveNest(args) : args;

    let noParse = false;
    let inSentence = false;
    for (let i = 0; i < resolvedArgs.length; i++) {
      const arg = typeof resolvedArgs[i] === 'number' ? String(resolvedArgs[i]) : resolvedArgs[i];
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

      const result = utils.parseArg(arg, resolvedArgs[i + 1], this);
      result.flags.forEach((flag) => {
        const attribute = flag.getAttribute();
        if (this.unknownFn && attribute.unknown) {
          if (this.unknownFn(arg, flag, container) === false) {
            return;
          }
        }
        const origin = flag.getOrigin();
        if (attribute.array) {
          const j = _get(container.flags, origin, []).length;
          let k = 0;
          for (; i < resolvedArgs.length; i++) {
            const value = resolvedArgs[i + 1];
            const path = `${origin}[${j}][${k}]`;
            if (flag.isValidValue(value, this)) {
              this.setValue(container.flags, path, value, attribute);
              k++;
            } else {
              break;
            }
          }
          result.validNext = false;
        } else if (flag.value !== undefined) {
          this.setValue(container.flags, origin, flag.value, attribute);
        } else if (attribute.object) {
          this.setValue(container.flags, origin, {});
        } else if (attribute.string) {
          this.setValue(container.flags, origin, '');
        } else {
          this.setValue(container.flags, origin, true);
        }
      });
      if (result.validNext) {
        i++;
      }
      if (result.flags.length === 0 && this.sentence) {
        const hasDelimiter = (arg.match(/[^ ]([,.])$/) || [])[1];
        const words = hasDelimiter ? arg.replace(/[,.]$/, '') : arg;
        if (inSentence) {
          container.sentence[container.sentence.length - 1].push(words);
          if (hasDelimiter !== ',') {
            inSentence = false;
          }
          continue;
        } else if (hasDelimiter === ',') {
          inSentence = true;
          container.sentence.push([words]);
          continue;
        } else if (hasDelimiter === '.') {
          container.sentence.push([words]);
          continue;
        }
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
  * @method getFlagName
  * @param {string} arg - a command line argument
  * @returns {array} name - the current flag name
  */
  getFlagName(arg) {
    const result = utils.parseArg(arg, true, this);
    const lastFlag = result.flags[result.flags.length - 1] || {};
    if (lastFlag.name && lastFlag.name.length) {
      return lastFlag.name;
    }

    return '_';
  }

  /**
  * @method resolveNest
  * @param {string[]} args - a command line arguments
  * @returns {array} resolvedArgs
  */
  resolveNest(args) {
    const resolvedArgs = [];

    let level = 0;
    let nest = null;
    for (let i = 0; i < args.length; i++) {
      const levelUp = args[i][0] === '[';
      const levelDown = args[i].slice(-1) === ']';
      const content = args[i].replace(/(^\[|\]$)/g, '');
      if (levelUp) {
        level++;
        if (level === 1) {
          nest = [];
          this.nestArgs.push(this.getFlagName(args[i - 1]));
          if (content.length) {
            nest.push(content);
          }
          continue;
        }
      }
      if (levelDown) {
        level--;
        if (level === 0) {
          if (content.length) {
            nest.push(content);
          }
          resolvedArgs.push(this.parse(nest));
          this.nestArgs.pop();
          nest = null;
          continue;
        }
      }

      if (nest) {
        nest.push(args[i]);
      } else {
        resolvedArgs.push(args[i]);
      }
    }

    return resolvedArgs;
  }

  /**
  * @method normalize
  * @param {any} value - a value to be normalized
  * @param {object} attribute - a flag attribute
  * @returns {any} value - the normalized value
  */
  normalize(value, attribute = {}) {
    if (attribute.object) {
      const obj = {};
      _set(obj, value, true);
      return obj;
    }
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
    const location = flag[0] === '.' ? [flag] : flag;
    const targetValue = _get(target, location);
    const actualValue = this.normalize(value, attribute);
    if (
      targetValue === undefined
      || typeof targetValue === 'boolean'
    ) {
      _set(target, location, actualValue);
    } else if (Array.isArray(targetValue)) {
      targetValue.push(actualValue);
    } else {
      _set(target, location, [targetValue, actualValue]);
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
      unknown: [],
      sentence: [],
    };
  }

  /*
  * a final processing of the parse container
  *
  * @param {object} container - a initialized container object
  * @returns {object} argv - the parsed object like a minimist
  */
  finalize(container = {}) {
    if (this.nestArgs.length === 0) {
      Object.keys(this.defaults).forEach((flag) => {
        const value = _get(container.flags, flag);
        if (value === undefined) {
          _set(container.flags, flag, this.defaults[flag]);
        }
      });


      // @see github.com/substack/minimist/blob/1.2.0/test/parse.js#L82-L145
      this.strings.forEach((flag) => {
        if (_get(container.flags, flag) === undefined) {
          _set(container.flags, flag, '');
        }
      });

      // @see https://github.com/substack/minimist/blob/1.2.0/test/bool.js#L4
      this.booleans.forEach((flag) => {
        if (_get(container.flags, flag) === undefined) {
          _set(container.flags, flag, false);
        }
      });

      this.arrays.forEach((flag) => {
        if (_get(container.flags, flag) === undefined) {
          _set(container.flags, flag, []);
        }
      });

      this.objects.forEach((flag) => {
        if (_get(container.flags, flag) === undefined) {
          _set(container.flags, flag, {});
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
    }

    const params = {
      ...container.flags,
      _: container._,
    };
    if (process.env.NODE_ENV === undefined) {
      params.flagCount = container.flagCount;
    }
    if (this['--']) {
      params['--'] = container.dash;
    } else if (this.dash) {
      params.dash = container.dash;
    }
    if (this.sentence === true) {
      params.sentence = container.sentence;
    }
    if (this.unknown === true) {
      params.unknown = container.unknown;
    }
    return params;
  }
}
