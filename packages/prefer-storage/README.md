## localStorage/sessionStorage/indexDB二次封装

### 前言：
#### The problem of localStorage/sessionStorage（问题）：
1. key: 键名不唯一
2. value: 只能存储string类型
3. time: 没有过期时间
4. handle data: 不能对数据统一处理

#### How to solve（解决）：
1. key: key键白名单(先注册再使用，保证key唯一)
2. value: 支持多种数据类型存储（Number、String、Boolean、Array、Object、Date、Map、Set）
3. the other field of value: （time: 存储时间、pathname: 存储的pathname）
4. intercept：存取拦截器（如：取的时候过期：怎么办；存的时候，怎么上报服务器）

### Install：
```
npm i prefer-storage
```

### Configuration：
#### 配置options

```ts
// config.ts
const projectConfig = {
  name: 'projectName', // project id prefix
  expire: 24, // data time(h)
  beforeGet?: async (res: { v: any, _isDue: boolean, _key: string, _pathname: string }) => {
    return await new Promise((resolve, reject) => {
      if (res._isDue) reject(new Error(`数据已过期，请重新登录`))
      else { resolve(res.v) }
    })
  },
  beforeSet?: async (val: { value: any, type: string, time: string, pathname: string, key: string }) => {
    return await new Promise((resolve) => {
      const newVal = { ...val, aa: Math.random() }
      resolve(newVal)
    })
  },
  afterSet?: async (res: any) => {
    return await new Promise((resolve) => {
      // do anything 如：上报服务器
      resolve(res)
    })
  }
}
```

#### Create new object(创建对象)：
```ts
// config.ts
export const localStore = new Storage('local', { ...projectConfig, keys: ['aa', 'bb'] })
export const sessionStore = new Storage('session', { ...projectConfig, keys: ['aa', 'bb'] })
export const localIndexStore = new IndexDBStorage({ objectStoreName: 'borrow' }, { ...projectData, keys: ['aa', 'bb'] })
```

#### 
```ts
import { localStore } from './config.ts'
localStore.set('aa', 35345).then(() => {
  console.warn('----- my data is Storage.set.success: ')
}).catch((e) => {
  console.warn('----- my data is Storage.set.error: ', e)
})

localStore.get('aa').then(res => {
  console.warn('----- my data is Storage.get.success: ', res)
}).catch((e) => { console.warn('----- my data is Storage.get.error: ', e) })
```

#### sessionStorage
```ts
import { sessionStore } from './config.ts'
sessionStore.set('aa', 35345).then(() => {
  console.warn('----- my data is Storage.set.success: ')
}).catch((e) => {
  console.warn('----- my data is Storage.set.error: ', e)
})

sessionStore.get('aa').then(res => {
  console.warn('----- my data is Storage.get.success: ', res)
}).catch((e) => { console.warn('----- my data is Storage.get.error: ', e) })
```

#### IndexDB
```ts
import { localIndexStore } from './config.ts'
localIndexStore.set('aa', 11111222).then(() => {
  console.warn('----- my data is IndexDB.set.success: ')
}).catch((e) => {
  console.warn('----- my data is IndexDB.set.error: ', e)
})

localIndexStore.get('aa').then(res => {
  console.warn('----- my data is IndexDB.get.success: ', res)
}).catch((e) => { console.warn('----- my data is IndexDB.get.error: ', e) })

```