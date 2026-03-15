import React from 'react';
import { moveToBought } from '../logic.js';
import { putItem } from '../db.js';

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
  btn: {
    padding: '10px 20px', border: 'none', borderRadius: 20,
    background: '#00ff66', color: '#000', fontSize: 13,
    fontWeight: 700, cursor: 'pointer'
  },
  empty: {
    textAlign: 'center', color: '#444', padding: 50, fontSize: 15
  }
};

export default function ToBuy({ items, onRefresh }) {
  const toBuyItems = items.filter(i => i.status === 'to_buy');

  async function handleBought(item) {
    const updated = moveToBought(item);
    await putItem(updated);
    onRefresh();
  }

  if (toBuyItems.length === 0) {
    return <div style={styles.empty}>Nothing to buy right now</div>;
  }

  return (
    <div style={styles.list}>
      {toBuyItems.map(item => (
        <div key={item.id} style={styles.card}>
          <div>
            <div style={styles.name}>{item.name}</div>
            <div style={styles.meta}>{item.quantity} {item.unit}</div>
          </div>
          <button style={styles.btn} onClick={() => handleBought(item)}>
            Bought ✓
          </button>
        </div>
      ))}
    </div>
  );
}