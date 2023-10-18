import { readFileSync, writeFileSync } from 'fs'

const parentPackageContent = readFileSync('../../package.json', 'utf-8')
const packageVersions = JSON.parse(parentPackageContent.match(/"devDependencies":\s(\{([^}]+)\})/)[1])

const file = {
  input: './package.json',
  outDir: './package.json'
}

let version = ''

let content = readFileSync(file.input, 'utf-8')
// 修改版本号
content = content.replace(/("version": ")(\d+\.\d+\.)(\d+)/, (str, a, b, c) => {
  version = b + String(Number(c) + 1)
  return a + version
})
writeFileSync(file.input, content)

// 修改依赖包版本
content = content.replace(/(?<="devDependencies":\s\{)([^}]+)/, (str, result) => {
  result = result.replace(/"(.+)": "workspace:\*"/g, (s, name) => {
    return `"${name}": "${packageVersions[name]}"`
  })
  return result
})
writeFileSync(file.outDir, content)
console.warn('\n' + `prefer-storage ${version} 版本打包成功` + '\n')
