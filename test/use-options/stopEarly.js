// @see github.com/substack/minimist/blob/1.2.0/test/stop_early.js
import assert from 'power-assert';

// target
import parse from '../../src';

// environment
let params;

// spec
describe('use stopEarly option', () => {
  it('should stops parsing on the first non-option when stopEarly is set', () => {
    params = parse(['--foo', 'bar', 'baz', '--beep'], {
      stopEarly: true,
    });

    assert(params._.length === 2);
    assert(params.flagCount === 1);
    assert(params.foo === 'bar');
    assert(params._[0] === 'baz');
    assert(params._[1] === '--beep');

    // require('minimist')(['-foo', 'bar', 'baz', '--beep'], {stopEarly: true})
    // -> { _: [ 'baz', '--beep' ], f: true, o: 'bar' }
    params = parse(['-foo', 'bar', 'baz', '--beep'], {
      stopEarly: true,
    });

    assert(params._.length === 2);
    assert(params.flagCount === 2);
    assert(params.f === true);
    assert(params.o === 'bar');
    assert(params._[0] === 'baz');
    assert(params._[1] === '--beep');
  });
});
