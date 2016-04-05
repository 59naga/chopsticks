// dependencies
import assert from 'power-assert';

// target
import parse from '../../src';

// environment
let params;

// specs
describe('use boolean option', () => {
  // @see github.com/substack/minimist/blob/1.2.0/test/bool.js#L4-L38
  it('if the flag is boolean, it should be initialized with false', () => {
    // minimist-v1.2.0 -> { _: [ 'one', 'two', 'three' ], x: true, y: false, z: true }
    params = parse(['-x', '-z', 'one', 'two', 'three'], {
      boolean: ['x', 'y', 'z'],
    });

    assert(params._.length === 3);
    assert(params.flagCount === 3);
    assert(params.x === true);
    assert(params.y === false);
    assert(params.z === true);
    assert(params._[0] === 'one');
    assert(params._[1] === 'two');
    assert(params._[2] === 'three');
  });

  // @see github.com/substack/minimist/blob/1.2.0/test/bool.js#L126-L142
  it('unless the flag is boolean, it should handle the "true" and "false" as a string', () => {
    params = parse(['--foo', '--bar=true'], {
      boolean: 'foo',
    });
    assert(params._.length === 0);
    assert(params.flagCount === 2);
    assert(params.foo === true);
    assert(params.bar === 'true');

    params = parse(['--foo', '--bar=false'], {
      boolean: 'foo',
    });

    assert(params._.length === 0);
    assert(params.flagCount === 2);
    assert(params.foo === true);
    assert(params.bar === 'false');
  });
});
