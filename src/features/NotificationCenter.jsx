import React from 'react';
import { useStore } from '../store.jsx';
import * as I from '../icons.jsx';

export default function NotificationCenter({ close, go }) {
  const { state, patch } = useStore();
  const rows = [...state.notifications].sort(
    (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
  );

  function read(row) {
    patch(s => ({
      ...s,
      notifications: s.notifications.map(item =>
        item.id === row.id ? { ...item, readAt: item.readAt || Date.now() } : item
      )
    }));
    const page = row.data?.page;
    if (page) {
      go?.(page);
      close();
    }
  }

  return (
    <div className="notification-backdrop" onMouseDown={close}>
      <aside
        className="notification-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
        onMouseDown={e => e.stopPropagation()}
      >
        <div className="panel-title">
          <div>
            <span className="eyebrow">INBOX</span>
            <h3>Notifications</h3>
          </div>
          <button className="icon-button" onClick={close} aria-label="Close">
            <I.X />
          </button>
        </div>

        {rows.length ? (
          rows.map(row => (
            <button
              className={`notification-row ${row.readAt ? '' : 'unread'}`}
              key={row.id}
              onClick={() => read(row)}
            >
              <i />
              <span>
                <b>{row.title}</b>
                <small>{row.body}</small>
                {row.createdAt && (
                  <time style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                    {new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </time>
                )}
              </span>
            </button>
          ))
        ) : (
          <div className="empty" style={{ padding: '60px 20px' }}>
            <h3>Nothing needs attention</h3>
            <p>
              Revision reminders, upcoming exam milestones, study circle challenges, and sync updates will appear here.
            </p>
          </div>
        )}

        {rows.some(row => !row.readAt) && (
          <button
            className="text-button"
            onClick={() =>
              patch(s => ({
                ...s,
                notifications: s.notifications.map(row => ({
                  ...row,
                  readAt: row.readAt || Date.now()
                }))
              }))
            }
            style={{ marginTop: 12, justifySelf: 'center', fontSize: 12 }}
          >
            Mark all as read
          </button>
        )}
      </aside>
    </div>
  );
}
