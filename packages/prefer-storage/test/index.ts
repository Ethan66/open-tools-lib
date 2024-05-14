import { PreferStorage, IndexDBStorage } from '@/core/index'

const projectData = {
  name: 'unicom',
  expire: 24,
  beforeGet: async (res: { v: any, _isDue: boolean, _key: string, _pathname: string }) => {
    return await new Promise((resolve, reject) => {
      console.warn('----- my data is 00000001', 'beforeGet: ', res)
      if (res._isDue) reject(new Error(`${''}数据已过期，请重新登录`))
      else {
        // const result = { ...v, aa: 123 }
        // resolve(result)
        resolve(res.v)
      }
    })
  },
  afterGet: async function (key: string) {
    // if (key.includes('a')) { void localStore.remove(key as typeof localStore.keys[number]) }
    console.warn('----- my data is ley: ', key)
  },
  beforeSet: async (val: { value: any, type: string, time: string, pathname: string }) => {
    return await new Promise((resolve) => {
      console.warn('----- my data is 00000000', 'beforeSet', val)
      resolve({ ...val, aa: Math.random() })
    })
  },
  afterSet: async (res: any) => {
    return await new Promise((resolve) => {
      console.warn('----- my data is 000000002: afterSet', res)
      resolve(res)
    })
  },
  idBeforeGet: async (res: { v: any, _isDue: boolean, _pathname: string }) => {
    return await new Promise((resolve, reject) => {
      console.warn('----- my data is 00000011', 'idBeforeGet', res)
      if (res._isDue) reject(new Error(`${''}数据已过期，请重新登录`))
      else {
        // const result = { ...v, aa: 123 }
        // resolve(result)
        resolve(res.v)
      }
    })
  },
  idBeforeSet: async (val: { value: any, time: string, pathname: string }) => {
    console.warn('----- my data is 00000010', 'idBeforeSet', val)
    return await new Promise((resolve) => {
      resolve({ ...val, aa: Math.random() })
    })
  },
  idAfterSet: async (res: any) => {
    return await new Promise((resolve) => {
      console.warn('----- my data is 00000012: idAfterSet', res)
      resolve(res)
    })
  }
}

export const localStore = new PreferStorage('local', { ...projectData, keys: ['aa', 'bb'] })
export const localIndexStore = new IndexDBStorage({ objectStoreName: 'borrow' }, { ...projectData, keys: ['aa', 'bb'] })

// localStore.set('aa', 35345).then(() => {
//   console.warn('----- my data is Storage.set.success: ')
// }).catch((e) => {
//   console.warn('----- my data is Storage.set.error: ', e)
// })

localStore.get('aa').then(res => {
  console.warn('----- my data is Storage.get.success: ', res)
}).catch((e) => { console.warn('----- my data is Storage.get.error: ', e) })

// localIndexStore.set('aa', 11111222).then(() => {
//   console.warn('----- my data is IndexDB.set.success: ')
// }).catch((e) => {
//   console.warn('----- my data is IndexDB.set.error: ', e)
// })

localIndexStore.get('aa').then(res => {
  console.warn('----- my data is IndexDB.get.success: ', res)
}).catch((e) => { console.warn('----- my data is IndexDB.get.error: ', e) })
