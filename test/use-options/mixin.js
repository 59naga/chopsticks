// dependencies
import assert from 'power-assert';
import sinon from 'sinon';

// target
import parse from '../../src';

// environment
let params;

// specs
describe('use many options(high complexity)', () => {
  // @see github.com/substack/minimist/blob/1.2.0/test/default_bool.js
  it('if the flag is undefined it should set the default value', () => {
    params = parse([], {
      default: { foo: true },
      boolean: 'foo',
    });

    assert(params._.length === 0);
    assert(params.flagCount === 1);
    assert(params.foo === true);

    params = parse([], {
      default: { foo: false },
      boolean: 'foo',
    });

    assert(params._.length === 0);
    assert(params.flagCount === 1);
    assert(params.foo === false);

    params = parse([], {
      default: { foo: null },
      boolean: 'foo',
    });
    assert(params.foo === null);

    params = parse(['--foo'], {
      default: { foo: null },
      boolean: 'foo',
    });
    assert(params.foo === true);
  });

  // @see github.com/substack/minimist/blob/1.2.0/test/parse_modified.js
  it('if specify boolean, it should be ignored except "true" and "false"', () => {
    params = parse(
      ['-a', '123'],
      { boolean: 'a' },
    );
    assert(params._.length === 1);
    assert(params.flagCount === 1);
    assert(params.a === true);
    assert(params._[0] === 123);

    params = parse(
      ['-a', '123', '-b', 'c', '--foo', 'false'],
      { boolean: ['a', 'b', 'foo'] },
    );
    assert(params._.length === 2);
    assert(params.flagCount === 3);
    assert(params.a === true);
    assert(params.b === true);
    assert(params.foo === false);
    assert(params._[0] === 123);
    assert(params._[1] === 'c');
  });

  // @see github.com/substack/minimist/blob/1.2.0/test/bool.js#L83-L104
  it('alias and the flag is should always equal', () => {
    const aliased = ['-f', 'string'];
    const regular = ['--foo', 'string'];
    const alt = ['--bar', 'string'];
    const opts = {
      alias: { f: ['foo', 'bar'] },
      boolean: 'f',
    };
    const expected = {
      _: ['string'],
      flagCount: 3,
      f: true,
      foo: true,
      bar: true,
    };

    assert.deepStrictEqual(parse(aliased, opts), expected);
    assert.deepStrictEqual(parse(regular, opts), expected);
    assert.deepStrictEqual(parse(alt, opts), expected);
  });

  it('', () => {
    assert.deepStrictEqual(
      parse(['-h', 'derp'], {
        boolean: 'herp',
        alias: { h: 'herp' },
      }), {
        herp: true,
        h: true,
        flagCount: 2,
        _: ['derp'],
      },
    );
  });

  // @see github.com/substack/minimist/blob/1.2.0/test/bool.js#L144-L166
  it('if flag is boolean, should convert "true" and "false" to boolean', () => {
    params = parse(['--foo=true'], {
      default: {
        foo: false,
      },
      boolean: ['foo'],
    });
    assert(params._.length === 0);
    assert(params.flagCount === 1);
    assert(params.foo === true);

    params = parse(['--foo=false', '-ba'], {
      default: {
        foo: true,
        b: false,
        a: false,
        r: false,
      },
      boolean: ['foo', 'b', 'a', 'r'],
    });
    assert(params._.length === 0);
    assert(params.flagCount === 4);
    assert(params.foo === false);
    assert(params.b === true);
    assert(params.a === true);
    assert(params.r === false);
  });

  // @see github.com/substack/minimist/blob/1.2.0/test/all_bool.js
  it('flag boolean true (default all --args to boolean)', () => {
    params = parse(
      ['foo', '--bar', 'baz'],
      { boolean: true },
    );

    assert(params._.length === 2);
    assert(params.flagCount === 1);
    assert(params._[0] === 'foo');
    assert(params.bar === true);
    assert(params._[1] === 'baz');
  });

  it('if boolean is true, should set flag to long flag(--) only. unless includes the "="', () => {
    params = parse(
      ['foo', '--bar', 'baz', '-x', '59', '--beep=boop', '--y', '798', '--'],
      { boolean: true },
    );

    assert(params._.length === 3);
    assert(params.flagCount === 4);
    assert(params._[0] === 'foo');
    assert(params.bar === true);
    assert(params._[1] === 'baz');
    assert(params.x === 59);
    assert(params.beep === 'boop');
    assert(params.y === true);
    assert(params._[2] === 798);
  });

  it('string and alias', () => {
    params = parse(['--str', '000123'], {
      string: 's',
      alias: { s: 'str' },
    });

    assert(params._.length === 0);
    assert(params.flagCount === 2);
    assert(params.s === '000123');
    assert(params.str === '000123');
    assert(params.str === params.s);

    params = parse(['-s', '000123'], {
      string: 'str',
      alias: { str: 's' },
    });

    assert(params._.length === 0);
    assert(params.flagCount === 2);
    assert(params.s === '000123');
    assert(params.str === '000123');
    assert(params.str === params.s);
  });

  // @see github.com/substack/minimist/blob/1.2.0/test/dotted.js#L4-L16
  it('dotted alias', () => {
    params = parse(
      ['--a.b', '22'],
      { default: { 'a.b': 11 }, alias: { 'a.b': 'aa.bb' } },
    );
    assert(params.a.b === 22);
    assert(params.aa.bb === 22);

    params = parse(
      [''],
      { default: { 'a.b': 11 }, alias: { 'a.b': ['aa.bb', 'ccc.ddd'] } }
    );
    assert(params.a.b === 11);
    assert(params.aa.bb === 11);
    assert(params.ccc.ddd === 11);
  });

  it('should process z only as unknown', () => {
    const opts = {
      alias: {
        foo: ['f', 'o', 'o'],
        bar: ['b', 'a', 'r'],
      },
      boolean: 'foo',
      string: 'bar',
      unknown: sinon.spy(() => false),
    };

    params = parse(['--foo=false', '-b', '-z'], opts);
    assert(opts.unknown.callCount === 1);
    assert(opts.unknown.args[0][0] === '-z');
    assert(opts.unknown.args[0][1].name === 'z');
    assert(opts.unknown.args[0][1].value === undefined);

    assert(params._.length === 0);
    assert(params.flagCount === 7);
    assert(params.foo === false);
    assert(params.f === params.foo);
    assert(params.o === params.foo);
    assert(params.foo === false);
    assert(params.bar === '');
    assert(params.b === params.bar);
    assert(params.a === params.bar);
    assert(params.r === params.bar);
  });

  describe('nest', () => {
    it('dash', () => {
      assert.deepStrictEqual(
        parse('[ boop -o a.txt -o [b.txt -q -- foo] -- bar ] -- baz'.split(' '), {
          nest: true,
          dash: true,
        }),
        {
          _: [
            {
              flagCount: 1,
              _: ['boop'],
              o: ['a.txt', {
                _: ['b.txt'],
                flagCount: 1,
                q: true,
                dash: ['foo'],
              }],
              dash: ['bar'],
            },
          ],
          dash: ['baz'],
          flagCount: 0,
        },
      );
    });

    it('alias', () => {
      assert.deepStrictEqual(
        parse('--foo [ --bar [ --baz=beep ] ]'.split(' '), {
          nest: true,
          alias: {
            'foo.bar.baz': 'okComputer',
          },
        }),
        {
          _: [],
          foo: {
            _: [],
            bar: {
              _: [],
              baz: 'beep',
              flagCount: 1,
            },
            flagCount: 1,
          },
          okComputer: 'beep',
          flagCount: 2,
        },
      );
    });

    xit('array', () => {
      assert.deepStrictEqual(
        parse('--foo [ --bar [ --baz=beep ] [ --boop ] ]'.split(' '), {
          nest: true,
          array: 'foo.bar',
        }),
        {
          _: [],
          foo: {
            _: [],
            bar: [
              [
                {
                  _: [],
                  baz: 'beep',
                  flagCount: 1,
                },
                {
                  _: [],
                  boop: true,
                  flagCount: 1,
                },
              ],
            ],
            flagCount: 1,
          },
          flagCount: 1,
        },
      );
    });
  });
});
