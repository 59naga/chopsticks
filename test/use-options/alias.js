// @see github.com/substack/minimist/blob/1.2.0/test/parse.js#L159-L178
import assert from 'assert';

// target
import parse from '../../src';

// environment
let params;

// specs
describe('use alias option', () => {
  it('if it exists alias, should duplicate the flag value', () => {
    params = parse(
      ['--foo'],
      {
        alias: {
          foo: 'bar',
        },
      }
    );
    assert(params._.length === 0);
    assert(params.flagCount === 2);
    assert(params.foo === true);
    assert(params.bar === true);

    params = parse(
      ['--baz.beep=1', '--foo'],
      {
        alias: {
          foo: ['bar', 'baz.beep'],
        },
      }
    );
    assert(params._.length === 0);
    assert(params.flagCount === 3);
    assert(params.foo === params.bar);
    assert(params.bar === params.baz.beep);
    assert(params.baz.beep[0] === 1);
    assert(params.baz.beep[1] === true);
  });
});
