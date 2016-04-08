import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';

if (process.env.NODE_ENV === undefined) {
  process.env.NODE_ENV = 'minimist';
}

export default {
  entry: 'src/index.js',
  dest: 'lib/index.js',
  sourceMap: true,
  format: 'umd',
  moduleName: 'chopsticks',
  plugins: [
    nodeResolve({ jsnext: true }),
    commonjs(),
    babel(),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    uglify(),
  ],
};
