// no dependencies
const ABSOLUTE = Symbol('absolute');
const ORIGIN = Symbol('origin');
const ALIAS = Symbol('alias');
const ATTRIBUTE = Symbol('attribute');

// @class Flag
export default class Flag {
  constructor(type, name, value, opts = {}) {
    this.type = type;
    this.name = name;
    this.value = value;

    const nestArgs = opts.nestArgs || [];
    const aliases = opts.aliases || {};
    this[ABSOLUTE] = nestArgs.length ? nestArgs.concat(name).join('.') : name;
    this[ORIGIN] = this.resolveName(aliases);
    this[ALIAS] = [].concat(aliases[this[ORIGIN]] || []);
    this[ATTRIBUTE] = this.createAttribute(opts);
  }

  /**
  * @method getOrigin
  * @returns {string} ORIGIN - a original name
  */
  getOrigin() {
    return this[ORIGIN];
  }

  /**
  * @method getNames
  * @returns {string[]} names - a origin and alias names
  */
  getNames() {
    return [this[ORIGIN], this[ABSOLUTE]].concat(this[ALIAS] || []);
  }

  /**
  * @method getAttribute
  * @returns {object} attribute
  * @see createAttribute
  */
  getAttribute() {
    return this[ATTRIBUTE];
  }

  /**
  * @module resolveName
  * @param {object} aliases - an define of aliases
  * @returns {string} flag - the original name
  */
  resolveName(aliases = {}) {
    for (const origin in aliases) {
      if (origin === this[ABSOLUTE]) {
        return this.name;
      }
      if (aliases[origin].indexOf(this[ABSOLUTE]) > -1) {
        return origin;
      }
    }
    return this.name;
  }

  /**
  * @module createAttribute
  * @param {Chopsticks} opts - a chopsticks instance(Chopsticks.parse options)
  * @returns {object} attribute - the flag definition information
  *   - "source": return true if defined flag in key of opts.alias
  *   - "alias": return true if defined flag in opts.alias
  *   - "boolean": return true if defined flag in opts.boolean via opts.alias
  *   - "string": return true if defined flag in opts.string via opts.alias
  *   - "array": return true if defined flag in opts.array via opts.alias
  *   - "unknown": return true if above is all false
  */
  createAttribute(opts = {}) {
    let boolean = false;
    let string = false;
    let array = false;

    this.getNames().forEach((name) => {
      if (boolean === false) {
        if (opts.booleans && opts.booleans.indexOf(name) > -1) {
          boolean = true;
        } else if (boolean === false) {
          // @see github.com/substack/minimist/blob/1.2.0/test/all_bool.js#L18
          boolean = opts.all === 'boolean' && this.type === 'long' && this.value === undefined;
        }
      }
      if (string === false) {
        if (opts.strings && opts.strings.indexOf(name) > -1) {
          string = true;
        }
      }
      if (array === false) {
        if (opts.arrays && opts.arrays.indexOf(name) > -1) {
          array = true;
        }
      }
    });

    let source = false;
    for (const origin in opts.aliases) {
      if (origin === this.name) {
        source = true;
        break;
      }
    }
    const alias = this[ORIGIN] !== this.name;
    const unknown = (source || alias || boolean || string || array) === false;

    return { source, alias, boolean, string, array, unknown };
  }

  /**
  * check the valid argument
  *
  * @method isValidValue
  * @param {string} arg - a command line argument
  * @param {Chopsticks} [opts={}] - a chopsticks instance(Chopsticks.parse options)
  * @returns {boolean} isVaild
  */
  isValidValue(arg, opts = {}) {
    if (arg === undefined) {
      return false;
    }

    // @see github.com/substack/minimist/blob/1.2.0/test/num.js#L31
    const latter = typeof arg === 'string' ? arg : String(arg);

    if (this[ATTRIBUTE].boolean) {
      return /^(true|false)$/.test(latter);
    }
    if (latter === '-') {
      return true;
    }
    if (opts.sentence === true && latter.slice(-1).match(/[,.]/)) {
      return false;
    }
    if (latter.slice(0, 1) === '-') {
      return false;
    }

    return true;
  }
}
