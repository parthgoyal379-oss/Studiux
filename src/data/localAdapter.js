const DB_KEY = 'studiux:entities:v2';
const timestamp = row => String(row?.updatedAt || row?.updated_at || '');
export function reconcileRecord(local, remote, { localPending = false } = {}) { if (!local) return remote; if (!remote) return local; if (localPending) return local; return timestamp(remote) > timestamp(local) ? { ...local, ...remote } : local; }
export class LocalAdapter {
  constructor(storage = localStorage, key = DB_KEY) { this.storage = storage; this.key = key; }
  read() { try { return JSON.parse(this.storage.getItem(this.key) || '{}'); } catch { return {}; } }
  write(db) { this.storage.setItem(this.key, JSON.stringify(db)); }
  async list(entity) { return Object.values(this.read()[entity] || {}).filter(x => !x.deletedAt && !x.deleted_at); }
  async get(entity, id) { return this.read()[entity]?.[id] || null; }
  async upsert(entity, record) { const db = this.read(), bucket = db[entity] || {}, previous = bucket[record.id]; const next = { ...previous, ...record, id: record.id, version: Math.max(previous?.version || 0, record.version || 0) + 1, updatedAt: record.updatedAt || new Date().toISOString() }; db[entity] = { ...bucket, [record.id]: next }; this.write(db); return next; }
  async archive(entity, id) { const row = await this.get(entity, id); return row ? this.upsert(entity, { ...row, archivedAt: new Date().toISOString() }) : null; }
  async remove(entity, id) { const row = await this.get(entity, id); return row ? this.upsert(entity, { ...row, deletedAt: new Date().toISOString() }) : null; }
  async ingest(entity, records, { pendingIds = new Set() } = {}) { const db = this.read(), bucket = { ...(db[entity] || {}) }; for (const remote of records) bucket[remote.id] = reconcileRecord(bucket[remote.id], remote, { localPending: pendingIds.has(remote.id) }); db[entity] = bucket; this.write(db); return this.list(entity); }
}
