// @see github.com/substack/subarg/blob/1.0.0/test/arg.js
import assert from 'power-assert';

// target
import parse from '../../src';

// specs
describe('use nest option', () => {
  it('if the nest is true, it should be pars', () => {
    assert.deepStrictEqual(
      parse('beep -t [ boop -o a.txt -o b.txt -q ] -v'.split(' '), {
        nest: true,
      }),
      {
        _: ['beep'],
        flagCount: 2,
        t: {
          flagCount: 2,
          _: ['boop'],
          o: ['a.txt', 'b.txt'],
          q: true,
        },
        v: true,
      },
    );

    assert.deepStrictEqual(
      parse('beep -t [boop -o a.txt -o b.txt -q] -v'.split(' '), {
        nest: true,
      }),
      {
        _: ['beep'],
        flagCount: 2,
        t: {
          flagCount: 2,
          _: ['boop'],
          o: ['a.txt', 'b.txt'],
          q: true,
        },
        v: true,
      },
    );
  });

  it('recursive nest should work', () => {
    assert.deepStrictEqual(
      parse('-a [ -b [ -c [ -d 5 ] ] ] -e 3'.split(' '), {
        nest: true,
      }),
      {
        _: [],
        flagCount: 2,
        a: {
          _: [],
          flagCount: 1,
          b: {
            _: [],
            flagCount: 1,
            c: {
              _: [],
              flagCount: 1,
              d: 5,
            },
          },
        },
        e: 3,
      },
    );
  });
});
