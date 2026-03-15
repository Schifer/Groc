import React from 'react';
import { moveToPantry } from '../logic.js';
import { putItem } from '../db.js';

function timeAgo(timestamp) {
  if (!timestamp) return '';
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 5) return `${weeks}w ago`;
  return `${months}mo ago`;
}

function getBoughtTimestamp(item) {
  const h = item.restockHistory;
  if (!h || h.length === 0) return null;
  return h[h.length - 1].boughtAt || null;
}

const styles = {
  list: { padding: '0 16px' },
  card: {
    background: '#141414', borderRadius: 16, padding: '18px 16px',
    marginBottom: 12, display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', border: '1px solid #1e1e1e'
  },
  name: { fontSize: 17, fontWeight: 700, color: '#fff' },
  meta: {
    fontSize: 12, color: '#f97316', marginTop: 5,
    textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600
  },
  time: {
    fontSize: 11, color: '#00ff66', marginTop: 4, fontWeight: 600
  },
  btn: {
    padding: '10px 20px', border: 'none', borderRadius: 20,
    background: '#2196f3', color: '#fff', fontSize: 13,
    fontWeight: 700, cursor: 'pointer'
  },
  empty: {
    textAlign: 'center', color: '#444', padding: 50, fontSize: 15
  }
};

export default function Bought({ items, onRefresh }) {
  const boughtItems = items.filter(i => i.status === 'bought');

  async function handleToPantry(item) {
    const updated = moveToPantry(item);
    await putItem(updated);
    onRefresh();
  }

  if (boughtItems.length === 0) {
    return <div style={styles.empty}>No recently bought items</div>;
  }

  return (
    <div style={styles.list}>
      {boughtItems.map(item => (
        <div key={item.id} style={styles.card}>
          <div>
            <div style={styles.name}>{item.name}</div>
            <div style={styles.meta}>{item.quantity} {item.unit}</div>
            <div style={styles.time}>Bought {timeAgo(getBoughtTimestamp(item))}</div>
          </div>
          <button style={styles.btn} onClick={() => handleToPantry(item)}>
            → Pantry
          </button>
        </div>
      ))}
    </div>
  );
}