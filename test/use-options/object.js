import assert from 'assert';
import { parse as shellParse } from 'shell-quote';

// target
import parse from '../../src';

// specs
describe('use object option', () => {
  it('if the flag is object, it should be initialized with {}', () => {
    assert.deepStrictEqual(
      parse(shellParse('-x foo'), { object: 'x' }),
      {
        _: [],
        flagCount: 1,
        x: {
          foo: true,
        },
      },
    );
  });

  it('flag values should be handled as a key of the object', () => {
    assert.deepStrictEqual(
      parse(shellParse('-x one --y.two foo -z=three.baz'), { object: ['x', 'y', 'z'] }),
      {
        _: [],
        flagCount: 3,
        x: {
          one: true,
        },
        y: {
          two: 'foo',
        },
        z: {
          three: {
            baz: true,
          },
        },
      },
    );
  });

  it('if object is true, should set flag to long flag(--) only. unless includes the "="', () => {
    assert.deepStrictEqual(
      parse(shellParse('foo --bar baz -x 59 --beep=boop --y 798 --'), { object: true }),
      {
        _: [
          'foo',
        ],
        bar: {
          baz: true,
        },
        x: 59,
        beep: 'boop',
        y: {
          798: true,
        },
        flagCount: 4,
      },
    );
  });
});
