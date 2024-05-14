import { type IProjectOption } from '@/types/index'

export default class Project<T> {
  name: string
  keys: T[]
  expire: number
  idbVersion: number
  idbStoreOption: IDBObjectStoreParameters
  idCreateIndexs: string[]
  beforeGet?: (val: { v: any, _isDue: boolean, _key: string, _pathname: string }) => Promise<any>
  afterGet?: (key: string) => Promise<any>
  beforeSet?: (val: { value: any, type: string, time: string, key: string, pathname: string }) => Promise<any>
  afterSet?: (res: any) => Promise<any>
  idBeforeGet?: (val: { v: any, _isDue: boolean, _pathname: string }) => Promise<any>
  idBeforeSet?: (val: { value: any, time: string, pathname: string }) => Promise<any>
  idAfterSet?: (res: any) => Promise<any>
  options: Recordable<string>
  constructor (options: IProjectOption<T>) {
    this.name = options.name
    this.keys = options.keys
    this.expire = options.expire ?? 0
    this.idbVersion = options.idbVersion ?? 1
    this.idbStoreOption = options.idbStoreOption ?? { keyPath: '_key' }
    this.idCreateIndexs = options.idCreateIndexs ?? ['pathname']
    this.beforeGet = options.beforeGet
    this.afterGet = options.afterGet
    this.beforeSet = options.beforeSet
    this.afterSet = options.afterSet
    this.idBeforeGet = options.idBeforeGet
    this.idBeforeSet = options.idBeforeSet
    this.idAfterSet = options.idAfterSet
    const data: Recordable<string> = { ...options }
    delete data.name
    delete data.keys
    delete data.expire
    delete data.idbVersion
    delete data.beforeGet
    delete data.afterGet
    delete data.beforeSet
    delete data.afterSet
    delete data.idBeforeGet
    delete data.idBeforeSet
    delete data.idAfterSet
    this.options = data
  }
}
