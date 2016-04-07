// @see github.com/substack/minimist/blob/1.2.0/test/unknown.js
import assert from 'power-assert';
import { parse as shellParse } from 'shell-quote';
import sinon from 'sinon';

// target
import parse from '../../src';

// environment
let params;

// specs
describe('use unknown option', () => {
  it('if specify unknown is true, it should return the unknown flag as detailed object', () => {
    const opts = {
      unknown: true,
    };

    params = parse(['-f', 'true', '--no-foo', 'true', 'noop!', '--', 'huh'], opts);
    assert(params._.length === 1);
    assert(params.unknown.length === 4);
    assert(params.unknown[0].name === 'f');
    assert(params.unknown[0].value === 'true');
    assert(params.unknown[1].name === 'foo');
    assert(params.unknown[1].value === false);
    assert(params.unknown[2] === 'true');
    assert(params.unknown[3] === 'noop!');
    assert(params._[0] === 'huh');
    assert(params.flagCount === 0);
  });

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

  it('when the array has been defined, it should be known', () => {
    const opts = {
      array: 'f',
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
    assert(params.f.length === 0);
    assert(params.f instanceof Array);
  });

  it('if sentence is true, it should be sentence is known', () => {
    const opts = {
      sentence: true,
      unknown: sinon.spy(() => false),
    };

    params = parse(shellParse("cover, lint, report. 'foo bar', baz. huh -- huh"), opts);
    assert(opts.unknown.callCount === 1);
    assert(opts.unknown.args[0][0] === 'huh');
    assert(opts.unknown.args[0][1].name === undefined);
    assert(opts.unknown.args[0][1].value === undefined);

    assert(params._.length === 1);
    assert(params.flagCount === 0);
    assert(params.sentence.length === 2);
    assert(params.sentence[0].length === 3);
    assert(params.sentence[0][0] === 'cover');
    assert(params.sentence[0][1] === 'lint');
    assert(params.sentence[0][2] === 'report');
    assert(params.sentence[1].length === 2);
    assert(params.sentence[1][0] === 'foo bar');
    assert(params.sentence[1][1] === 'baz');
    assert(params._[0] === 'huh');
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
  it('arguments after the "==" should not handled as unknown', () => {
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

  describe('issues', () => {
    it('#1', () => {
      assert.deepStrictEqual(
        parse(['-f'], {
          string: 'b',
          alias: {
            f: 'b',
          },
          unknown() {
            return false;
          },
        }),
        {
          f: '',
          b: '',
          _: [],
          flagCount: 2,
        },
      );
    });
  });
});
