/* eslint-disable import/prefer-default-export */
import type { ICacheOptions } from './types/lcache';

const getMilliseconds = (min: number): number => min * 60000;

export const formatOptions = (opts: ICacheOptions): ICacheOptions => ({
  ...opts,
  ttl: getMilliseconds(opts.ttl),
});
