export interface IStorageOptions {
  ttl?: number
}

export type Src = Map<string, unknown>

export type SrcMeta = Map<string, { updatedAt: Date }>
