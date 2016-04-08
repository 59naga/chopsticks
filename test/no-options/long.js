// @see github.com/substack/minimist/tree/1.2.0/test/long.js
import assert from 'power-assert';

// target
import parse from '../../src';

// environment
let params;

// specs
describe('parse(long)', () => {
  it('should true is set as one of the flag', () => {
    params = parse(['--foo']);
    assert(params._.length === 0);
    assert(params.flagCount === 1);
    assert(params.foo === true);

    params = parse(['--foo', '--bar']);
    assert(params._.length === 0);
    assert(params.flagCount === 2);
    assert(params.foo === true);
    assert(params.bar === true);

    params = parse(['--foo', '--bar', '--👺👹']);
    assert(params._.length === 0);
    assert(params.flagCount === 3);
    assert(params.foo === true);
    assert(params.bar === true);
    assert(params['👺👹'] === true);
  });

  it('if there is a value after the "=", it should be set', () => {
    params = parse(['--foo=bar']);
    assert(params._.length === 0);
    assert(params.flagCount === 1);
    assert(params.foo === 'bar');

    params = parse(['--foo=bar', 'baz']);
    assert(params._.length === 1);
    assert(params.flagCount === 1);
    assert(params.foo === 'bar');
    assert(params._[0] === 'baz');

    params = parse(['--foo=bar', '--foo']);
    assert(params._.length === 0);
    assert(params.flagCount === 1);
    assert(params.foo[0] === 'bar');
    assert(params.foo[1] === true);

    params = parse(['--foo=bar', 'baz', '👺', '--beep=boop', '--']);
    assert(params._.length === 2);
    assert(params.flagCount === 2);
    assert(params.foo === 'bar');
    assert(params._[0] === 'baz');
    assert(params._[1] === '👺');
    assert(params.beep === 'boop');

    params = parse(['--👺=🍣', '🎴', '👿', '--👺=🍣', '--', '--👺=🍣']);
    assert(params._.length === 3);
    assert(params.flagCount === 1);
    assert(params['👺'].length === 2);
    assert(params['👺'][0] === '🍣');
    assert(params['👺'][1] === '🍣');
    assert(params._[0] === '🎴');
    assert(params._[1] === '👿');
    assert(params._[2] === '--👺=🍣');
  });

  // @see github.com/substack/minimist/blob/1.2.0/test/parse.js#L180-L197
  it('if the flag name is a dot, it should be handled as a key of the object', () => {
    params = parse([
      '--foo.bar', '3',
      '--foo.baz', '4',
      '--foo.quux.quibble', '5',
      '--foo.quux.o_O',
      '--beep.boop',
    ]);

    assert(params._.length === 0);
    assert(params.flagCount === 2);
    assert(params.foo.bar === 3);
    assert(params.foo.baz === 4);
    assert(params.foo.quux.quibble === 5);
    assert(params.foo.quux.o_O === true);
    assert(params.beep.boop === true);
  });

  // --./path/to/file -> {'./path/to/file': true}
  it('if the flag name begins with a dot, it should be handled as a flag name', () => {
    params = parse([
      '--./path/to/one.js', 'value',
      '--./path/to/tow', 'bar',
      '--i/path/to/url',
      '--.travis.yml',
    ]);

    assert(params._.length === 0);
    assert(params.flagCount === 4);
    assert(params['./path/to/one.js'] === 'value');
    assert(params['./path/to/tow'] === 'bar');
    assert(params['i/path/to/url'] === true);
    assert(params['.travis.yml'] === true);
  });
});
