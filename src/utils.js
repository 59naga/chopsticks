import arrayFrom from 'array-from';

// quote https://github.com/substack/minimist/blob/1.2.0/index.js#L231-L235
export function isNumber(value) {
  if (typeof value === 'number') {
    return true;
  }
  if (/^0x[0-9a-f]+$/i.test(value)) {
    return true;
  }
  return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(value);
}

export function toArray(value) {
  if (value === undefined) {
    return [];
  }
  if (value === true) {
    return [];
  }
  return value instanceof Array ? value : [value];
}

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

export function getAttribute(flagObject, opts = {}) {
  if (opts.all === 'boolean' && flagObject.type === 'long' && flagObject.value === undefined) {
    return 'boolean';
  }
  if (opts.booleans.indexOf(flagObject.origin) > -1) {
    return 'boolean';
  }
  if (opts.strings.indexOf(flagObject.origin) > -1) {
    return 'string';
  }
  if (flagObject.origin !== flagObject.name) {
    return 'alias';
  }
  for (const origin in opts.aliases) {
    if (origin === flagObject.name) {
      return 'source';
    }
  }

  return 'unknown';
}

export function isVaildValue(flagObject, arg, opts = {}) {
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
  if (latter.slice(0, 1) === '-') {
    return false;
  }

  return true;
}

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
    if (isVaildValue(lastFlag, nextArg, opts)) {
      lastFlag.value = nextArg;
      validNext = true;
    }
  }

  return { flags, validNext };
}
