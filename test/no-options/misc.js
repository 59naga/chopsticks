// dependencies
import assert from 'assert';

// target
import parse from '../../src';

// environment
let params;

// specs
describe('parse(misc)', () => {
  // @see github.com/substack/minimist/blob/1.2.0/test/parse.js#L147-L157
  it('if the short flag has a "/", should be set "/" or later as a value', () => {
    assert.deepStrictEqual(
      parse(['-I/foo/bar/baz']),
      { I: '/foo/bar/baz', flagCount: 1, _: [] }
    );
    assert.deepStrictEqual(
      parse(['-xyz/foo/bar/baz']),
      { x: true, y: true, z: '/foo/bar/baz', flagCount: 3, _: [] }
    );
    assert.deepStrictEqual(
      parse(['-xyz/foo/bar/baz', 'baz']),
      { x: true, y: true, z: '/foo/bar/baz', flagCount: 3, _: ['baz'] }
    );
  });

  // @see github.com/substack/minimist/tree/1.2.0/test/parse.js#L10-L14
  // @see github.com/substack/minimist/blob/1.2.0/test/parse.js#L18-L43
  it('if set multiple values in the flag, it should be changed to an array', () => {
    params = parse(['-m', 'a', '-m', 'b', '-m', 'c']);
    assert(params._.length === 0);
    assert(params.flagCount === 1);
    assert(params.m.length === 3);
    assert(params.m[0] === 'a');
    assert(params.m[1] === 'b');
    assert(params.m[2] === 'c');

    params = parse(['--multi=foo', '--multi=bar']);
    assert(params._.length === 0);
    assert(params.flagCount === 1);
    assert(params.multi.length === 2);
    assert(params.multi[0] === 'foo');
    assert(params.multi[1] === 'bar');

    // require('minimist')(['-m', '--m=foo', '-mmm=bar', '-m', 'baz', '-m', '--no-m'])
    // { _: [], m: [ 'foo', 'bar', 'baz', true, false ] }
    params = parse(['-m', '--m=foo', '-mmm=bar', '-m', 'baz', '-m', '--no-m']);
    assert(params._.length === 0);
    assert(params.flagCount === 1);
    assert(params.m.length === 7);
    assert(params.m[0] === 'foo');
    assert(params.m[1] === 'bar');
    assert(params.m[2] === 'bar');
    assert(params.m[3] === 'bar');
    assert(params.m[4] === 'baz');
    assert(params.m[5] === true);
    assert(params.m[6] === false);
  });

  // @see github.com/substack/minimist/tree/1.2.0/test/parse.js#L5-L9
  it('if the flag has the "--no-" prefix, should set false as value', () => {
    params = parse(['faith', '--no-more', 'is', '--awesome']);
    assert(params._.length === 2);
    assert(params.flagCount === 2);
    assert(params._[0] === 'faith');
    assert(params.more === false);
    assert(params._[1] === 'is');
    assert(params.awesome === true);

    // require('minimist')(['--more', '--no-more', '--no-more=faith'])
    // -> { _: [], more: false, 'no-more': 'faith' }
    params = parse(['--more', '--no-more', '--no-more=faith']);
    assert(params._.length === 0);
    assert(params.flagCount === 2);
    assert(params.more === false);
    assert(params['no-more'] === 'faith');
  });

  // @see github.com/substack/minimist/blob/1.2.0/test/parse.js#L69-L80
  it('should use the newline as a value', () => {
    params = parse(['-s', 'X\nX']);
    assert(params._.length === 0);
    assert(params.flagCount === 1);
    assert(params.s === 'X\nX');

    params = parse(['--s=X\nX']);
    assert(params._.length === 0);
    assert(params.flagCount === 1);
    assert(params.s === 'X\nX');
  });

  // @see github.com/substack/minimist/blob/1.2.0/test/dash.js#L4-L24
  it('should be added to the "_". unless flag', () => {
    params = parse(['foo']);
    assert(params._.length === 1);
    assert(params.flagCount === 0);
    assert(params._[0] === 'foo');

    params = parse(['--', '--foo']);
    assert(params._.length === 1);
    assert(params.flagCount === 0);
    assert(params._[0] === '--foo');

    params = parse(['foo', '--', '--bar']);
    assert(params._.length === 2);
    assert(params.flagCount === 0);
    assert(params._[0] === 'foo');
    assert(params._[1] === '--bar');

    params = parse(['foo', '--', '--bar', '--', 'baz']);
    assert(params._.length === 4);
    assert(params.flagCount === 0);
    assert(params._[0] === 'foo');
    assert(params._[1] === '--bar');
    assert(params._[2] === '--');
    assert(params._[3] === 'baz');
  });

  // @see github.com/substack/minimist/tree/1.2.0/test/num.js
  it('numeric strings should be normalized', () => {
    params = parse([
      '-x', '1234',
      '-y', '5.67',
      '-z', '1e7',
      '-w', '10f',
      '--hex', '0xdeadbeef',
      '789',
    ]);

    assert(params._.length === 1);
    assert(params.flagCount === 5);
    assert(params.x === 1234);
    assert(params.y === 5.67);
    assert(params.z === 1e7);
    assert(params.w === '10f');
    assert(params.hex === 0xdeadbeef);
    assert(params._[0] === 789);
  });

  // @see github.com/substack/minimist/tree/1.2.0/test/whitespace.js
  it('whitespace should be whitespace', () => {
    params = parse(['-x', '\t']);
    assert(params._.length === 0);
    assert(params.flagCount === 1);
    assert(params.x, '\t');
  });
});
