import React, { useMemo, useState } from 'react';
import { useStore } from '../store.jsx';
import { formatDuration, uid } from '../lib.js';
import * as I from '../icons.jsx';

const STATUSES = ['NOT_STARTED', 'LEARNING', 'PRACTICING', 'REVISING', 'STRONG'];
const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', '#f43f5e', '#3b82f6'];

export default function SyllabusExperience({ go }) {
  const { state, patch } = useStore();
  const [selected, setSelected] = useState(state.subjects[0]?.id || '');
  const [chapterId, setChapterId] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [chapterName, setChapterName] = useState('');
  const [topicName, setTopicName] = useState('');
  const [editingSubject, setEditingSubject] = useState(null);
  const [editingChapter, setEditingChapter] = useState(null);

  const subject = state.subjects.find(row => row.id === selected);
  const chapters = state.chapters.filter(row => row.subjectId === selected);
  const chapter = state.chapters.find(row => row.id === chapterId);

  const metrics = useMemo(() => {
    if (!chapter) return null;
    const sessions = state.sessions.filter(row => row.chapterId === chapter.id);
    const tasks = state.tasks.filter(row => row.chapterId === chapter.id);
    const mistakes = state.mistakes.filter(row => row.chapterId === chapter.id);
    const revisions = state.revisionHistory.filter(row => {
      const item = state.revisionItems.find(value => value.id === row.revisionItemId);
      const topic = state.topics.find(value => value.id === item?.topicId);
      return item?.chapterId === chapter.id || topic?.chapterId === chapter.id;
    });
    const attempted = sessions.reduce((sum, row) => sum + (row.questions || 0), 0);
    const correct = sessions.reduce((sum, row) => sum + (row.questionsCorrect || 0), 0);

    return {
      time: sessions.reduce((sum, row) => sum + (row.duration || 0), 0),
      sessions: sessions.length,
      tasks: tasks.length,
      attempted,
      accuracy: attempted ? Math.round((correct / attempted) * 100) : null,
      mistakes: mistakes.length,
      revisions: revisions.length,
      lastStudied: Math.max(0, ...sessions.map(row => row.endedAt || 0))
    };
  }, [chapter, state]);

  function addSubject(e) {
    e.preventDefault();
    if (!subjectName.trim()) return;
    const id = uid();
    patch(s => ({
      ...s,
      subjects: [
        ...s.subjects,
        {
          id,
          name: subjectName.trim(),
          color: COLORS[s.subjects.length % COLORS.length],
          target: 60,
          status: 'NOT_STARTED'
        }
      ]
    }));
    setSelected(id);
    setSubjectName('');
  }

  function deleteSubject(subId) {
    patch(s => ({
      ...s,
      subjects: s.subjects.filter(row => row.id !== subId),
      chapters: s.chapters.filter(row => row.subjectId !== subId)
    }));
    if (selected === subId) {
      setSelected(state.subjects.find(row => row.id !== subId)?.id || '');
      setChapterId('');
    }
  }

  function addChapter(e) {
    e.preventDefault();
    if (!chapterName.trim() || !selected) return;
    const id = uid();
    patch(s => ({
      ...s,
      chapters: [
        ...s.chapters,
        {
          id,
          subjectId: selected,
          name: chapterName.trim(),
          status: 'NOT_STARTED',
          targetMinutes: 0
        }
      ]
    }));
    setChapterId(id);
    setChapterName('');
  }

  function deleteChapter(chapId) {
    patch(s => ({
      ...s,
      chapters: s.chapters.filter(row => row.id !== chapId),
      topics: s.topics.filter(row => row.chapterId !== chapId)
    }));
    if (chapterId === chapId) setChapterId('');
  }

  function addTopic(e) {
    e.preventDefault();
    if (!topicName.trim() || !chapter) return;
    patch(s => ({
      ...s,
      topics: [
        ...s.topics,
        {
          id: uid(),
          chapterId: chapter.id,
          name: topicName.trim(),
          status: 'NOT_STARTED'
        }
      ]
    }));
    setTopicName('');
  }

  function cycleTopicStatus(topic) {
    const currentIndex = STATUSES.indexOf(topic.status || 'NOT_STARTED');
    const nextStatus = STATUSES[(currentIndex + 1) % STATUSES.length];
    patch(s => ({
      ...s,
      topics: s.topics.map(row => (row.id === topic.id ? { ...row, status: nextStatus } : row))
    }));
  }

  function deleteTopic(topId) {
    patch(s => ({
      ...s,
      topics: s.topics.filter(row => row.id !== topId)
    }));
  }

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">SYLLABUS & MASTERY</span>
          <h1>Know what is covered and what needs work.</h1>
          <p>Structured subjects, chapters, and granular topic intelligence.</p>
        </div>
      </div>

      <div className="subject-grid">
        {state.subjects.map(row => {
          const rows = state.chapters.filter(value => value.subjectId === row.id);
          const strong = rows.filter(value => value.status === 'STRONG').length;
          return (
            <div
              className={`subject-card ${selected === row.id ? 'selected-card' : ''}`}
              key={row.id}
              onClick={() => {
                setSelected(row.id);
                setChapterId('');
              }}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <i className="subject-dot" style={{ background: row.color || 'var(--accent)' }} />
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span className="eyebrow">{row.status || 'ACTIVE'}</span>
                  <button
                    type="button"
                    className="icon-button"
                    title="Edit subject"
                    onClick={e => {
                      e.stopPropagation();
                      setEditingSubject(row);
                    }}
                    style={{ padding: 2, color: 'var(--text-muted)' }}
                  >
                    <I.SlidersHorizontal style={{ width: 13, height: 13 }} />
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    title="Delete subject"
                    onClick={e => {
                      e.stopPropagation();
                      deleteSubject(row.id);
                    }}
                    style={{ padding: 2, color: 'var(--rose)' }}
                  >
                    <I.X style={{ width: 13, height: 13 }} />
                  </button>
                </div>
              </div>
              <h3>{row.name}</h3>
              <p>
                {rows.length} chapters · {strong} mastered
              </p>
            </div>
          );
        })}

        <form className="new-subject" onSubmit={addSubject}>
          <I.Plus style={{ color: 'var(--accent)' }} />
          <input
            value={subjectName}
            onChange={e => setSubjectName(e.target.value)}
            placeholder="New subject…"
          />
          <button className="primary" style={{ padding: '6px 12px', fontSize: 12 }}>
            Add
          </button>
        </form>
      </div>

      {editingSubject && (
        <div className="overlay">
          <form
            className="import-dialog"
            role="dialog"
            aria-modal="true"
            onSubmit={e => {
              e.preventDefault();
              patch(s => ({
                ...s,
                subjects: s.subjects.map(row => (row.id === editingSubject.id ? editingSubject : row))
              }));
              setEditingSubject(null);
            }}
          >
            <span className="eyebrow">EDIT SUBJECT</span>
            <h2>Update subject</h2>
            <label>
              Subject Name
              <input
                value={editingSubject.name}
                onChange={e => setEditingSubject({ ...editingSubject, name: e.target.value })}
                required
              />
            </label>
            <label>
              Color Accent
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setEditingSubject({ ...editingSubject, color: c })}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: c,
                      border: editingSubject.color === c ? '2px solid white' : 'none',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </label>
            <div className="dialog-actions">
              <button type="button" onClick={() => setEditingSubject(null)}>
                Cancel
              </button>
              <button className="primary">Save</button>
            </div>
          </form>
        </div>
      )}

      {editingChapter && (
        <div className="overlay">
          <form
            className="import-dialog"
            role="dialog"
            aria-modal="true"
            onSubmit={e => {
              e.preventDefault();
              patch(s => ({
                ...s,
                chapters: s.chapters.map(row => (row.id === editingChapter.id ? editingChapter : row))
              }));
              setEditingChapter(null);
            }}
          >
            <span className="eyebrow">EDIT CHAPTER</span>
            <h2>Update chapter</h2>
            <label>
              Chapter Name
              <input
                value={editingChapter.name}
                onChange={e => setEditingChapter({ ...editingChapter, name: e.target.value })}
                required
              />
            </label>
            <label>
              Target Study Minutes
              <input
                type="number"
                min="0"
                value={editingChapter.targetMinutes || 0}
                onChange={e => setEditingChapter({ ...editingChapter, targetMinutes: Number(e.target.value) || 0 })}
              />
            </label>
            <div className="dialog-actions">
              <button type="button" onClick={() => setEditingChapter(null)}>
                Cancel
              </button>
              <button className="primary">Save</button>
            </div>
          </form>
        </div>
      )}

      {subject && (
        <div className="syllabus-workspace">
          <section className="panel chapter-panel">
            <div className="panel-title">
              <div>
                <span className="eyebrow">CHAPTERS</span>
                <h3>{subject.name}</h3>
              </div>
              <span>{chapters.length} total</span>
            </div>

            {chapters.map(row => (
              <div
                className={`chapter-row ${chapterId === row.id ? 'active' : ''}`}
                key={row.id}
                onClick={() => setChapterId(row.id)}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}
              >
                <div style={{ flex: 1 }}>
                  <b>{row.name}</b>
                  <small style={{ display: 'block' }}>
                    {state.topics.filter(value => value.chapterId === row.id).length} topics
                  </small>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <select
                    value={row.status || 'NOT_STARTED'}
                    onClick={e => e.stopPropagation()}
                    onChange={e =>
                      patch(s => ({
                        ...s,
                        chapters: s.chapters.map(value =>
                          value.id === row.id ? { ...value, status: e.target.value } : value
                        )
                      }))
                    }
                    style={{ width: 'auto', padding: '6px 10px', fontSize: 12 }}
                  >
                    {STATUSES.map(value => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="icon-button"
                    title="Edit chapter"
                    onClick={e => {
                      e.stopPropagation();
                      setEditingChapter(row);
                    }}
                    style={{ padding: 4 }}
                  >
                    <I.SlidersHorizontal style={{ width: 13, height: 13 }} />
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    title="Delete chapter"
                    onClick={e => {
                      e.stopPropagation();
                      deleteChapter(row.id);
                    }}
                    style={{ padding: 4, color: 'var(--rose)' }}
                  >
                    <I.X style={{ width: 13, height: 13 }} />
                  </button>
                </div>
              </div>
            ))}

            <form className="inline-form" onSubmit={addChapter}>
              <input
                value={chapterName}
                onChange={e => setChapterName(e.target.value)}
                placeholder="Add new chapter…"
              />
              <button className="primary">Add</button>
            </form>
          </section>

          {chapter && metrics && (
            <section className="panel chapter-intelligence">
              <div className="panel-title">
                <div>
                  <span className="eyebrow">CHAPTER INTELLIGENCE</span>
                  <h3>{chapter.name}</h3>
                </div>
                <button
                  className="primary"
                  onClick={() => {
                    patch({
                      focusDraft: {
                        subjectId: chapter.subjectId,
                        chapterId: chapter.id,
                        intention: `Continue ${chapter.name}`
                      }
                    });
                    go?.('Focus');
                  }}
                  style={{ padding: '6px 14px', fontSize: 12 }}
                >
                  <I.Play /> Start focus
                </button>
              </div>

              <div className="chapter-metrics">
                <span>
                  Total Focus <b>{formatDuration(metrics.time)}</b>
                </span>
                <span>
                  Sessions <b>{metrics.sessions}</b>
                </span>
                <span>
                  Questions <b>{metrics.attempted}</b>
                </span>
                <span>
                  Accuracy <b>{metrics.accuracy == null ? '—' : `${metrics.accuracy}%`}</b>
                </span>
                <span>
                  Open Tasks{' '}
                  <b>
                    {
                      state.tasks.filter(row => row.chapterId === chapter.id && !row.done)
                        .length
                    }
                  </b>
                </span>
                <span>
                  Mistakes <b>{metrics.mistakes}</b>
                </span>
                <span>
                  Revisions <b>{metrics.revisions}</b>
                </span>
                <span>
                  Last Studied{' '}
                  <b>
                    {metrics.lastStudied
                      ? new Date(metrics.lastStudied).toLocaleDateString()
                      : '—'}
                  </b>
                </span>
              </div>

              <div className="topic-list">
                <h4>Topics Checklist</h4>
                {state.topics
                  .filter(row => row.chapterId === chapter.id)
                  .map(row => (
                    <div className="list-row" key={row.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                        <button
                          type="button"
                          className="checkbox"
                          onClick={() => cycleTopicStatus(row)}
                          title="Click to cycle status"
                        >
                          {row.status === 'STRONG' ? <I.Check /> : null}
                        </button>
                        <span>
                          <b>{row.name}</b>
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => cycleTopicStatus(row)}
                          style={{
                            fontSize: 11,
                            padding: '3px 8px',
                            background: row.status === 'STRONG' ? 'var(--emerald-subtle)' : 'var(--surface-hover)',
                            color: row.status === 'STRONG' ? 'var(--emerald)' : 'var(--text-secondary)',
                            borderRadius: 'var(--radius-xs)'
                          }}
                        >
                          {row.status || 'NOT_STARTED'}
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          title="Delete topic"
                          onClick={() => deleteTopic(row.id)}
                          style={{ color: 'var(--rose)', padding: 4 }}
                        >
                          <I.X style={{ width: 13, height: 13 }} />
                        </button>
                      </div>
                    </div>
                  ))}
                <form className="inline-form" onSubmit={addTopic}>
                  <input
                    value={topicName}
                    onChange={e => setTopicName(e.target.value)}
                    placeholder="Add topic to chapter…"
                  />
                  <button className="primary">Add topic</button>
                </form>
              </div>
            </section>
          )}
        </div>
      )}
    </>
  );
}

