// @see github.com/substack/minimist/blob/1.2.0/test/parse.js#L159-L178
import assert from 'power-assert';
import { parse as shellParse } from 'shell-quote';

// target
import parse from '../../src';

// specs
describe('use sentence option', () => {
  it('without sentence, comma should not be parsed', () => {
    assert.deepStrictEqual(
      parse(shellParse('-f cover, lint.')),
      {
        flagCount: 1,
        f: 'cover,',
        _: ['lint.'],
      },
    );
  });

  it('with sentence, comma should be parsed', () => {
    assert.deepStrictEqual(
      parse(shellParse('-f cover, lint.'), {
        sentence: true,
      }),
      {
        flagCount: 1,
        f: true,
        sentence: [
          ['cover', 'lint'],
        ],
        _: [],
      },
    );
  });

  it('should define comma nearby argument instead of "sentence". and ignore the last period of the argument', () => {
    assert.deepStrictEqual(
      parse(shellParse("cover, lint, report. 'foo bar', baz. huh -- huh"), {
        sentence: true,
      }),
      {
        flagCount: 0,
        sentence: [
          ['cover', 'lint', 'report'],
          ['foo bar', 'baz'],
        ],
        _: [
          'huh',
          'huh',
        ],
      },
    );
  });
});
