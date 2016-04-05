// @see github.com/substack/minimist/blob/1.2.0/test/unknown.js
import assert from 'power-assert';
import sinon from 'sinon';

// target
import parse from '../../src';

// environment
let params;

// specs
describe('use unknown option', () => {
  it('if specify only the unknown, should ignore all of the argument', () => {
    const opts = {
      unknown: sinon.spy(() => false),
    };

    params = parse(['-f', 'true', '--no-foo', 'true', '--'], opts);
    assert(opts.unknown.callCount === 3);
    assert(opts.unknown.args[0][0] === '-f');
    assert(opts.unknown.args[0][1].name === 'f');
    assert(opts.unknown.args[0][1].value === 'true');
    assert(opts.unknown.args[1][0] === '--no-foo');
    assert(opts.unknown.args[1][1].name === 'foo');
    assert(opts.unknown.args[1][1].value === false);
    assert(opts.unknown.args[2][0] === 'true');

    assert(params._.length === 0);
    assert(params.flagCount === 0);
  });

  it('unless unknown function returns a false, should be continued parsing', () => {
    const opts = {
      unknown: sinon.spy(() => true),
    };

    params = parse(['-f', 'true', '--no-foo', 'true', '--'], opts);
    assert(opts.unknown.callCount === 3);
    assert(opts.unknown.args[0][0] === '-f');
    assert(opts.unknown.args[0][1].name === 'f');
    assert(opts.unknown.args[0][1].value === 'true');
    assert(opts.unknown.args[1][0] === '--no-foo');
    assert(opts.unknown.args[1][1].name === 'foo');
    assert(opts.unknown.args[1][1].value === false);

    assert(params._.length === 1);
    assert(params.flagCount === 2);
    assert(params.f === 'true');
    assert(params.foo === false);
    assert(params._[0] === 'true');
  });

  it('when the alias has been defined, it should be known', () => {
    const opts = {
      alias: { f: 'foo' },
      unknown: sinon.spy(() => false),
    };

    params = parse(['-f', 'true', '--bar', 'true'], opts);
    assert(opts.unknown.callCount === 1);
    assert(opts.unknown.args[0][0] === '--bar');

    assert(params._.length === 0);
    assert(params.flagCount === 2);
    assert(params.f === 'true');
    assert(params.foo === 'true');
  });

  it('when the boolean has been defined, it should be known', () => {
    const opts = {
      boolean: 'f',
      unknown: sinon.spy(() => false),
    };

    params = parse(['-f', 'true', '--foo', 'true'], opts);
    assert(opts.unknown.callCount === 1);
    assert(opts.unknown.args[0][0] === '--foo');

    assert(params._.length === 0);
    assert(params.flagCount === 1);
    assert(params.f === true);
  });

  it('when the string has been defined, it should be known', () => {
    const opts = {
      string: 'f',
      unknown: sinon.spy(() => false),
    };

    params = parse(['-f', '-b=true', '--bar', 'true'], opts);
    assert(opts.unknown.callCount === 2);
    assert(opts.unknown.args[0][0] === '-b=true');
    assert(opts.unknown.args[0][1].name === 'b');
    assert(opts.unknown.args[0][1].value === 'true');
    assert(opts.unknown.args[1][0] === '--bar');
    assert(opts.unknown.args[1][1].name === 'bar');
    assert(opts.unknown.args[1][1].value === 'true');

    assert(params._.length === 0);
    assert(params.flagCount === 1);
    assert(params.f === '');
  });

  // @see https://github.com/substack/minimist/blob/1.2.0/test/unknown.js#L24-L40
  it('if boolean is true, pure long flag should be handle as a known only', () => {
    const opts = {
      boolean: true,
      unknown: sinon.spy(() => false),
    };
    params = parse(['--honk', '--tacos=good', 'cow', '-p', '55'], opts);
    assert(opts.unknown.callCount === 3);
    assert(opts.unknown.args[0][0] === '--tacos=good');
    assert(opts.unknown.args[1][0] === 'cow');
    assert(opts.unknown.args[2][0] === '-p');

    assert(params._.length === 0);
    assert(params.flagCount === 1);
    assert(params.honk === true);
  });

  // @see github.com/substack/minimist/blob/1.2.0/test/unknown.js#L83-L102
  it('', () => {
    const opts = {
      '--': true,
      unknown: sinon.spy(() => false),
    };
    params = parse(['--bad', '--', 'good', 'arg'], opts);

    assert(opts.unknown.callCount === 1);
    assert(opts.unknown.args[0][0] === '--bad');
    assert(params._.length === 0);
    assert(params.flagCount === 0);
    assert(params['--'].length === 2);
    assert(params['--'][0] === 'good');
    assert(params['--'][1] === 'arg');
  });
});