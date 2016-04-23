// @see github.com/substack/minimist/blob/1.2.0/test/parse.js#L82-L145
import assert from 'assert';

// target
import parse from '../../src';

// environment
let params;

// specs
describe('use string option', () => {
  it('if the flag is string, it should always set the string', () => {
    params = parse(['--foo', '0001234'], { string: 'foo' });
    assert(params._.length === 0);
    assert(params.flagCount === 1);
    assert(params.foo === '0001234');

    params = parse(['--foo', '56'], { string: 'foo' });
    assert(params._.length === 0);
    assert(params.flagCount === 1);
    assert(params.foo === '56');

    params = parse(['--foo'], { string: 'foo' });
    assert(params._.length === 0);
    assert(params.flagCount === 1);
    assert(params.foo === '');
  });
});
