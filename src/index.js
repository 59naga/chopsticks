import Chopsticks from './Chopsticks';

/*
* @param {string|array} args - a process.argv.slice(2)
* @param {object} [options={}] - an add extra behavior
* @param {object} [options.alias] - key>value({string|string[]})
* @param {object} [options.default] - key>value({any})
* @param {string|string[]} [options.string] - no description yet
* @param {boolean|string|string[]} [options.boolean] - no description yet
* @param {boolean|string|string[]|function} [options.greedy] - no description yet
* @param {boolean} [options.stopEarly] - no description yet
* @param {boolean|function} [options.--] - no description yet
* @param {boolean|function} [options.dash] - no description yet
* @param {boolean|function} [options.unknown] - no description yet
* @param {boolean|function} [options.comma] - no description yet
* @returns {object} params - a parsed properties
*/
export default (args, options = {}) => new Chopsticks(options).parse(args);
