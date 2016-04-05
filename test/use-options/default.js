// dependencies
import assert from 'power-assert';

// target
import parse from '../../src';

// environment
let params;

// specs
describe('use default option', () => {
  // @see github.com/substack/minimist/blob/1.2.0/test/dotted.js#L18-L22
  it('should set default value unless assign a value', () => {
    params = parse(
      [''],
      {
        default: {
          foo: 1,
        },
      },
    );
    assert(params._.length === 0);
    assert(params.flagCount === 1);
    assert(params.foo === 1);

    params = parse(
      ['--foo=1'],
      {
        default: {
          foo: 1,
        },
      },
    );
    assert(params._.length === 0);
    assert(params.flagCount === 1);
    assert(params.foo === 1);

    params = parse(
      ['--foo=bar', '--foo=bar'],
      {
        default: {
          foo: 'bar',
        },
      },
    );
    assert(params._.length === 0);
    assert(params.flagCount === 1);
    assert(params.foo.length === 2);

    params = parse(
      ['--no-foo'],
      {
        default: {
          foo: true,
          bar: true,
          baz: ['beep', 'boop', { kaboom: 1 }],
        },
      },
    );

    assert(params._.length === 0);
    assert(params.flagCount === 3);
    assert(params.foo === false);
    assert(params.bar === true);
    assert(params.baz.length === 3);
    assert(params.baz[0] === 'beep');
    assert(params.baz[1] === 'boop');
    assert(params.baz[2].kaboom === 1);
  });

  it('if the default flag name using dot, it should be handled as a key of the object', () => {
    params = parse(
      [''],
      {
        default: {
          'a.b': 59798,
        },
      },
    );
    assert(params._.length === 0);
    assert(params.flagCount === 1);
    assert(params.a.b === 59798);

    params = parse(
      ['--a.b', '59798'],
      {
        default: {
          'a.b': 11,
        },
      },
    );

    assert(params._.length === 0);
    assert(params.flagCount === 1);
    assert(params.a.b === 59798);

    params = parse(
      ['--a.b', '59', '--a.b=798', '--', '--a.b=59798'],
      {
        default: {
          'a.b': 11,
          'a.c': 33,
          'a[0]': null,
        },
      },
    );

    assert(params._.length === 1);
    assert(params.flagCount === 1);
    assert(params.a.b.length === 2);
    assert(params.a.b[0] === 59);
    assert(params.a.b[1] === 798);
    assert(params.a[0] === null);
    assert(params._[0] === '--a.b=59798');
  });
});
