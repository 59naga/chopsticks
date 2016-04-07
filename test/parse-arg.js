// dependencies
import assert from 'power-assert';

// target
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
            { type: 'short', origin: 'f', alias: [], name: 'f', value: undefined },
            { type: 'short', origin: 'o', alias: [], name: 'o', value: undefined },
            { type: 'short', origin: 'o', alias: [], name: 'o', value: undefined },
          ],
          validNext: false,
        },
      );

      assert.deepStrictEqual(
        utils.parseArg('-foo'),
        {
          flags: [
            { type: 'short', origin: 'f', alias: [], name: 'f', value: undefined },
            { type: 'short', origin: 'o', alias: [], name: 'o', value: undefined },
            { type: 'short', origin: 'o', alias: [], name: 'o', value: undefined },
          ],
          validNext: false,
        },
      );
      assert.deepStrictEqual(
        utils.parseArg('-👺🍣🎴'),
        {
          flags: [
            { type: 'short', origin: '👺', alias: [], name: '👺', value: undefined },
            { type: 'short', origin: '🍣', alias: [], name: '🍣', value: undefined },
            { type: 'short', origin: '🎴', alias: [], name: '🎴', value: undefined },
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
            { type: 'short', origin: 'f', alias: [], name: 'f', value: undefined },
            { type: 'short', origin: 'o', alias: [], name: 'o', value: undefined },
            { type: 'short', origin: 'o', alias: [], name: 'o', value: 'bar' },
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
            { type: 'short', origin: 'i', alias: [], name: 'i', value: 'foo' },
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
            { type: 'short', origin: 'f', alias: [], name: 'f', value: 'foo' },
            { type: 'short', origin: 'o', alias: [], name: 'o', value: 'foo' },
            { type: 'short', origin: 'o', alias: [], name: 'o', value: 'foo' },
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
            { type: 'short', origin: 'n', alias: [], name: 'n', value: '123' },
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
            { type: 'short', origin: 'f', alias: [], name: 'f', value: undefined },
            { type: 'short', origin: 'o', alias: [], name: 'o', value: undefined },
            { type: 'short', origin: 'o', alias: [], name: 'o', value: '0xdeadbeef' },
          ],
          validNext: false,
        },
      );

      assert.deepStrictEqual(
        utils.parseArg('-0123', 'foo'),
        {
          flags: [
            { type: 'short', origin: '0', alias: [], name: '0', value: undefined },
            { type: 'short', origin: '1', alias: [], name: '1', value: undefined },
            { type: 'short', origin: '2', alias: [], name: '2', value: undefined },
            { type: 'short', origin: '3', alias: [], name: '3', value: 'foo' },
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
            { type: 'short', origin: 'i', alias: [], name: 'i', value: '/foo/bar/' },
          ],
          validNext: false,
        },
      );

      assert.deepStrictEqual(
        utils.parseArg('-/foo/', 'foo'),
        {
          flags: [
            { type: 'short', origin: '/', alias: [], name: '/', value: undefined },
            { type: 'short', origin: 'f', alias: [], name: 'f', value: undefined },
            { type: 'short', origin: 'o', alias: [], name: 'o', value: undefined },
            { type: 'short', origin: 'o', alias: [], name: 'o', value: undefined },
            { type: 'short', origin: '/', alias: [], name: '/', value: 'foo' },
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
            { type: 'long', origin: 'f', alias: [], name: 'f', value: undefined },
          ],
          validNext: false,
        },
      );

      assert.deepStrictEqual(
        utils.parseArg('--foo'),
        {
          flags: [
            { type: 'long', origin: 'foo', alias: [], name: 'foo', value: undefined },
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
            { type: 'long', origin: 'foo', alias: [], name: 'foo', value: 'bar' },
          ],
          validNext: true,
        },
      );

      assert.deepStrictEqual(
        utils.parseArg('--foo', '-bar'),
        {
          flags: [
            { type: 'long', origin: 'foo', alias: [], name: 'foo', value: undefined },
          ],
          validNext: false,
        },
      );

      assert.deepStrictEqual(
        utils.parseArg('--foo', 1234),
        {
          flags: [
            { type: 'long', origin: 'foo', alias: [], name: 'foo', value: 1234 },
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
            { type: 'long', origin: 'foo', alias: [], name: 'foo', value: false },
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
            { type: 'long', origin: 'no-foo', alias: [], name: 'no-foo', value: 'false' },
          ],
          validNext: false,
        },
      );
    });
  });

  describe('dash', () => {
    it('', () => {
      assert.deepStrictEqual(
        utils.parseArg('-n', '-'),
        {
          flags: [
            { type: 'short', origin: 'n', alias: [], name: 'n', value: '-' },
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
            { type: 'short', origin: 'f', alias: [], name: 'f', value: '-' },
          ],
          validNext: false,
        },
      );
      assert.deepStrictEqual(
        utils.parseArg('-b', '-', { booleans: ['b'] }),
        {
          flags: [
            { type: 'short', origin: 'b', alias: [], name: 'b', value: undefined },
          ],
          validNext: false,
        },
      );
      assert.deepStrictEqual(
        utils.parseArg('-s', '-', { strings: ['s'] }),
        {
          flags: [
            { type: 'short', origin: 's', alias: [], name: 's', value: '-' },
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
              { type: 'short', origin: 'z', alias: [], name: 'z', value: undefined },
            ],
            validNext: false,
          },
        );

        assert.deepStrictEqual(
          utils.parseArg('-z', 'true', options),
          {
            flags: [
              { type: 'short', origin: 'z', alias: [], name: 'z', value: 'true' },
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
              { type: 'long', origin: 'z', alias: [], name: 'z', value: undefined },
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
              { type: 'short', origin: 'h', alias: ['herp'], name: 'h', value: undefined },
            ],
            validNext: false,
          },
        );
      });
    });
  });
});
