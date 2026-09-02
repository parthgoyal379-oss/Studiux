import React, { useMemo, useState } from 'react';
import { useStore } from '../store.jsx';
import { DAY, formatDuration, uid } from '../lib.js';
import { examReadiness } from '../domain/release3.js';
import * as I from '../icons.jsx';

export default function ExamsExperience() {
  const { state, patch } = useStore();
  const [selected, setSelected] = useState(state.exams[0]?.id || '');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('Entrance');
  const [target, setTarget] = useState('');
  const [notes, setNotes] = useState('');
  const [subjectIds, setSubjectIds] = useState([]);
  const [editingExam, setEditingExam] = useState(null);

  const exam = state.exams.find(row => row.id === selected);

  const readiness = useMemo(() => {
    if (!exam) return null;
    const relevant = exam.subjectIds?.length
      ? state.subjects.filter(row => exam.subjectIds.includes(row.id))
      : state.subjects;
    const chapterIds = state.chapters
      .filter(row => relevant.some(subject => subject.id === row.subjectId))
      .map(row => row.id);
    const chapters = state.chapters.filter(row => chapterIds.includes(row.id));
    const syllabusCoverage = chapters.length
      ? chapters.filter(row => row.status === 'STRONG').length / chapters.length
      : 0;
    const revisionRelevant = state.revisionItems.filter(item => {
      const topic = state.topics.find(row => row.id === item.topicId);
      return chapterIds.includes(item.chapterId || topic?.chapterId);
    });
    const revisionCoverage = revisionRelevant.length
      ? revisionRelevant.filter(row => row.lastRevisedAt).length / revisionRelevant.length
      : 0;
    const recent = state.sessions.filter(
      row =>
        (row.endedAt || 0) >= Date.now() - 30 * DAY &&
        (!exam.subjectIds?.length || exam.subjectIds.includes(row.subjectId))
    );
    const practiceRate = recent.length
      ? recent.filter(row => (row.questions || 0) > 0).length / recent.length
      : 0;
    const mocks = state.mocks
      .filter(row => row.examId === exam.id || (!row.examId && !exam.subjectIds?.length))
      .sort((a, b) => b.takenAt - a.takenAt);
    const mockScore = mocks[0]?.maxScore
      ? mocks[0].score / mocks[0].maxScore
      : null;
    const days = new Set(
      state.sessions
        .filter(row => (row.endedAt || 0) >= Date.now() - 7 * DAY)
        .map(row => new Date(row.endedAt).toDateString())
    ).size;

    return {
      ...examReadiness({
        syllabusCoverage,
        revisionCoverage,
        practiceRate,
        mockScore,
        consistency: days / 7
      }),
      syllabusCoverage,
      revisionCoverage,
      practiceRate,
      mockScore,
      recentMs: recent.reduce((sum, row) => sum + (row.duration || 0), 0),
      mocks: mocks.length,
      mockList: mocks
    };
  }, [exam, state]);

  function toggle(id) {
    setSubjectIds(rows =>
      rows.includes(id) ? rows.filter(value => value !== id) : [...rows, id]
    );
  }

  function add(e) {
    e.preventDefault();
    if (!name.trim() || !date) return;
    const id = uid();
    patch(s => ({
      ...s,
      exams: [
        ...s.exams,
        {
          id,
          name: name.trim(),
          startsAt: +new Date(`${date}T09:00`),
          category: type,
          examType: type,
          target: target.trim() || null,
          notes: notes.trim() || null,
          subjectIds
        }
      ]
    }));
    setSelected(id);
    setName('');
    setDate('');
    setTarget('');
    setNotes('');
    setSubjectIds([]);
  }

  function deleteExam(id) {
    patch(s => ({
      ...s,
      exams: s.exams.filter(e => e.id !== id)
    }));
    if (selected === id) {
      setSelected(state.exams.find(e => e.id !== id)?.id || '');
    }
  }

  function saveEdit(e) {
    e.preventDefault();
    if (!editingExam) return;
    patch(s => ({
      ...s,
      exams: s.exams.map(e => (e.id === editingExam.id ? editingExam : e))
    }));
    setEditingExam(null);
  }

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">TARGET EXAMS</span>
          <h1>Keep the deadline useful, not frightening.</h1>
          <p>Readiness signals calculated from syllabus coverage, revision, and practice.</p>
        </div>
      </div>

      <div className="exam-layout">
        <section className="panel">
          <div className="panel-title">
            <h3>Registered Exams</h3>
            <span>{state.exams.length} total</span>
          </div>

          {state.exams
            .slice()
            .sort((a, b) => a.startsAt - b.startsAt)
            .map(row => {
              const daysLeft = Math.max(0, Math.ceil((row.startsAt - Date.now()) / DAY));
              return (
                <div
                  className={`exam-select ${selected === row.id ? 'active' : ''}`}
                  key={row.id}
                  onClick={() => setSelected(row.id)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '12px 14px' }}
                >
                  <div style={{ flex: 1 }}>
                    <b>{row.name}</b>
                    <small style={{ display: 'block' }}>
                      {row.examType || row.category || 'Exam'} ·{' '}
                      {new Date(row.startsAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </small>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ fontSize: 20, color: daysLeft <= 14 ? 'var(--rose)' : 'var(--accent-light)' }}>
                        {daysLeft}
                      </strong>
                      <small style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)' }}>
                        DAYS LEFT
                      </small>
                    </div>
                    <button
                      type="button"
                      className="icon-button"
                      title="Edit exam"
                      onClick={e => {
                        e.stopPropagation();
                        setEditingExam(row);
                      }}
                      style={{ padding: 4 }}
                    >
                      <I.SlidersHorizontal style={{ width: 14, height: 14 }} />
                    </button>
                    <button
                      type="button"
                      className="icon-button"
                      title="Delete exam"
                      onClick={e => {
                        e.stopPropagation();
                        deleteExam(row.id);
                      }}
                      style={{ color: 'var(--rose)', padding: 4 }}
                    >
                      <I.X style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </div>
              );
            })}

          <form className="compact-form" onSubmit={add} style={{ marginTop: 20 }}>
            <label>
              Exam Name
              <input
                value={name}
                maxLength="160"
                onChange={e => setName(e.target.value)}
                placeholder="e.g. JEE Advanced 2026"
                required
              />
            </label>
            <div className="form-row">
              <label>
                Target Date
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />
              </label>
              <label>
                Category
                <select value={type} onChange={e => setType(e.target.value)}>
                  <option>Entrance</option>
                  <option>University</option>
                  <option>School</option>
                  <option>Certification</option>
                  <option>Other</option>
                </select>
              </label>
            </div>
            <label>
              Target Score / Rank (optional)
              <input
                value={target}
                maxLength="120"
                onChange={e => setTarget(e.target.value)}
                placeholder="e.g. Top 500 / 99.5 percentile"
              />
            </label>
            <fieldset style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: 12, margin: '12px 0' }}>
              <legend style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Included Subjects</legend>
              {state.subjects.map(row => (
                <label className="toggle-row" key={row.id}>
                  <input
                    type="checkbox"
                    checked={subjectIds.includes(row.id)}
                    onChange={() => toggle(row.id)}
                  />
                  <span>{row.name}</span>
                </label>
              ))}
            </fieldset>
            <label>
              Strategy Notes
              <textarea
                value={notes}
                maxLength="2000"
                onChange={e => setNotes(e.target.value)}
                placeholder="Key focuses, weak areas, test center info…"
              />
            </label>
            <button className="primary" style={{ width: '100%', marginTop: 8 }}>
              <I.Plus /> Add Target Exam
            </button>
          </form>
        </section>

        {exam && readiness && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <section className="panel exam-readiness">
              <div className="panel-title">
                <div>
                  <span className="eyebrow">MULTI-SIGNAL READINESS</span>
                  <h3>{exam.name}</h3>
                </div>
                <strong style={{ fontSize: 28, color: 'var(--accent-light)', fontFamily: 'var(--font-mono)' }}>
                  {readiness.score == null ? '—' : `${readiness.score}%`}
                </strong>
              </div>

              <p className="muted" style={{ margin: '8px 0 16px', lineHeight: 1.5 }}>
                {readiness.explanation}
              </p>

              <div className="analytics-list">
                <p>
                  <span>Syllabus Mastered (Strong)</span>
                  <b>{Math.round(readiness.syllabusCoverage * 100)}%</b>
                </p>
                <p>
                  <span>Active Revision Coverage</span>
                  <b>{Math.round(readiness.revisionCoverage * 100)}%</b>
                </p>
                <p>
                  <span>Practice Session Share</span>
                  <b>{Math.round(readiness.practiceRate * 100)}%</b>
                </p>
                <p>
                  <span>Latest Mock Score</span>
                  <b>
                    {readiness.mockScore == null
                      ? '—'
                      : `${Math.round(readiness.mockScore * 100)}%`}
                  </b>
                </p>
                <p>
                  <span>Recent Focus Allocation (30d)</span>
                  <b>{formatDuration(readiness.recentMs)}</b>
                </p>
              </div>
            </section>

            {readiness.mockList && readiness.mockList.length > 0 && (
              <section className="panel">
                <div className="panel-title">
                  <h3>LINKED MOCK TESTS</h3>
                  <span>{readiness.mockList.length} recorded</span>
                </div>
                {readiness.mockList.map(m => (
                  <div className="list-row" key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <b>{m.name}</b>
                      <small style={{ display: 'block', color: 'var(--text-secondary)' }}>
                        {new Date(m.takenAt).toLocaleDateString()}
                      </small>
                    </div>
                    <strong>{m.score} / {m.maxScore} ({Math.round((m.score / m.maxScore) * 100)}%)</strong>
                  </div>
                ))}
              </section>
            )}
          </div>
        )}
      </div>

      {editingExam && (
        <div className="overlay">
          <form className="import-dialog" role="dialog" aria-modal="true" onSubmit={saveEdit}>
            <span className="eyebrow">EDIT EXAM</span>
            <h2>Update Exam Details</h2>
            <label>
              Exam Name
              <input
                value={editingExam.name}
                onChange={e => setEditingExam({ ...editingExam, name: e.target.value })}
                required
              />
            </label>
            <div className="form-row">
              <label>
                Target Date
                <input
                  type="date"
                  value={new Date(editingExam.startsAt).toISOString().slice(0, 10)}
                  onChange={e =>
                    setEditingExam({
                      ...editingExam,
                      startsAt: +new Date(`${e.target.value}T09:00`)
                    })
                  }
                  required
                />
              </label>
              <label>
                Category
                <select
                  value={editingExam.examType || editingExam.category || 'Entrance'}
                  onChange={e => setEditingExam({ ...editingExam, examType: e.target.value, category: e.target.value })}
                >
                  <option>Entrance</option>
                  <option>University</option>
                  <option>School</option>
                  <option>Certification</option>
                  <option>Other</option>
                </select>
              </label>
            </div>
            <label>
              Target Score / Rank
              <input
                value={editingExam.target || ''}
                onChange={e => setEditingExam({ ...editingExam, target: e.target.value })}
              />
            </label>
            <label>
              Notes
              <textarea
                value={editingExam.notes || ''}
                onChange={e => setEditingExam({ ...editingExam, notes: e.target.value })}
              />
            </label>
            <div className="dialog-actions">
              <button type="button" onClick={() => setEditingExam(null)}>
                Cancel
              </button>
              <button className="primary">Save changes</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

