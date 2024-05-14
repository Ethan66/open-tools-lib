import Project from './Project'
import { type IProjectOption, type IType } from '@/types'
import { StorageStrategy, getFullPath, getNewKey, isDue, handleGetJSONData, getValueType } from '@/utils'

export default class PreferStorage<T extends string> extends Project<T> {
  storage: Storage
  storageName: string
  constructor (storage: 'local' | 'session', projectData: IProjectOption<T>) {
    super(projectData)
    this.storageName = storage
    this.storage = storage === 'local' ? window.localStorage : window.sessionStorage
  }

  async get (key: T): Promise<any> {
    return await new Promise((resolve, reject) => {
      const { storage, name } = this
      if (!this.keys.includes(key)) { reject(new Error(`当前${this.name}项目中${this.storageName + 'Storage'}不存在${key}的键，请确定参数是否正确`)); return }
      const _key = getNewKey<T>(name, key)
      const v = storage.getItem(_key)
      let _v
      let _time = ''
      let _pathname = ''
      try {
        _v = JSON.parse(v as string)
        const { type, value, time, pathname } = _v
        _time = time
        _pathname = pathname
        const fn = StorageStrategy[type as IType]
        if (fn) {
          _v = fn.read(value)
        } else {
          _v = v
        }
      } catch (e) {
        _v = v
      }
      const result = { v: _v, _isDue: _time ? isDue(_time, this.expire) : false, _key, _pathname }
      if (this.beforeGet) {
        this.beforeGet(result).then((newData) => { resolve(newData || result) }).catch(e => { reject(e || new Error(`${'beforeGet'}规则没通过，请查看beforeGet函数`)) })
      } else {
        resolve(result)
      }
      if (this.afterGet) {
        void this.afterGet(key)
      }
    })
  }

  async set (key: T, value: any): Promise<void> {
    await new Promise((resolve, reject) => {
      const { name, storage } = this
      if (!this.keys.includes(key)) { reject(new Error(`当前${this.name}项目中${this.storageName + 'Storage'}不能添加${key}的键，请在initProject函数调用处添加白名单`)); return }
      const _key = getNewKey(name, key)
      const type = getValueType(value)
      if (type === 'null') reject(new Error('当前要存储的值为null'))
      const _value = handleGetJSONData(type, value, reject)
      const result = { type, time: new Date().toLocaleString(), pathname: getFullPath(), value: _value }
      if (this.beforeSet) {
        this.beforeSet({ ...result, key, value }).then(res => {
          const type = getValueType(res.value)
          if (type === 'null') reject(new Error('当前要存储的值为null'))
          res.type = type
          res.value = handleGetJSONData(type, res.value, reject)
          storage.setItem(_key, JSON.stringify(res))
          this.setOrRemoveSuccess(resolve, res)
        }).catch(e => { reject(e) })
      } else {
        storage.setItem(_key, JSON.stringify(result))
        this.setOrRemoveSuccess(resolve, result)
      }
    })
  }

  async remove (key: T): Promise<void> {
    await new Promise((resolve, reject) => {
      if (!this.keys.includes(key)) { reject(new Error(`当前${this.name}项目中${this.storageName + 'Storage'}不存在${key}的键，请确定参数是否正确`)); return }
      const { name, storage } = this
      const _key = getNewKey(name, key)
      storage.removeItem(_key)
      this.setOrRemoveSuccess(resolve)
    })
  }

  setOrRemoveSuccess (resolve: (value: unknown) => void, res?: any): void {
    if (this.afterSet) {
      this.afterSet(res).then(() => { resolve(true) }).catch(e => { console.log(e) })
    } else {
      resolve(true)
    }
  }

  async clear (): Promise<void> {
    await new Promise((resolve) => {
      const { name, storage } = this
      const keys = Object.keys(storage)
      keys.forEach(key => {
        const regex = new RegExp(`^${name}.*$`)
        const isMatch = regex.test(key)
        if (isMatch) {
          void this.remove(key as T)
        }
      })
      resolve(true)
    })
  }
}
