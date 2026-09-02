import { LocalAdapter } from './localAdapter.js';
import { HybridAdapter } from './hybridAdapter.js';
import { SupabaseAdapter } from './supabaseAdapter.js';
import { isCloudConfigured } from '../lib/supabase.js';

export const LOCAL_USER_ID = 'local-device';
export const entitiesKey = userId => `studiux:entities:v2:${userId || LOCAL_USER_ID}`;
export const outboxKey = userId => `studiux:outbox:v2:${userId || LOCAL_USER_ID}`;

export function createDataRuntime({ userId = LOCAL_USER_ID, storage = localStorage, remote } = {}) {
  const local = new LocalAdapter(storage, entitiesKey(userId));
  const cloud = remote === undefined && isCloudConfigured ? new SupabaseAdapter() : remote;
  const repository = new HybridAdapter({ local, remote: cloud || null, storage, outboxKey: outboxKey(userId) });
  return { userId, local, remote: cloud || null, repository, storage, outboxKey: outboxKey(userId), cloudEnabled: Boolean(cloud) };
}
