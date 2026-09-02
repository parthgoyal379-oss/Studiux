import React, { useState } from 'react';
import { useStore } from '../store.jsx';
import { advanceRevision } from '../domain/product.js';
import { revisionBuckets } from '../domain/release3.js';
import { DAY, uid } from '../lib.js';
import * as I from '../icons.jsx';

const label = value =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      })
    : '—';

export default function RevisionExperience({ go }) {
  const { state, patch } = useStore();
  const [tab, setTab] = useState('QUEUE');
  const [selectedTarget, setSelectedTarget] = useState(''); // 'topic:id' or 'chapter:id'

  const activeItems = state.revisionItems.filter(row => row.status !== 'COMPLETED');
  const completedItems = state.revisionItems.filter(row => row.status === 'COMPLETED');
  const buckets = revisionBuckets(activeItems);

  function create(e) {
    e.preventDefault();
    if (!selectedTarget) return;
    const [type, id] = selectedTarget.split(':');
    const isTopic = type === 'topic';
    const topic = isTopic ? state.topics.find(t => t.id === id) : null;
    const chapterId = isTopic ? topic?.chapterId : id;
    const topicId = isTopic ? id : null;

    patch(s => ({
      ...s,
      revisionItems: [
        ...s.revisionItems,
        {
          id: uid(),
          topicId: topicId || null,
          chapterId: chapterId || null,
          dueAt: Date.now() + 86400000,
          intervalsDays: [1, 3, 7, 14, 30],
          intervalIndex: 0,
          status: 'DUE'
        }
      ]
    }));
    setSelectedTarget('');
  }

  function deleteRevision(id) {
    patch(s => ({
      ...s,
      revisionItems: s.revisionItems.filter(row => row.id !== id),
      revisionHistory: s.revisionHistory.filter(row => row.revisionItemId !== id)
    }));
  }

  function review(item, outcome) {
    patch(s => ({
      ...s,
      revisionItems: s.revisionItems.map(row =>
        row.id === item.id ? advanceRevision(row, outcome) : row
      ),
      revisionHistory: [
        ...s.revisionHistory,
        {
          id: uid(),
          revisionItemId: item.id,
          revisedAt: Date.now(),
          outcome
        }
      ]
    }));
  }

  function start(item) {
    const topic = state.topics.find(row => row.id === item.topicId);
    const chapter = state.chapters.find(row => row.id === (item.chapterId || topic?.chapterId));
    if (!chapter) return;
    patch({
      focusDraft: {
        subjectId: chapter.subjectId,
        chapterId: chapter.id,
        topicId: topic?.id || null,
        revisionItemId: item.id,
        mode: 'COUNTDOWN',
        minutes: 25,
        intention: `Revise ${topic?.name || chapter.name}`
      }
    });
    go?.('Focus');
  }

  const getItemNames = item => {
    const topic = state.topics.find(value => value.id === item.topicId);
    const chapter = state.chapters.find(value => value.id === (item.chapterId || topic?.chapterId));
    const subject = state.subjects.find(value => value.id === chapter?.subjectId);
    return {
      title: topic?.name || chapter?.name || 'Revision Item',
      subtitle: `${subject?.name || 'Subject'} · ${topic ? `${chapter?.name} · ` : ''}Cycle R${Number(item.intervalIndex || 0) + 1}`,
      color: subject?.color || 'var(--accent)'
    };
  };

  const renderCard = item => {
    const { title, subtitle, color } = getItemNames(item);

    return (
      <div className="revision-card" key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <i
            className="subject-dot"
            style={{ background: color }}
          />
          <div>
            <b>{title}</b>
            <small style={{ display: 'block', color: 'var(--text-secondary)' }}>
              {subtitle} · Due {label(item.dueAt)}
            </small>
          </div>
        </div>
        <div className="revision-actions" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button className="primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => start(item)}>
            <I.Play /> Revise
          </button>
          {['WEAK', 'OKAY', 'STRONG'].map(value => (
            <button
              key={value}
              className="text-button"
              onClick={() => review(item, value)}
              style={{
                fontSize: 11,
                padding: '4px 6px',
                color:
                  value === 'STRONG'
                    ? 'var(--emerald)'
                    : value === 'WEAK'
                    ? 'var(--rose)'
                    : 'var(--amber)'
              }}
            >
              {value}
            </button>
          ))}
          <button
            type="button"
            className="icon-button"
            title="Shift due date by +1d"
            onClick={() =>
              patch(s => ({
                ...s,
                revisionItems: s.revisionItems.map(row =>
                  row.id === item.id ? { ...row, dueAt: Number(row.dueAt || Date.now()) + DAY } : row
                )
              }))
            }
            style={{ fontSize: 11, fontWeight: 700, padding: 4 }}
          >
            +1d
          </button>
          <button
            type="button"
            className="icon-button"
            title="Delete revision item"
            onClick={() => deleteRevision(item.id)}
            style={{ color: 'var(--rose)', padding: 4 }}
          >
            <I.X style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">SPACED REPETITION</span>
          <h1>Review before weak recall becomes a surprise.</h1>
          <p>Automated spaced revision intervals keep high-yield topics fresh in memory.</p>
        </div>
      </div>

      <div className="segmented">
        <button
          className={tab === 'QUEUE' ? 'active' : ''}
          onClick={() => setTab('QUEUE')}
        >
          ACTIVE QUEUE ({activeItems.length})
        </button>
        <button
          className={tab === 'HISTORY' ? 'active' : ''}
          onClick={() => setTab('HISTORY')}
        >
          LOG & MASTERED ({state.revisionHistory.length + completedItems.length})
        </button>
      </div>

      {tab === 'QUEUE' ? (
        <div className="revision-sections">
          {[
            ['OVERDUE', buckets.overdue, 'var(--rose)'],
            ['TODAY', buckets.today, 'var(--amber)'],
            ['UPCOMING', buckets.upcoming, 'var(--text-muted)']
          ].map(([name, items, color]) => (
            <section className="panel" key={name}>
              <div className="panel-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: color
                    }}
                  />
                  <h3>{name}</h3>
                </div>
                <span>{items.length} items</span>
              </div>
              {items.length ? (
                items.map(renderCard)
              ) : (
                <p className="muted">No revision items in this section.</p>
              )}
            </section>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {completedItems.length > 0 && (
            <section className="panel">
              <div className="panel-title">
                <div>
                  <span className="eyebrow" style={{ color: 'var(--emerald)' }}>RETENTION ACHIEVED</span>
                  <h3>MASTERED TOPICS & CHAPTERS</h3>
                </div>
                <span>{completedItems.length} completed</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {completedItems.map(item => {
                  const { title, color } = getItemNames(item);
                  return (
                    <div
                      key={item.id}
                      style={{
                        background: 'var(--surface-hover)',
                        border: '1px solid var(--emerald-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '6px 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      <i className="subject-dot" style={{ background: color }} />
                      <b>{title}</b>
                      <span style={{ fontSize: 11, color: 'var(--emerald)', fontWeight: 700 }}>✓ Completed</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section className="panel">
            <div className="panel-title">
              <h3>RECENT REVISION LOG</h3>
              <span>{state.revisionHistory.length} total logged</span>
            </div>
            {state.revisionHistory.length ? (
              state.revisionHistory
                .slice()
                .sort((a, b) => b.revisedAt - a.revisedAt)
                .map(history => {
                  const item = state.revisionItems.find(
                    row => row.id === history.revisionItemId
                  );
                  const { title } = item ? getItemNames(item) : { title: 'Revision' };
                  return (
                    <div className="history-row" key={history.id}>
                      <div>
                        <b>{title}</b>
                        <small style={{ display: 'block' }}>Recorded on {label(history.revisedAt)}</small>
                      </div>
                      <span
                        style={{
                          color:
                            history.outcome === 'STRONG'
                              ? 'var(--emerald)'
                              : history.outcome === 'WEAK'
                              ? 'var(--rose)'
                              : 'var(--amber)',
                          fontWeight: 700,
                          fontSize: 12
                        }}
                      >
                        {history.outcome || 'Reviewed'}
                      </span>
                    </div>
                  );
                })
            ) : (
              <div className="empty">
                <h3>No completed revisions</h3>
                <p>Review items in your queue to build your recall history.</p>
              </div>
            )}
          </section>
        </div>
      )}

      <form className="inline-form" onSubmit={create} style={{ marginTop: 24 }}>
        <select
          value={selectedTarget}
          onChange={e => setSelectedTarget(e.target.value)}
          style={{ flex: 1 }}
        >
          <option value="">Choose a Chapter or Topic to schedule for spaced revision…</option>
          {state.subjects.map(subject => {
            const subjectChapters = state.chapters.filter(c => c.subjectId === subject.id);
            return (
              <optgroup key={subject.id} label={subject.name}>
                {subjectChapters.map(chap => {
                  const chapTopics = state.topics.filter(t => t.chapterId === chap.id);
                  return (
                    <React.Fragment key={chap.id}>
                      <option value={`chapter:${chap.id}`}>
                        📁 Chapter: {chap.name}
                      </option>
                      {chapTopics.map(t => (
                        <option key={t.id} value={`topic:${t.id}`}>
                          &nbsp;&nbsp;&nbsp;&nbsp;↳ Topic: {t.name}
                        </option>
                      ))}
                    </React.Fragment>
                  );
                })}
              </optgroup>
            );
          })}
        </select>
        <button className="primary" disabled={!selectedTarget}>
          <I.Plus /> Schedule Spaced Revision
        </button>
      </form>
    </>
  );
}

