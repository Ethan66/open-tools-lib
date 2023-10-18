// import { log, warning } from '../../utils'
import { type IStoreParameter, TransactionMode, type IProjectOption } from '@/types'
import Project from './Project'
import { getFullPath, getIdbValue, isDue } from '@/utils'

export class IndexedDB extends Project {
  private readonly objectStoreName: string
  private readonly storeOption?: IDBObjectStoreParameters
  private readonly createIndexs?: string[]
  private db!: IDBDatabase

  private readyPromise!: Promise<void>
  private readyPromiseResolve!: () => void
  private readyPromiseReject!: (error: DOMException | null) => void

  constructor (options: IStoreParameter, projectData: IProjectOption) {
    const { objectStoreName, storeOption, idCreateIndexs } = options
    super(projectData)
    this.objectStoreName = objectStoreName
    this.storeOption = storeOption
    this.createIndexs = idCreateIndexs
    if (window.indexedDB) {
      this.init()
    } else {
      throw new Error('本浏览器不支持indexDB')
    }
  }

  private init (): void {
    // 打开或创建数据库
    const request = indexedDB.open(this.name, this.idbVersion)
    this.readyPromise = new Promise((resolve, reject) => {
      this.readyPromiseResolve = resolve
      this.readyPromiseReject = reject
    })

    // 数据库名不存在，或打开的数据库版本高于已存在的数据库版本
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      this.db = (event.target as IDBOpenDBRequest).result
      this.createStore()
    }

    // 数据库打开成功的回调
    request.onsuccess = (event: Event) => {
      this.db = (event.target as IDBOpenDBRequest).result
      this.readyPromiseResolve()
    }

    request.onerror = (event: Event) => {
      this.readyPromiseReject((event.target as IDBOpenDBRequest).error)
    }
  }

  private async ready (): Promise<void> {
    await this.readyPromise
  }

  private createStore (): void {
    const { objectStoreNames } = this.db
    // 创建表
    if (!objectStoreNames.contains(this.objectStoreName)) {
      const objectStore = this.db.createObjectStore(this.objectStoreName, this.storeOption ?? this.idbStoreOption);
      (this.createIndexs ?? this.idCreateIndexs).forEach(key => {
        objectStore.createIndex(key, key, { unique: false })
      })
    }
  }

  // 事务访问存储对象
  private getObjectStore (transactionMode?: TransactionMode): IDBObjectStore {
    const transaction = this.db.transaction(this.objectStoreName, transactionMode) // 创建事务
    const objectStore = transaction.objectStore(this.objectStoreName) // 事务访问存储空间

    return objectStore
  }

  // 监听事务存储对象操作结果
  private listenResult <T>(request: IDBRequest<T>, resolve: (value: unknown) => void, reject: (reason?: any) => void, type: string, v?: any): void {
    request.onsuccess = (event: Event) => {
      const { result } = event.target as IDBRequest
      const { value, time, pathname } = result || {}
      if (type === 'get') {
        const result = { v: value, _isDue: isDue(time, this.expire), _pathname: pathname }
        if (this.idBeforeGet) {
          this.idBeforeGet(result).then((newData) => { resolve(newData || result) }).catch(e => { reject(e || new Error(`${'beforeGet'}规则没通过，请查看beforeGet函数`)) })
        } else {
          resolve(result)
        }
      } else {
        if (['set', 'remove'].includes(type)) {
          if (this.idAfterSet) {
            this.idAfterSet(v).then(() => { resolve(true) }).catch(e => { console.log(e) })
          } else {
            resolve(true)
          }
        } else {
          resolve(true)
        }
      }
    }

    request.onerror = (event: Event) => {
      reject((event.target as IDBTransaction).error)
    }
  }

  async get (key: string): Promise<any> {
    return await new Promise((resolve, reject) => {
      this.ready()
        .then(() => {
          if (!this.keys.includes(key)) { reject(new Error(`当前${this.name}数据库中的表${this.objectStoreName}不存在${key}的键，请确定参数是否正确`)); return }
          const objectStore = this.getObjectStore(TransactionMode.ReadOnly)
          const request = objectStore.get(key)
          this.listenResult(request, resolve, reject, 'get')
        })
        .catch(reject)
    })
  }

  async set (key: string, val: any): Promise<void> {
    await new Promise((resolve, reject) => {
      this.ready()
        .then(() => {
          if (!this.keys.includes(key)) { reject(new Error(`当前${this.name}数据库中不能添加${key}的键，请在initProject函数调用处添加白名单`)); return }
          const temp = getIdbValue((this.storeOption?.keyPath ?? this.idbStoreOption.keyPath) as string, key)
          const value = { ...temp, value: val, time: new Date().toLocaleString(), pathname: getFullPath() }
          const objectStore = this.getObjectStore(TransactionMode.ReadWrite)
          let request: IDBRequest<IDBValidKey>
          if (this.idBeforeSet) {
            this.idBeforeSet(value).then((res) => {
              request = objectStore.put(res)
              this.listenResult(request, resolve, reject, 'set', res)
            }).catch(e => { reject(e) })
          } else {
            request = objectStore.put(value)
            this.listenResult(request, resolve, reject, 'set', value)
          }
        })
        .catch(reject)
    })
  }

  async remove (key: string): Promise<void> {
    await new Promise((resolve, reject) => {
      this.ready()
        .then(() => {
          if (!this.keys.includes(key)) { reject(new Error(`当前${this.name}数据库中表${this.objectStoreName}不存在${key}的键，请确定参数是否正确`)); return }
          const objectStore = this.getObjectStore(TransactionMode.ReadWrite)
          const request = objectStore.delete(key)
          this.listenResult(request, resolve, reject, 'remove')
        })
        .catch(reject)
    })
  }

  async clear (): Promise<void> {
    await new Promise((resolve, reject) => {
      this.ready()
        .then(() => {
          const objectStore = this.getObjectStore(TransactionMode.ReadWrite)
          const request = objectStore.clear()
          this.listenResult(request, resolve, reject, 'clear')
        })
        .catch(reject)
    })
  }
}
export default IndexedDB
