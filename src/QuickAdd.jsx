import React, { useState } from 'react';
import { putItem } from './db.js';

const UNITS = ['pcs', 'kg', 'g', 'L', 'ml', 'box', 'can', 'pack', 'dozen', 'bottle', 'pouch', 'bag'];

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    zIndex: 100
  },
  modal: {
    background: '#1a1a1a', width: '100%', maxWidth: 420,
    borderRadius: '16px 16px 0 0', padding: 20
  },
  title: {
    fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#fff'
  },
  label: {
    fontSize: 12, color: '#888', marginBottom: 4, display: 'block'
  },
  input: {
    width: '100%', padding: '12px 14px', marginBottom: 14,
    background: '#222', border: '1px solid #333', borderRadius: 8,
    color: '#eee', fontSize: 16, outline: 'none'
  },
  row: {
    display: 'flex', gap: 10, marginBottom: 14
  },
  halfCol: {
    flex: 1, minWidth: 0
  },
  halfInput: {
    width: '100%', padding: '12px 14px',
    background: '#222', border: '1px solid #333', borderRadius: 8,
    color: '#eee', fontSize: 16, outline: 'none'
  },
  select: {
    width: '100%', padding: '12px 14px',
    background: '#222', border: '1px solid #333', borderRadius: 8,
    color: '#eee', fontSize: 16, outline: 'none',
    appearance: 'none', WebkitAppearance: 'none'
  },
  btn: {
    width: '100%', padding: 14, border: 'none', borderRadius: 10,
    background: '#4caf50', color: '#fff', fontSize: 16,
    fontWeight: 600, cursor: 'pointer', marginTop: 6
  },
  cancel: {
    width: '100%', padding: 12, border: 'none', borderRadius: 10,
    background: 'transparent', color: '#888', fontSize: 14,
    cursor: 'pointer', marginTop: 4
  }
};

export default function QuickAdd({ onClose, onAdded }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;

    const item = {
      id: crypto.randomUUID(),
      name: trimmed,
      quantity: Number(quantity) || 1,
      unit,
      status: 'pantry',
      restockHistory: [],
      avgRestockDays: 0
    };

    await putItem(item);
    onAdded();
    onClose();
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.title}>Quick Add</div>
        <span style={styles.label}>Item name</span>
        <input
          style={styles.input}
          placeholder="e.g. Rice, Milk, Eggs"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />
        <div style={styles.row}>
          <div style={styles.halfCol}>
            <span style={styles.label}>Quantity</span>
            <input
              style={styles.halfInput}
              placeholder="1"
              type="number"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
            />
          </div>
          <div style={styles.halfCol}>
            <span style={styles.label}>Unit</span>
            <select
              style={styles.select}
              value={unit}
              onChange={e => setUnit(e.target.value)}
            >
              {UNITS.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
        <button style={styles.btn} onClick={handleAdd}>Add to Pantry</button>
        <button style={styles.cancel} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}