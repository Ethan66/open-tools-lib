import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import del from 'rollup-plugin-delete'
import { terser } from 'rollup-plugin-terser'

const isDevelopment = process.argv.includes('--development')

let input = 'src/core/index.ts'

const plugins = []

if (isDevelopment) {
  input = 'test/index.ts'
  plugins.push(
    serve({
      open: false,
      contentBase: './',
      port: 5000
    }),
    livereload('dist')
  )
}

export default {
  input,
  output: [{
    file: 'dist/index.js',
    format: 'umd',
    name: 'PreStorage',
    plugins: [terser()]
  }, {
    file: 'dist/index.cm.js',
    format: 'cjs'
  },
  {
    file: 'dist/index.esm.js',
    format: 'esm',
    sourcemap: true
  }],
  declaration: true,
  plugins: [
    del({ targets: 'dist/*' }),
    ...plugins,
    resolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json'
    })
  ]
}
