// @see github.com/substack/minimist/blob/1.2.0/test/parse.js#L159-L178
import assert from 'power-assert';
import deepStrictEqual from 'deep-strict-equal';

// target
import parse from '../../src';

// specs
describe('use array option', () => {
  it('if the flag is boolean, it should be initialized with []', () => {
    const params = parse(['-x', '-z', 'one', 'two', 'three'], {
      array: ['x', 'y', 'z'],
    });

    assert(params._.length === 0);
    assert(params.flagCount === 3);
    assert(params.x.length === 0);
    assert(params.y.length === 0);
    assert(params.z.length === 1);
    assert(params.z[0].length === 3);
    assert(params.z[0][0] === 'one');
    assert(params.z[0][1] === 'two');
    assert(params.z[0][2] === 'three');
  });

  it('if specify array, continuously should take the argument', () => {
    assert(deepStrictEqual(
      parse(
        '--array foo bar baz --array beep boop kaboom -- huh'.split(' '),
        {
          array: 'array',
        }
      ),
      {
        flagCount: 1,
        array: [
          ['foo', 'bar', 'baz'],
          ['beep', 'boop', 'kaboom'],
        ],
        _: ['huh'],
      }
    ));
  });

  it('if specify array and boolean, should be normalized', () => {
    assert(deepStrictEqual(
      parse(
        '--array foo bar baz --array true false true -- huh'.split(' '),
        {
          array: 'array',
          boolean: 'array',
        }
      ),
      {
        flagCount: 1,
        array: [
          [true, false, true],
        ],
        _: [
          'foo',
          'bar',
          'baz',
          'huh',
        ],
      }
    ));
  });

  it('if specify array and string, should be normalized', () => {
    assert(deepStrictEqual(
      parse(
        '--strs 0xdeadbeef 1234 5.6 1e7 --nums 0xdeadbeef 1234 5.6 1e7 -- huh'.split(' '),
        {
          array: ['strs', 'nums'],
          string: 'strs',
        }
      ),
      {
        flagCount: 2,
        strs: [
          ['0xdeadbeef', '1234', '5.6', '1e7'],
        ],
        nums: [
          [0xdeadbeef, 1234, 5.6, 1e7],
        ],
        _: [
          'huh',
        ],
      }
    ));
  });

  it('if specify array via alias, continuously should take the argument', () => {
    assert(deepStrictEqual(
      parse(
        '--👺 foo bar baz -👺 beep boop kaboom -- huh'.split(' '),
        {
          array: 'array',
          alias: {
            '👺': 'array',
          },
        }
      ),
      {
        flagCount: 2,
        '👺': [
          ['foo', 'bar', 'baz'],
          ['beep', 'boop', 'kaboom'],
        ],
        array: [
          ['foo', 'bar', 'baz'],
          ['beep', 'boop', 'kaboom'],
        ],
        _: ['huh'],
      },
    ));
  });
});
