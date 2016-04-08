// dependencies
import arrayFrom from 'array-from';

/**
* quote https://github.com/substack/minimist/blob/1.2.0/index.js#L231-L235
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
* @module resolveName
* @param {string} flag - an unknown alias flag
* @param {object} aliases - an define of aliases
* @returns {string} flag - the original name
*/
export function resolveName(flag, aliases = {}) {
  for (const origin in aliases) {
    if (origin === flag) {
      return origin;
    }
    if (aliases[origin].indexOf(flag) > -1) {
      return origin;
    }
  }
  return flag;
}

/**
* @module getAttribute
* @param {object} flagObject - a flag object (via utils.parseArg)
* @param {Chopsticks} opts - a chopsticks instance(Chopsticks.parse options)
* @returns {object} attribute - the flag definition information
*   - "source": return true if defined flag in key of opts.alias
*   - "alias": return true if defined flag in opts.alias
*   - "boolean": return true if defined flag in opts.boolean via opts.alias
*   - "string": return true if defined flag in opts.string via opts.alias
*   - "array": return true if defined flag in opts.array via opts.alias
*   - "unknown": return true if above is all false
*/
export function getAttribute(flagObject, opts = {}) {
  let boolean = false;
  let string = false;
  let array = false;

  const names = [flagObject.origin].concat(flagObject.alias || []);
  names.forEach((name) => {
    if (boolean === false) {
      if (opts.booleans.indexOf(name) > -1) {
        boolean = true;
      }
    }
    // @see github.com/substack/minimist/blob/1.2.0/test/all_bool.js#L18
    if (boolean === false) {
      boolean = opts.all === 'boolean' && flagObject.type === 'long' && flagObject.value === undefined;
    }
    if (string === false) {
      if (opts.strings.indexOf(name) > -1) {
        string = true;
      }
    }
    if (array === false) {
      if (opts.arrays.indexOf(name) > -1) {
        array = true;
      }
    }
  });

  let source = false;
  for (const origin in opts.aliases) {
    if (origin === flagObject.name) {
      source = true;
      break;
    }
  }
  const alias = flagObject.origin !== flagObject.name;
  const unknown = (source || alias || boolean || string || array) === false;

  return { source, alias, boolean, string, array, unknown };
}

/**
* check the valid argument for flagObject
*
* @module isValidValue
* @param {object} flagObject - a flag define
* @param {string} arg - a command line argument
* @param {Chopsticks} opts - a chopsticks instance(Chopsticks.parse options)
* @returns {boolean} isVaild
*/
export function isValidValue(flagObject, arg, opts = {}) {
  // @see github.com/substack/minimist/blob/1.2.0/test/num.js#L31
  const latter = typeof arg === 'string' ? arg : String(arg);

  let isBool = false;
  if (opts.all === 'boolean') {
    // @see https://github.com/substack/minimist/blob/1.2.0/test/all_bool.js#L18
    isBool = flagObject.type === 'long';
  }
  if (opts.booleans !== undefined) {
    const booleans = [].concat(opts.booleans);
    for (let i = 0; i < booleans.length; i++) {
      if (
        booleans[i] === flagObject.name
        || booleans[i] === flagObject.origin
        || flagObject.alias.indexOf(booleans[i]) > -1
      ) {
        isBool = true;
        break;
      }
    }
  }

  if (isBool) {
    return /^(true|false)$/.test(latter);
  }
  if (latter === '-') {
    return true;
  }
  if (opts.sentence === true && latter.slice(-1) === ',') {
    return false;
  }
  if (latter.slice(0, 1) === '-') {
    return false;
  }

  return true;
}

/**
* @module parseArg
* @param {string} arg - a command line argument
* @param {string} nextArg - a next command line argument
* @param {Chopsticks} opts - a chopsticks instance(Chopsticks.parse options)
* @returns {object} flagObjects - the one analysis result of argument
*/
export function parseArg(arg, nextArg, opts = {}) {
  const type = arg.slice(0, 2) === '--' ? 'long' : 'short';
  const negative = arg.slice(0, 5) === '--no-';
  if (
    arg.slice(0, 1) !== '-'
    || arg === '-'
    || arg === '--'
  ) {
    return { flags: [], validNext: false };
  }

  let [name, value] = arg.split('=');
  if (negative && value === undefined) {
    name = name.slice(3);
    value = false;
  }
  name = type === 'short' ? name.slice(1) : name.slice(2);
  if (name.length === 0) {
    return { flags: [], validNext: false };
  }

  const flags = [];
  const aliases = opts.aliases || {};
  if (type === 'short') {
    const chunks = arrayFrom(name);
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const origin = resolveName(chunk, aliases);
      const alias = [].concat(aliases[origin] || []);
      const dregs = chunks.slice(i + 1).join('');

      if (/\D/.test(chunk) && isNumber(dregs)) {
        flags.push({ type, origin, alias, name: chunk, value: dregs });
        break;
      }

      // @see https://github.com/substack/minimist/blob/1.2.0/test/dash.js#L8
      // @see https://github.com/substack/minimist/blob/1.2.0/test/parse.js#L149
      const breakWord = /[\/-]/;
      if (name[0].match(breakWord) === null && dregs[0] && dregs[0].match(breakWord)) {
        flags.push({ type, origin, alias, name: chunk, value: dregs });
        break;
      }

      flags.push({ type, origin, alias, name: chunk, value });
    }
  } else {
    const origin = resolveName(name, aliases);
    const alias = [].concat(aliases[origin] || []);
    flags.push({ type, origin, alias, name, value });
  }

  let validNext = false;
  const lastFlag = flags[flags.length - 1];
  if (lastFlag.value === undefined && nextArg !== undefined) {
    if (isValidValue(lastFlag, nextArg, opts)) {
      lastFlag.value = nextArg;
      validNext = true;
    }
  }

  return { flags, validNext };
}
