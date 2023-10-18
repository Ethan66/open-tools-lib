import { readFileSync, writeFileSync } from 'fs'

const file = {
  input: './package.json',
  outDir: './package.json'
}

let content = readFileSync(file.input, 'utf-8')

// 修改依赖包版本
content = content.replace(/(?<="devDependencies":\s\{)([^}]+)/, (str, result) => {
  result = result.replace(/"(.+?)": "[^"]+"/g, (s, name) => {
    return `"${name}": "workspace:*"`
  })
  return result
})
writeFileSync(file.outDir, content)
console.warn('\n' + 'prefer-storage package.json还原成功' + '\n')
