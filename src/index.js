// self dependencies
import Chopsticks from './Chopsticks';

/*
* @module parse
* @param {string|array} args - a process.argv.slice(2)
* @param {object} [options={}] - an add extra behavior
* @param {string[]{}|string{}} [options.alias] - specifies the alias of the flag
* @param {object} [options.default] - define the initial value when the flag is undefined
* @param {string|string[]} [options.string] - the value of the flag is a string
* @param {boolean|string|string[]} [options.boolean] - the value of the flag is a boolean
* @param {boolean} [options.stopEarly] - if true, first flag parsing only
* @param {boolean|function} [options.--] - "--" subsequent args are define in "--".
* @param {boolean|function} [options.dash] - "--" subsequent args are define in dash.
* @param {boolean|function} [options.unknown] - to handle an undefined argument.
* @param {boolean|function} [options.comma] - if argument is separated by a comma, to the array
* @param {string|string[]} [options.array] - argument subsequent to flag is the value
* @returns {object} argv - a parsed properties
* @see https://github.com/substack/minimist/blob/1.2.0/#readme
*/
export default (args, options = {}) => new Chopsticks(options).parse(args);
