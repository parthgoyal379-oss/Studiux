import React, { useMemo, useState } from 'react';
import { useStore } from '../store.jsx';
import { mockAnalysis } from '../domain/product.js';
import { uid } from '../lib.js';
import * as I from '../icons.jsx';

const TYPES = [
  'Concept Gap',
  'Formula Recall',
  'Calculation',
  'Misread',
  'Time Management',
  'Guess',
  'Careless Error',
  'Other'
];

export default function MockLab() {
  const { state, patch } = useStore();
  const [tab, setTab] = useState('TESTS');
  const [selected, setSelected] = useState(state.mocks.at(-1)?.id || '');
  const [name, setName] = useState('');
  const [examId, setExamId] = useState('');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('');
  const [duration, setDuration] = useState(180);
  const [sectionSubject, setSectionSubject] = useState(state.subjects[0]?.id || '');
  const [attempted, setAttempted] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [mistakeType, setMistakeType] = useState(TYPES[0]);
  const [chapterId, setChapterId] = useState('');
  const [marksLost, setMarksLost] = useState(0);
  const [note, setNote] = useState('');

  const mock = state.mocks.find(row => row.id === selected);
  const analysis = useMemo(
    () => (mock ? mockAnalysis(mock, state.mockSections, state.mistakes) : null),
    [mock, state.mockSections, state.mistakes]
  );

  function addMock(e) {
    e.preventDefault();
    if (
      !name.trim() ||
      Number(maxScore) <= 0 ||
      Number(score) < 0 ||
      Number(score) > Number(maxScore)
    )
      return;
    const id = uid();
    patch(s => ({
      ...s,
      mocks: [
        ...s.mocks,
        {
          id,
          examId: examId || null,
          name: name.trim(),
          score: Number(score),
          maxScore: Number(maxScore),
          durationMinutes: Number(duration),
          takenAt: Date.now()
        }
      ]
    }));
    setSelected(id);
    setName('');
    setScore('');
    setMaxScore('');
    setExamId('');
  }

  function deleteMock(id) {
    patch(s => ({
      ...s,
      mocks: s.mocks.filter(m => m.id !== id),
      mockSections: s.mockSections.filter(sec => sec.mockTestId !== id),
      mistakes: s.mistakes.filter(mis => mis.mockTestId !== id)
    }));
    if (selected === id) {
      setSelected(state.mocks.find(m => m.id !== id)?.id || '');
    }
  }

  function addSection(e) {
    e.preventDefault();
    if (!selected || !sectionSubject) return;
    const subject = state.subjects.find(row => row.id === sectionSubject);
    patch(s => ({
      ...s,
      mockSections: [
        ...s.mockSections,
        {
          id: uid(),
          mockTestId: selected,
          subjectId: sectionSubject,
          name: subject?.name || 'Section',
          attempted: Number(attempted),
          correct: Number(correct),
          incorrect: Number(incorrect),
          skipped: Math.max(0, Number(attempted) - Number(correct) - Number(incorrect))
        }
      ]
    }));
  }

  function addMistake(e) {
    e.preventDefault();
    if (!note.trim()) return;
    patch(s => ({
      ...s,
      mistakes: [
        ...s.mistakes,
        {
          id: uid(),
          mockTestId: selected || null,
          chapterId: chapterId || null,
          type: mistakeType,
          notes: note.trim(),
          marksLost: Number(marksLost) || 0,
          resolvedAt: null,
          createdAt: Date.now()
        }
      ]
    }));
    setNote('');
    setMarksLost(0);
  }

  function toggleMistakeResolved(mistake) {
    patch(s => ({
      ...s,
      mistakes: s.mistakes.map(m =>
        m.id === mistake.id
          ? { ...m, resolvedAt: m.resolvedAt ? null : Date.now() }
          : m
      )
    }));
  }

  function deleteMistake(id) {
    patch(s => ({
      ...s,
      mistakes: s.mistakes.filter(m => m.id !== id)
    }));
  }

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">TEST ANALYTICS & MOCK LAB</span>
          <h1>Find where marks are actually going.</h1>
          <p>Dissect mock performance, subject accuracy, and mistake classification.</p>
        </div>
      </div>

      <div className="segmented">
        {['TESTS', 'ANALYSIS', 'MISTAKE BOOK'].map(value => (
          <button
            className={tab === value ? 'active' : ''}
            onClick={() => setTab(value)}
            key={value}
          >
            {value}
          </button>
        ))}
      </div>

      {tab === 'TESTS' && (
        <>
          <section className="panel">
            <div className="panel-title">
              <h3>MOCK TEST LOG</h3>
              <span>{state.mocks.length} tests logged</span>
            </div>
            {state.mocks
              .slice()
              .reverse()
              .map(row => {
                const pctVal = Math.round((row.score / row.maxScore) * 100);
                const exam = state.exams.find(e => e.id === row.examId);
                return (
                  <div
                    className={`mock-select ${selected === row.id ? 'active' : ''}`}
                    key={row.id}
                    onClick={() => setSelected(row.id)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                  >
                    <div>
                      <b>{row.name}</b>
                      <small style={{ display: 'block' }}>
                        {new Date(row.takenAt).toLocaleDateString()} ·{' '}
                        {row.durationMinutes || '—'}m duration
                        {exam && ` · Target: ${exam.name}`}
                      </small>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ fontSize: 18, color: 'var(--text-primary)' }}>
                          {row.score} / {row.maxScore}
                        </strong>
                        <small style={{ display: 'block', fontSize: 11, color: 'var(--accent-light)' }}>
                          {pctVal}%
                        </small>
                      </div>
                      <button
                        type="button"
                        className="icon-button"
                        title="Delete mock"
                        onClick={e => {
                          e.stopPropagation();
                          deleteMock(row.id);
                        }}
                        style={{ color: 'var(--rose)', padding: 4 }}
                      >
                        <I.X style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  </div>
                );
              })}
          </section>

          <form className="planner-form" onSubmit={addMock}>
            <label>
              Mock Name
              <input
                value={name}
                maxLength="160"
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Full Syllabus Mock 01"
                required
              />
            </label>
            <label>
              Linked Target Exam (optional)
              <select value={examId} onChange={e => setExamId(e.target.value)}>
                <option value="">No specific exam</option>
                {state.exams.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({new Date(e.startsAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Score Obtained
              <input
                type="number"
                min="0"
                value={score}
                onChange={e => setScore(e.target.value)}
                placeholder="185"
                required
              />
            </label>
            <label>
              Max Score
              <input
                type="number"
                min="1"
                value={maxScore}
                onChange={e => setMaxScore(e.target.value)}
                placeholder="300"
                required
              />
            </label>
            <label>
              Duration (mins)
              <input
                type="number"
                min="1"
                value={duration}
                onChange={e => setDuration(e.target.value)}
              />
            </label>
            <button className="primary" style={{ height: 42 }}>
              <I.Plus /> Log Mock
            </button>
          </form>
        </>
      )}

      {tab === 'ANALYSIS' &&
        (!mock ? (
          <div className="empty">
            <h3>Choose or log a mock first</h3>
            <p>Select a test from the Tests tab to view deep diagnostic breakdowns.</p>
          </div>
        ) : (
          <>
            <div className="today-summary">
              <div className="metric">
                <span>SCORE PERCENT</span>
                <b>{analysis.percentage}%</b>
              </div>
              <div className="metric">
                <span>QUESTION ACCURACY</span>
                <b>{analysis.accuracy == null ? '—' : `${analysis.accuracy}%`}</b>
              </div>
              <div className="metric">
                <span>ATTEMPTED</span>
                <b>{analysis.attempted}</b>
              </div>
              <div className="metric">
                <span>TAGGED MARKS LOST</span>
                <b>−{analysis.marksLost}</b>
              </div>
            </div>

            <div className="analytics-grid">
              <section className="panel">
                <div className="panel-title">
                  <h3>SUBJECT BREAKDOWN</h3>
                  <span>{mock.name}</span>
                </div>
                {state.mockSections
                  .filter(row => row.mockTestId === mock.id)
                  .map(row => (
                    <div className="analysis-row" key={row.id}>
                      <b>{row.name}</b>
                      <span>
                        {row.correct}/{row.attempted} correct
                      </span>
                      <strong>
                        {row.attempted
                          ? Math.round((row.correct / row.attempted) * 100)
                          : 0}
                        %
                      </strong>
                    </div>
                  ))}
                <form className="compact-form" onSubmit={addSection} style={{ marginTop: 14 }}>
                  <select
                    value={sectionSubject}
                    onChange={e => setSectionSubject(e.target.value)}
                  >
                    {state.subjects.map(row => (
                      <option key={row.id} value={row.id}>
                        {row.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    value={attempted}
                    onChange={e => setAttempted(e.target.value)}
                    aria-label="Attempted"
                    placeholder="Attempted"
                  />
                  <input
                    type="number"
                    min="0"
                    max={attempted}
                    value={correct}
                    onChange={e => setCorrect(e.target.value)}
                    aria-label="Correct"
                    placeholder="Correct"
                  />
                  <input
                    type="number"
                    min="0"
                    max={attempted}
                    value={incorrect}
                    onChange={e => setIncorrect(e.target.value)}
                    aria-label="Incorrect"
                    placeholder="Incorrect"
                  />
                  <button className="primary">Add Section</button>
                </form>
              </section>

              <section className="panel">
                <div className="panel-title">
                  <h3>MISTAKE CLASSIFICATION</h3>
                  <span>Root cause distribution</span>
                </div>
                {Object.entries(analysis.distribution).map(([type, count]) => (
                  <div className="analysis-row" key={type}>
                    <b>{type}</b>
                    <strong>{count} questions</strong>
                  </div>
                ))}
                {!Object.keys(analysis.distribution).length && (
                  <p className="muted">Tag mistakes below to reveal error patterns.</p>
                )}
                <form className="compact-form" onSubmit={addMistake} style={{ marginTop: 14 }}>
                  <select
                    value={mistakeType}
                    onChange={e => setMistakeType(e.target.value)}
                  >
                    {TYPES.map(value => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                  <select
                    value={chapterId}
                    onChange={e => setChapterId(e.target.value)}
                  >
                    <option value="">No chapter</option>
                    {state.chapters.map(row => (
                      <option key={row.id} value={row.id}>
                        {row.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    value={marksLost}
                    onChange={e => setMarksLost(e.target.value)}
                    placeholder="Marks lost"
                  />
                  <input
                    value={note}
                    maxLength="1000"
                    onChange={e => setNote(e.target.value)}
                    placeholder="What went wrong and what will you change?"
                  />
                  <button className="primary">Tag Mistake</button>
                </form>
              </section>
            </div>
          </>
        ))}

      {tab === 'MISTAKE BOOK' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section className="panel">
            <div className="panel-title">
              <h3>REPEATED PATTERNS & MISTAKE LOG</h3>
              <span>{state.mistakes.length} entries</span>
            </div>
            {state.mistakes
              .slice()
              .reverse()
              .map(row => (
                <div className="mistake-row" key={row.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                    <button
                      type="button"
                      className="checkbox"
                      onClick={() => toggleMistakeResolved(row)}
                      title={row.resolvedAt ? 'Resolved (click to reopen)' : 'Mark as resolved'}
                    >
                      {row.resolvedAt ? <I.Check /> : null}
                    </button>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, background: 'var(--surface-hover)', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                          {row.type}
                        </span>
                        <b>
                          {state.chapters.find(chapter => chapter.id === row.chapterId)?.name ||
                            'General Pattern'}
                        </b>
                        {row.resolvedAt && (
                          <span style={{ fontSize: 11, color: 'var(--emerald)', fontWeight: 600 }}>
                            ✓ Resolved
                          </span>
                        )}
                      </div>
                      <small style={{ display: 'block', color: 'var(--text-secondary)' }}>{row.notes}</small>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ color: 'var(--rose)' }}>
                      {row.marksLost ? `−${row.marksLost}` : '—'}
                    </strong>
                    <button
                      type="button"
                      className="icon-button"
                      title="Delete mistake"
                      onClick={() => deleteMistake(row.id)}
                      style={{ color: 'var(--rose)', padding: 4 }}
                    >
                      <I.X style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </div>
              ))}
            {!state.mistakes.length && (
              <div className="empty">
                <h3>No mistakes logged</h3>
                <p>Tag errors from mock exams to build your mistake retrospective book.</p>
              </div>
            )}
          </section>

          <form className="compact-form" onSubmit={addMistake} style={{ background: 'var(--surface)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <span className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>LOG DIRECT MISTAKE</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <select
                value={mistakeType}
                onChange={e => setMistakeType(e.target.value)}
              >
                {TYPES.map(value => (
                  <option key={value}>{value}</option>
                ))}
              </select>
              <select
                value={chapterId}
                onChange={e => setChapterId(e.target.value)}
              >
                <option value="">No chapter</option>
                {state.chapters.map(row => (
                  <option key={row.id} value={row.id}>
                    {row.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                value={marksLost}
                onChange={e => setMarksLost(e.target.value)}
                placeholder="Marks lost"
                style={{ width: 100 }}
              />
              <input
                value={note}
                maxLength="1000"
                onChange={e => setNote(e.target.value)}
                placeholder="What went wrong and what will you change?"
                style={{ flex: 1, minWidth: 200 }}
                required
              />
              <button className="primary">Log Mistake</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

