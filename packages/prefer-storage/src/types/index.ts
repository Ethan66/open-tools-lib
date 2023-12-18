export type IType = 'boolean' | 'object' | 'array' | 'number' | 'any' | 'string' | 'map' | 'set' | 'date'

export interface IProjectOption<T> {
  name: string
  expire?: number
  idbVersion?: number
  idbStoreOption?: IDBObjectStoreParameters
  idCreateIndexs?: string[]
  beforeGet?: (val: { v: any, _isDue: boolean, _key: string, _pathname: string }) => Promise<any> // 如：拿到数据发现过期进行逻辑操作，也可以对拿到的数据二次加工再返回
  beforeSet?: (val: { value: any, type: string, time: string, pathname: string }) => Promise<any> // 如：在存储前对数据进行处理后再存储
  afterSet?: (res: any) => Promise<any> // 如：存储结束后对数据进行上报服务器
  idBeforeGet?: (val: { v: any, _isDue: boolean, _pathname: string }) => Promise<any> // 如：拿到数据发现过期进行逻辑操作，也可以对拿到的数据二次加工再返回
  idBeforeSet?: (val: { value: any, time: string, pathname: string }) => Promise<any> // 如：在存储前对数据进行处理后再存储
  idAfterSet?: (res: any) => Promise<any> // 如：存储结束后对数据进行上报服务器
  keys: T[]
  [key: string]: any
}

export interface IStrategyFn<T> {
  read: (raw: string) => T
  writeIn: (value: T) => string
}

export interface IStoreParameter {
  objectStoreName: string
  idCreateIndexs?: string[]
  storeOption?: IDBObjectStoreParameters
}

export const enum TransactionMode {
  ReadOnly = 'readonly',
  ReadWrite = 'readwrite',
}
