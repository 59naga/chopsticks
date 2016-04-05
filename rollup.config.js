import npm from 'rollup-plugin-npm';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

export default {
  entry: 'src/index.js',
  dest: 'lib/index.js',
  sourceMap: true,
  format: 'umd',
  moduleName: 'chopsticks',
  plugins: [
    npm({ jsnext: true }),
    commonjs(),
    babel(),
    // uglify(),
  ],
};
