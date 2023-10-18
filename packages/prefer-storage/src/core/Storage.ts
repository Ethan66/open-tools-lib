import Project from './Project'
import { type IProjectOption, type IType } from '@/types'
import { StorageStrategy, getFullPath, getNewKey, getValueType, isDue } from '@/utils'

export default class PreferStorage extends Project {
  storage: Storage
  storageName: string
  constructor (storage: 'local' | 'session', projectData: IProjectOption) {
    super(projectData)
    this.storageName = storage
    this.storage = storage === 'local' ? window.localStorage : window.sessionStorage
  }

  async get (key: string): Promise<any> {
    return await new Promise((resolve, reject) => {
      const { storage, name } = this
      if (!this.keys.includes(key)) { reject(new Error(`当前${this.name}项目中${this.storageName + 'Storage'}不存在${key}的键，请确定参数是否正确`)); return }
      const _key = getNewKey(name, key)
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
    })
  }

  async set (key: string, value: any): Promise<void> {
    await new Promise((resolve, reject) => {
      const { name, storage } = this
      if (!this.keys.includes(key)) { reject(new Error(`当前${this.name}项目中${this.storageName + 'Storage'}不能添加${key}的键，请在initProject函数调用处添加白名单`)); return }
      const _key = getNewKey(name, key)
      const type = getValueType(value)
      if (type === 'null') reject(new Error('当前要存储的值为null'))
      const { writeIn } = StorageStrategy[type as IType]
      let _value
      try {
        _value = writeIn(value)
      } catch (e) {
        _value = value
      }
      const result = { type, time: new Date().toLocaleString(), pathname: getFullPath(), value: _value }
      if (this.beforeSet) {
        this.beforeSet(result).then(res => {
          storage.setItem(_key, JSON.stringify(res))
          this.setOrRemoveSuccess(resolve, res)
        }).catch(e => { reject(e) })
      } else {
        storage.setItem(_key, JSON.stringify(result))
        this.setOrRemoveSuccess(resolve, result)
      }
    })
  }

  async remove (key: string): Promise<void> {
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
          void this.remove(key)
        }
      })
      resolve(true)
    })
  }
}
