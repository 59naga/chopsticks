// @see github.com/substack/minimist/tree/1.2.0/test/short.js
import assert from 'power-assert';

// target
import parse from '../../src';

// environment
let params;

// specs
describe('parse(short)', () => {
  it('by character it should be set as a true', () => {
    params = parse(['-b']);
    assert(params._.length === 0);
    assert(params.flagCount === 1);
    assert(params.b === true);

    params = parse(['-cats']);
    assert(params._.length === 0);
    assert(params.flagCount === 4);
    assert(params.c === true);
    assert(params.a === true);
    assert(params.t === true);
    assert(params.s === true);

    // the following doesn't work in minimist-v1.2.0 ...
    // require('minimist')(['-😸🐱😹🐾']) -> { _: [], '�': '�🐱😹🐾' }
    params = parse(['-😸🐱😹🐾']);
    assert(params._.length === 0);
    assert(params.flagCount === 4);
    assert(params['😸'] === true);
    assert(params['🐱'] === true);
    assert(params['😹'] === true);
    assert(params['🐾'] === true);
  });

  it('if after the character is a number, to be used as the value', () => {
    params = parse(['-n123']);
    assert(params._.length === 0);
    assert(params.flagCount === 1);
    assert(params.n === 123);

    params = parse(['-n1e7']);
    assert(params._.length === 0);
    assert(params.flagCount === 1);
    assert(params.n === 1e7);

    // the following killed the 0xdeadbeef in minimist-v1.2.0 ...
    // require('minimist')((['-n0xdeadbeef']))
    // -> { '0': true, _: [],n: true,x: true,d: true,e: true,a: true,b: true,f: true }
    // deadbeef is dead!
    params = parse(['-n0xdeadbeef']);
    assert(params._.length === 0);
    assert(params.flagCount === 1);
    assert(params.n === 0xdeadbeef); // great! deadbeef is alive!!

    params = parse(['-123', '456']);
    assert(params._.length === 0);
    assert(params.flagCount === 3);
    assert(params[1] === true);
    assert(params[2] === true);
    assert(params[3] === 456);

    // the following doesn't work in minimist-v1.2.0 ...
    // require('minimist')(['-🍣59798', '456']) -> { _: [ 456 ], '�': '�59798' }
    params = parse(['-🍣59798', '456']);
    assert(params._.length === 1);
    assert(params.flagCount === 1);
    assert(params['🍣'] === 59798);
    assert(params._[0] === 456);

    params = parse(['-🍣59👺798', '456']);
    assert(params._.length === 1);
    assert(params.flagCount === 4);
    assert(params['🍣'] === true);
    assert(params[5] === true);
    assert(params[9] === true);
    assert(params['👺'] === 798);
    assert(params._[0] === 456);
  });

  it('should set the value as the previous flag unless the next argument is a flag', () => {
    params = parse(['-cats', 'meow']);
    assert(params._.length === 0);
    assert(params.flagCount === 4);
    assert(params.c === true);
    assert(params.a === true);
    assert(params.t === true);
    assert(params.s === 'meow');

    params = parse(['-h', 'localhost']);
    assert(params._.length === 0);
    assert(params.flagCount === 1);
    assert(params.h === 'localhost');

    params = parse(['-h', 'localhost', '-p', '555']);
    assert(params._.length === 0);
    assert(params.flagCount === 2);
    assert(params.h === 'localhost');
    assert(params.p === 555);

    // the following doesn't work in minimist-v1.2.0 ...
    // require('minimist')(['-h', 'localhost', '-f🍣p', '555', 'script.js', '-👹', '--'])
    // -> { _: [ 555, 'script.js' ],h: 'localhost', f: '🍣p', '�': true, '�': true }
    params = parse(['-h', 'localhost', '-f🍣p', '555', 'script.js', '-👹', '--']);
    assert(params._.length === 1);
    assert(params.flagCount === 5);
    assert(params.h === 'localhost');
    assert(params.f === true);
    assert(params['🍣'] === true);
    assert(params.p === 555);
    assert(params['👹'] === true);
    assert(params._[0] === 'script.js');
  });

  it('if there is a value after the "=", it should be set', () => {
    params = parse(['-a=123']);
    assert(params._.length === 0);
    assert(params.flagCount === 1);
    assert(params.a === 123);

    params = parse(['-a=b', '-c=0xdeadbeef', '0xdeadbeef']);
    assert(params._.length === 1);
    assert(params.flagCount === 2);
    assert(params.a === 'b');
    assert(params.c === 0xdeadbeef);
    assert(params._[0] === 0xdeadbeef);

    // the following doesn't work in minimist-v1.2.0 ...
    // require('minimist')(['-abc=b','c']) // { _: [ 'c' ], a: 'b' }
    params = parse(['-abc=123']);
    assert(params._.length === 0);
    assert(params.flagCount === 3);
    assert(params.a === 123);
    assert(params.b === 123);
    assert(params.c === 123);

    params = parse(['-ab=123', 'c']);
    assert(params._.length === 1);
    assert(params.flagCount === 2);
    assert(params.a === 123);
    assert(params.b === 123);
    assert(params._[0] === 'c');
  });
});
