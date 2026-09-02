import { enqueueMutation, readOutbox } from '../services/syncService.js';
export class HybridAdapter {
  constructor({ local, remote = null, storage = localStorage, outboxKey }) { this.local = local; this.remote = remote; this.storage = storage; this.outboxKey = outboxKey; }
  async list(entity, { refresh = false } = {}) { if (refresh && this.remote) { const rows = await this.remote.list(entity); const pendingIds = new Set(readOutbox(this.storage, this.outboxKey).filter(x => x.entity === entity && x.status !== 'SYNCED').map(x => x.payload?.id)); await this.local.ingest(entity, rows, { pendingIds }); } return this.local.list(entity); }
  async upsert(entity, record) { const row = await this.local.upsert(entity, record); if (this.remote) enqueueMutation({ id: `${entity}:${record.id}:${row.version}`, entity, action: 'upsert', payload: row }, this.storage, this.outboxKey); return row; }
  async archive(entity, id) { const row = await this.local.archive(entity, id); if (row && this.remote) enqueueMutation({ id: `${entity}:${id}:archive:${row.version}`, entity, action: 'archive', payload: { id } }, this.storage, this.outboxKey); return row; }
  async remove(entity, id) { const row = await this.local.remove(entity, id); if (row && this.remote) enqueueMutation({ id: `${entity}:${id}:delete:${row.version}`, entity, action: 'delete', payload: { id } }, this.storage, this.outboxKey); return row; }
  async activeSession({ remoteFirst = false } = {}) { if (remoteFirst && this.remote) { const remote = await this.remote.activeSession(); if (remote) return remote; } const local = (await this.local.list('sessions')).find(x => ['ACTIVE', 'PAUSED'].includes(x.status)); return local || await this.remote?.activeSession?.() || null; }
}
