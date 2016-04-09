// dependencies
import arrayFrom from '@59naga/array.from';

// self dependencies
import Flag from './Flag';

/**
* quote github.com/substack/minimist/blob/1.2.0/index.js#L231-L235
*
* @module isNumber
* @param {any} value - a target
* @returns {boolean} isNumber
*/
export function isNumber(value) {
  if (typeof value === 'number') {
    return true;
  }
  if (/^0x[0-9a-f]+$/i.test(value)) {
    return true;
  }
  return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(value);
}

/**
* @module toArray
* @param {any} value - not an array
* @returns {any[]} array
*/
export function toArray(value) {
  if (value === undefined || value === null) {
    return [];
  }
  if (typeof value === 'boolean') {
    return [];
  }
  return value instanceof Array ? value : [value];
}

/**
* @module parseShortFlags
* @param {string} name - a flag name
* @param {string} value - a flag value directly
* @param {Chopsticks} opts - a chopsticks instance(Chopsticks.parse options)
* @returns {Flag[]} flags - the parsed short flags
*/
export function parseShortFlags(name, value, opts = {}) {
  const flags = [];

  const chunks = arrayFrom(name);
  const breakWord = /[\/-]/;
  const validShortFlag = name[0].match(breakWord) === null;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const flag = new Flag('short', chunk, value, opts);

    if (validShortFlag) {
      const dregs = chunks.slice(i + 1).join('');
      const withNumber = /\D/.test(chunk) && isNumber(dregs); // e.g. (`-i123`)
      if (withNumber) {
        flag.value = dregs;
        flags.push(flag);
        break;
      }

      // @see https://github.com/substack/minimist/blob/1.2.0/test/dash.js#L8
      // @see https://github.com/substack/minimist/blob/1.2.0/test/parse.js#L149
      const withBreakWord = dregs[0] && dregs[0].match(breakWord);
      if (withBreakWord) {
        flag.value = dregs;
        flags.push(flag);
        break;
      }
    }

    flags.push(flag);
  }

  return flags;
}

/**
* @module isntFlag
* @param {string} arg - a command line argument
* @returns {boolean} isntFlag - the argument is flag
*/
export function isntFlag(arg) {
  return typeof arg !== 'string' || arg.slice(0, 1) !== '-' || arg === '-' || arg === '--';
}

/**
* @module parseArg
* @param {string} arg - a command line argument
* @param {string} nextArg - a next command line argument
* @param {Chopsticks} opts - a chopsticks instance(Chopsticks.parse options)
* @returns {object} flagObjects - the argument parse result
*/
export function parseArg(arg, nextArg, opts = {}) {
  if (isntFlag(arg)) {
    return { flags: [], validNext: false };
  }

  let [name, value] = arg.split('=');
  const isNegative = arg.slice(0, 5) === '--no-';
  if (isNegative && value === undefined) {
    name = name.slice(3);
    value = false;
  }
  const type = arg.slice(0, 2) === '--' ? 'long' : 'short';
  name = type === 'short' ? name.slice(1) : name.slice(2);
  if (name.length === 0) {
    return { flags: [], validNext: false };
  }

  let flags;
  if (type === 'short') {
    flags = parseShortFlags(name, value, opts);
  } else {
    flags = [new Flag(type, name, value, opts)];
  }

  let validNext = false;
  const lastFlag = flags[flags.length - 1];
  if (lastFlag.value === undefined && lastFlag.isValidValue(nextArg, opts)) {
    lastFlag.value = nextArg;
    validNext = true;
  }

  return { flags, validNext };
}
