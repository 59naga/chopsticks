// dependencies
import assert from 'power-assert';

// target
import Flag from '../src/Flag';
import * as utils from '../src/utils';

// specs
describe('Chopsticks::parseArg', () => {
  describe('no-flag', () => {
    it('unless flag, should not return the flag', () => {
      assert.deepStrictEqual(
        utils.parseArg('-', 'foo'),
        {
          flags: [],
          validNext: false,
        },
      );
      assert.deepStrictEqual(
        utils.parseArg('--', 'foo'),
        {
          flags: [],
          validNext: false,
        },
      );

      assert.deepStrictEqual(
        utils.parseArg('foo', 'bar'),
        {
          flags: [],
          validNext: false,
        },
      );
    });
  });

  describe('short', () => {
    it('if string exists in next to the hyphen, each character should be a flag', () => {
      assert.deepStrictEqual(
        utils.parseArg('-foo'),
        {
          flags: [
            new Flag('short', 'f'),
            new Flag('short', 'o'),
            new Flag('short', 'o'),
          ],
          validNext: false,
        },
      );

      assert.deepStrictEqual(
        utils.parseArg('-foo'),
        {
          flags: [
            new Flag('short', 'f'),
            new Flag('short', 'o'),
            new Flag('short', 'o'),
          ],
          validNext: false,
        },
      );
      assert.deepStrictEqual(
        utils.parseArg('-👺🍣🎴'),
        {
          flags: [
            new Flag('short', '👺'),
            new Flag('short', '🍣'),
            new Flag('short', '🎴'),
          ],
          validNext: false,
        },
      );
    });

    it("if the next argument isn't a flag, it should be used as the value of the last flag", () => {
      assert.deepStrictEqual(
        utils.parseArg('-foo', 'bar'),
        {
          flags: [
            new Flag('short', 'f'),
            new Flag('short', 'o'),
            new Flag('short', 'o', 'bar'),
          ],
          validNext: true,
        },
      );
    });

    it('if including the "=" to the flag name, it should be used as a value', () => {
      assert.deepStrictEqual(
        utils.parseArg('-i=foo', 'foo'),
        {
          flags: [
            new Flag('short', 'i', 'foo'),
          ],
          validNext: false,
        },
      );

      assert.deepStrictEqual(
        utils.parseArg('--=foo', 'foo'),
        {
          flags: [],
          validNext: false,
        },
      );

      // minimist@1.2.0 was broken
      // require('minimist')(['-foo=foo']) -> { _: [], f: 'foo' }
      assert.deepStrictEqual(
        utils.parseArg('-foo=foo', 'foo'),
        {
          flags: [
            new Flag('short', 'f', 'foo'),
            new Flag('short', 'o', 'foo'),
            new Flag('short', 'o', 'foo'),
          ],
          validNext: false,
        },
      );
    });

    // @see https://github.com/substack/minimist/blob/1.2.0/test/short.js#L4-L11
    it('if the numbers are after the flag name, it should be used as a value', () => {
      assert.deepStrictEqual(
        utils.parseArg('-n123', 'foo'),
        {
          flags: [
            new Flag('short', 'n', '123'),
          ],
          validNext: false,
        },
      );

      // minimist-v1.2.0 was broken
      // require('minimist')((['-n0xdeadbeef']))
      // -> { '0': true, _: [],n: true,x: true,d: true,e: true,a: true,b: true,f: true }
      assert.deepStrictEqual(
        utils.parseArg('-foo0xdeadbeef', 'foo'),
        {
          flags: [
            new Flag('short', 'f'),
            new Flag('short', 'o'),
            new Flag('short', 'o', '0xdeadbeef'),
          ],
          validNext: false,
        },
      );

      assert.deepStrictEqual(
        utils.parseArg('-0123', 'foo'),
        {
          flags: [
            new Flag('short', '0'),
            new Flag('short', '1'),
            new Flag('short', '2'),
            new Flag('short', '3', 'foo'),
          ],
          validNext: true,
        },
      );
    });

    it('if including a slash to the flag name, it should be used as a value', () => {
      assert.deepStrictEqual(
        utils.parseArg('-i/foo/bar/', 'foo'),
        {
          flags: [
            new Flag('short', 'i', '/foo/bar/'),
          ],
          validNext: false,
        },
      );

      assert.deepStrictEqual(
        utils.parseArg('-/foo/', 'foo'),
        {
          flags: [
            new Flag('short', '/'),
            new Flag('short', 'f'),
            new Flag('short', 'o'),
            new Flag('short', 'o'),
            new Flag('short', '/', 'foo'),
          ],
          validNext: true,
        },
      );
    });
  });

  describe('long', () => {
    it('if hyphens are two, it should be treated as a single flag', () => {
      assert.deepStrictEqual(
        utils.parseArg('--f'),
        {
          flags: [
            new Flag('long', 'f'),
          ],
          validNext: false,
        },
      );

      assert.deepStrictEqual(
        utils.parseArg('--foo'),
        {
          flags: [
            new Flag('long', 'foo'),
          ],
          validNext: false,
        },
      );
    });

    it('if flag have no value and next argument is not flag, should set next argument as value', () => {
      assert.deepStrictEqual(
        utils.parseArg('--foo', 'bar'),
        {
          flags: [
            new Flag('long', 'foo', 'bar'),
          ],
          validNext: true,
        },
      );

      assert.deepStrictEqual(
        utils.parseArg('--foo', '-bar'),
        {
          flags: [
            new Flag('long', 'foo'),
          ],
          validNext: false,
        },
      );

      assert.deepStrictEqual(
        utils.parseArg('--foo', 1234),
        {
          flags: [
            new Flag('long', 'foo', 1234),
          ],
          validNext: true,
        },
      );
    });

    it('if the flag name begins with "--no-", the value should be false', () => {
      assert.deepStrictEqual(
        utils.parseArg('--no-foo'),
        {
          flags: [
            new Flag('long', 'foo', false),
          ],
          validNext: false,
        },
      );
    });

    // minimist@1.2.0
    // require('minimist')(['--no-foo=false', 'bar'])
    // -> { _: [ 'bar' ], 'no-foo': 'false' }
    it('if including the "=" to the flag name, should ignore the "--no-"', () => {
      assert.deepStrictEqual(
        utils.parseArg('--no-foo=false'),
        {
          flags: [
            new Flag('long', 'no-foo', 'false'),
          ],
          validNext: false,
        },
      );
    });
  });

  describe('dash', () => {
    // @see https://github.com/substack/minimist/blob/1.2.0/test/dash.js#L6
    it('"-" after the short flag, it should be handled as a value', () => {
      assert.deepStrictEqual(
        utils.parseArg('-n', '-'),
        {
          flags: [
            new Flag('short', 'n', '-'),
          ],
          validNext: true,
        },
      );
      assert.deepStrictEqual(
        utils.parseArg('-'),
        {
          flags: [],
          validNext: false,
        },
      );
      assert.deepStrictEqual(
        utils.parseArg('-f-'),
        {
          flags: [
            new Flag('short', 'f', '-'),
          ],
          validNext: false,
        },
      );
      assert.deepStrictEqual(
        utils.parseArg('-b', '-', { booleans: ['b'] }),
        {
          flags: [
            new Flag('short', 'b'),
          ],
          validNext: false,
        },
      );
      assert.deepStrictEqual(
        utils.parseArg('-s', '-', { strings: ['s'] }),
        {
          flags: [
            new Flag('short', 's', '-'),
          ],
          validNext: true,
        },
      );
    });
  });

  describe('options', () => {
    describe('use booleans option', () => {
      it('if the booleans is array, should be handle specified flag as booleans', () => {
        const options = {
          booleans: ['z'],
        };
        assert.deepStrictEqual(
          utils.parseArg('-z', 'one', options),
          {
            flags: [
              new Flag('short', 'z'),
            ],
            validNext: false,
          },
        );

        assert.deepStrictEqual(
          utils.parseArg('-z', 'true', options),
          {
            flags: [
              new Flag('short', 'z', 'true'),
            ],
            validNext: true,
          },
        );
      });
    });
    describe('use all option(aka boolean is true)', () => {
      it('if the all is "boolean", `--long` should be handle only as booleans', () => {
        const options = {
          all: 'boolean',
        };
        assert.deepStrictEqual(
          utils.parseArg('--z', 'one', options),
          {
            flags: [
              new Flag('long', 'z'),
            ],
            validNext: false,
          },
        );
      });
    });

    // @see https://github.com/substack/minimist/blob/1.2.0/test/bool.js#L39
    describe('use aliases option', () => {
      it('if specify booleans via aliases, should be handle as bolean', () => {
        const options = {
          aliases: { h: 'herp' },
          booleans: ['herp'],
        };
        assert.deepStrictEqual(
          utils.parseArg('-h', 'derp', options),
          {
            flags: [
              new Flag('short', 'h'),
            ],
            validNext: false,
          },
        );
      });
    });
  });
});
