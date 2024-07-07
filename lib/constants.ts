/* eslint-disable import/prefer-default-export */

import type { RequestMethod } from './types/lcache';

export const TTL_IN_MINUTES = 5;
export const STATUSES_TO_CACHE = [200];
export const METHODS_TO_CACHE: RequestMethod[] = ['GET'];
