// @see github.com/substack/minimist/blob/1.2.0/test/dash.js
import assert from 'assert';

// target
import parse from '../../src';

// environment
let params;

// specs
describe('use dash(--) option', () => {
  it('should be able to use the "--". for compatibility with minimist', () => {
    params = parse(['foo'], { '--': true });
    assert(params._.length === 1);
    assert(params.flagCount === 0);
    assert(params['--'].length === 0);
    assert(params.dash === undefined);
    assert(params._[0] === 'foo');
  });

  it('should be add to subsequent argv to -- in params.dash if opts.dash is true', () => {
    params = parse(['foo'], { dash: true });
    assert(params._.length === 1);
    assert(params.flagCount === 0);
    assert(params.dash.length === 0);
    assert(params._[0] === 'foo');

    params = parse(['--', '--foo'], { dash: true });
    assert(params._.length === 0);
    assert(params.flagCount === 0);
    assert(params.dash.length === 1);
    assert(params.dash[0] === '--foo');

    params = parse(['foo', '--', '--bar'], { dash: true });
    assert(params._.length === 1);
    assert(params.flagCount === 0);
    assert(params.dash.length === 1);
    assert(params._[0] === 'foo');
    assert(params.dash[0] === '--bar');

    params = parse(['foo', '--', '--bar', '--', 'baz'], { dash: true });
    assert(params._.length === 1);
    assert(params.flagCount === 0);
    assert(params.dash.length === 3);
    assert(params._[0] === 'foo');
    assert(params.dash[0] === '--bar');
    assert(params.dash[1] === '--');
    assert(params.dash[2] === 'baz');
  });
});
