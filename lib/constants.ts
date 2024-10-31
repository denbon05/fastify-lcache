import type { RequestMethod } from './types/lcache';

// default values
export const TTL_IN_MINUTES = 5;
export const STATUSES_TO_CACHE = [200];
export const METHODS_TO_CACHE: RequestMethod[] = ['GET'];
export const TLL_CHECK_INTERVAL_MS = 1500;
