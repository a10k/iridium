import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import css from 'rollup-plugin-import-css';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'umd',
    name: 'IridiumApp',
  },
  plugins: [
    nodeResolve({
      browser: true,
    }),
    commonjs(),
    css(),
    terser(),
  ],
};
