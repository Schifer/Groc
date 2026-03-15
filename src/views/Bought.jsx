import React from 'react';
import { moveToPantry } from '../logic.js';
import { putItem } from '../db.js';

const styles = {
  list: { padding: '0 12px' },
  card: {
    background: '#1a1a1a', borderRadius: 12, padding: 14,
    marginBottom: 10, display: 'flex', justifyContent: 'space-between',
    alignItems: 'center'
  },
  name: { fontSize: 16, fontWeight: 600, color: '#eee' },
  meta: { fontSize: 12, color: '#888', marginTop: 4 },
  btn: {
    padding: '8px 16px', border: 'none', borderRadius: 8,
    background: '#2196f3', color: '#fff', fontSize: 13,
    fontWeight: 600, cursor: 'pointer'
  },
  empty: {
    textAlign: 'center', color: '#555', padding: 40, fontSize: 14
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
          </div>
          <button style={styles.btn} onClick={() => handleToPantry(item)}>
            → Pantry
          </button>
        </div>
      ))}
    </div>
  );
}