import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const inputFile = 'src/analytical-index.ts';

export default [
  {
    input: inputFile,
    output: {
      file: 'dist/analytical-index.umd.js',
      format: 'umd',
      name: 'AnalyticalIndex',
      globals: {
        'markdown-it': 'markdownit',
      },
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        target: 'ES2020',
      }),
    ],
    external: ['markdown-it'],
  },

  {
    input: inputFile,
    output: {
      file: 'dist/analytical-index.esm.js',
      format: 'es',
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
      }),
    ],
    external: ['markdown-it'],
  },
];
