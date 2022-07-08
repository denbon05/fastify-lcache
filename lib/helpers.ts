import type { ICacheOptions } from './types/lcache';

const getMilliseconds = (min: number): number => min * 60000;

export const formatOptions = (opts: ICacheOptions): ICacheOptions => ({
  ...opts,
  ttl: getMilliseconds(opts.ttl),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatToJSON = (data: Iterable<any>) => JSON.stringify(Object.fromEntries(data));
