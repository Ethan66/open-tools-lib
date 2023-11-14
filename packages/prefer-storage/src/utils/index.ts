import { type IStrategyFn, type IType } from '@/types'
export const StorageStrategy: Record<
IType,
IStrategyFn<any>
> = {
  boolean: {
    read: (v: string) => v === 'true',
    writeIn: (v: any) => String(v)
  },
  object: {
    read: (v: string) => JSON.parse(v),
    writeIn: (v: any) => JSON.stringify(v)
  },
  number: {
    read: (v: string) => +v,
    writeIn: (v: any) => String(v)
  },
  any: {
    read: (v: string) => v,
    writeIn: (v: any) => String(v)
  },
  string: {
    read: (v: string) => v,
    writeIn: (v: any) => v
  },
  map: {
    read: (v: string) => new Map(JSON.parse(v)),
    writeIn: (v: any) => JSON.stringify(Array.from(v))
  },
  set: {
    read: (v: string) => new Set(JSON.parse(v)),
    writeIn: (v: any) => JSON.stringify(Array.from(v))
  },
  date: {
    read: (v: string) => new Date(v),
    writeIn: (v: any) => v.toISOString()
  }
}

// 获取全路径key
export const getNewKey = <T extends string>(name: string, key: T): string => {
  return `${name}__${key}`
}

// indexDb获取存储对象
export const getIdbValue = (keyKey: string, keyValue: string): Recordable<any> => {
  return { [keyKey]: keyValue }
}

// 获取value的类型
export const getValueType = (value: string): string => {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
}

// 判断是否过期
export const isDue = (time: string, expire: number): boolean => {
  return (expire * 60 * 60 * 1000 + new Date(time).getTime()) < new Date().getTime()
}

// 获取当前页面的全路径（除了域名）
export const getFullPath = (): string => {
  return window.location.href.replace(/^https?:\/\/[^/]+(.*)$/, '$1')
}
