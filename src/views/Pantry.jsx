import React from 'react';
import { isRestockDue, moveToBuy } from '../logic.js';
import { putItem, deleteItem } from '../db.js';

const styles = {
  list: { padding: '0 12px' },
  card: {
    background: '#1a1a1a', borderRadius: 12, padding: 14,
    marginBottom: 10, display: 'flex', justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardDue: {
    background: '#1a1a1a', borderRadius: 12, padding: 14,
    marginBottom: 10, display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', borderLeft: '3px solid #ff9800'
  },
  name: { fontSize: 16, fontWeight: 600, color: '#eee' },
  meta: { fontSize: 12, color: '#888', marginTop: 4 },
  due: { fontSize: 11, color: '#ff9800', marginTop: 4, fontWeight: 600 },
  actions: { display: 'flex', gap: 8 },
  btn: {
    padding: '8px 14px', border: 'none', borderRadius: 8,
    fontSize: 13, fontWeight: 600, cursor: 'pointer'
  },
  toBuyBtn: { background: '#333', color: '#ffa726' },
  delBtn: { background: '#2a1a1a', color: '#ef5350' },
  empty: {
    textAlign: 'center', color: '#555', padding: 40, fontSize: 14
  }
};

export default function Pantry({ items, onRefresh }) {
  const pantryItems = items.filter(i => i.status === 'pantry');

  async function handleToBuy(item) {
    const updated = moveToBuy(item);
    await putItem(updated);
    onRefresh();
  }

  async function handleDelete(id) {
    await deleteItem(id);
    onRefresh();
  }

  if (pantryItems.length === 0) {
    return <div style={styles.empty}>Pantry is empty. Add items with +</div>;
  }

  return (
    <div style={styles.list}>
      {pantryItems.map(item => {
        const due = isRestockDue(item);
        return (
          <div key={item.id} style={due ? styles.cardDue : styles.card}>
            <div>
              <div style={styles.name}>{item.name}</div>
              <div style={styles.meta}>
                {item.quantity} {item.unit}
                {item.avgRestockDays > 0 && ` · ~${item.avgRestockDays}d cycle`}
              </div>
              {due && <div style={styles.due}>⚠ Restock due</div>}
            </div>
            <div style={styles.actions}>
              <button
                style={{ ...styles.btn, ...styles.toBuyBtn }}
                onClick={() => handleToBuy(item)}
              >
                To Buy
              </button>
              <button
                style={{ ...styles.btn, ...styles.delBtn }}
                onClick={() => handleDelete(item.id)}
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}