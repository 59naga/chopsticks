import assert from 'power-assert';

// target
import parse from '../../src';

// specs
describe('use nest option', () => {
  it('if the nest is true, it should be pars', () => {
    assert.deepStrictEqual(
      parse('[ boop -o a.txt -o [b.txt -q] ]'.split(' '), {
        nest: true,
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
            }],
          },
        ],
        flagCount: 0,
      },
    );

    assert.deepStrictEqual(
      parse('[[[a -i0]]]'.split(' '), { nest: true }),
      {
        _: [
          {
            _: [
              {
                _: [
                  {
                    _: [
                      'a',
                    ],
                    i: 0,
                    flagCount: 1,
                  },
                ],
                flagCount: 0,
              },
            ],
            flagCount: 0,
          },
        ],
        flagCount: 0,
      },
    );

    // @see github.com/substack/subarg/blob/1.0.0/test/arg.js
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
        a: {
          _: [],
          b: {
            _: [],
            c: {
              _: [],
              d: 5,
              flagCount: 1,
            },
            flagCount: 1,
          },
          flagCount: 1,
        },
        e: 3,
        flagCount: 2,
      },
    );
  });
});
