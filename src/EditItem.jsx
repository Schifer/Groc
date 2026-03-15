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
    flex: 1, minWidth: 0, position: 'relative'
  },
  halfInput: {
    width: '100%', padding: '12px 14px',
    background: '#222', border: '1px solid #333', borderRadius: 8,
    color: '#eee', fontSize: 16, outline: 'none'
  },
  unitBtn: {
    width: '100%', padding: '12px 14px',
    background: '#222', border: '1px solid #333', borderRadius: 8,
    color: '#eee', fontSize: 16, textAlign: 'left', cursor: 'pointer'
  },
  unitDropdown: {
    position: 'absolute', bottom: '100%', left: 0, right: 0,
    background: '#222', border: '1px solid #333', borderRadius: 8,
    maxHeight: 180, overflowY: 'auto', zIndex: 10,
    marginBottom: 4
  },
  unitOption: {
    padding: '10px 14px', color: '#eee', fontSize: 15,
    cursor: 'pointer', borderBottom: '1px solid #2a2a2a'
  },
  unitOptionActive: {
    padding: '10px 14px', color: '#2196f3', fontSize: 15,
    cursor: 'pointer', borderBottom: '1px solid #2a2a2a',
    background: '#1a2230', fontWeight: 600
  },
  btn: {
    width: '100%', padding: 14, border: 'none', borderRadius: 10,
    background: '#2196f3', color: '#fff', fontSize: 16,
    fontWeight: 600, cursor: 'pointer', marginTop: 6
  },
  cancel: {
    width: '100%', padding: 12, border: 'none', borderRadius: 10,
    background: 'transparent', color: '#888', fontSize: 14,
    cursor: 'pointer', marginTop: 4
  },
  confirmOverlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 200
  },
  confirmBox: {
    background: '#1a1a1a', borderRadius: 14, padding: 20,
    width: '85%', maxWidth: 340
  },
  confirmTitle: {
    fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 10
  },
  confirmText: {
    fontSize: 14, color: '#aaa', marginBottom: 18, lineHeight: 1.5
  },
  confirmBtns: {
    display: 'flex', gap: 10
  },
  confirmKeep: {
    flex: 1, padding: 12, border: 'none', borderRadius: 8,
    background: '#333', color: '#eee', fontSize: 14,
    fontWeight: 600, cursor: 'pointer'
  },
  confirmReset: {
    flex: 1, padding: 12, border: 'none', borderRadius: 8,
    background: '#ef5350', color: '#fff', fontSize: 14,
    fontWeight: 600, cursor: 'pointer'
  }
};

export default function EditItem({ item, onClose, onSaved }) {
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(String(item.quantity));
  const [unit, setUnit] = useState(item.unit);
  const [showUnits, setShowUnits] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);

  function buildUpdatedItem(resetHistory) {
    return {
      ...item,
      name: name.trim(),
      quantity: Number(quantity) || 1,
      unit,
      restockHistory: resetHistory ? [] : item.restockHistory,
      avgRestockDays: resetHistory ? 0 : item.avgRestockDays
    };
  }

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;

    const qtyChanged = Number(quantity) !== item.quantity;
    const unitChanged = unit !== item.unit;
    const hasHistory = item.restockHistory.length > 0;

    if ((qtyChanged || unitChanged) && hasHistory) {
      setPendingItem(true);
      setShowConfirm(true);
      return;
    }

    const updated = buildUpdatedItem(false);
    await putItem(updated);
    onSaved();
    onClose();
  }

  async function handleConfirm(reset) {
    const updated = buildUpdatedItem(reset);
    await putItem(updated);
    onSaved();
    onClose();
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => { e.stopPropagation(); setShowUnits(false); }}>
        <div style={styles.title}>Edit Item</div>
        <span style={styles.label}>Item name</span>
        <input
          style={styles.input}
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />
        <div style={styles.row}>
          <div style={styles.halfCol}>
            <span style={styles.label}>Quantity</span>
            <input
              style={styles.halfInput}
              type="number"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
            />
          </div>
          <div style={styles.halfCol} onClick={e => e.stopPropagation()}>
            <span style={styles.label}>Unit</span>
            <button
              style={styles.unitBtn}
              onClick={() => setShowUnits(!showUnits)}
            >
              {unit} ▾
            </button>
            {showUnits && (
              <div style={styles.unitDropdown}>
                {UNITS.map(u => (
                  <div
                    key={u}
                    style={u === unit ? styles.unitOptionActive : styles.unitOption}
                    onClick={() => { setUnit(u); setShowUnits(false); }}
                  >
                    {u}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <button style={styles.btn} onClick={handleSave}>Save Changes</button>
        <button style={styles.cancel} onClick={onClose}>Cancel</button>
      </div>

      {showConfirm && (
        <div style={styles.confirmOverlay} onClick={() => setShowConfirm(false)}>
          <div style={styles.confirmBox} onClick={e => e.stopPropagation()}>
            <div style={styles.confirmTitle}>Reset restock tracking?</div>
            <div style={styles.confirmText}>
              You changed the quantity or unit. Old restock data may not match your new buying pattern.
            </div>
            <div style={styles.confirmBtns}>
              <button style={styles.confirmKeep} onClick={() => handleConfirm(false)}>
                Keep History
              </button>
              <button style={styles.confirmReset} onClick={() => handleConfirm(true)}>
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}