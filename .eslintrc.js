module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: 'standard-with-typescript',
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: { // 具体的规则配置
    indent: ['warn', 2], // 代码缩进2，不是2的话报警告
    quotes: ['warn', 'single'], // 字符串使用单引号，不是单引号报警告
    eqeqeq: ['error', 'always'], // 比较用===和!==，不是的话报错误（但是--fix只能替换typeof的比较）
    "@typescript-eslint/strict-boolean-expressions": "off"
  }
}
