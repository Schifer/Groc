import React, { useState, useRef } from 'react';
import { isRestockDue, moveToBuy } from '../logic.js';
import { putItem, deleteItem } from '../db.js';
import EditItem from '../EditItem.jsx';

const pulseKeyframes = `
@keyframes restockPulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 60, 60, 0.0); }
  50% { box-shadow: 0 0 14px 3px rgba(255, 60, 60, 0.2); }
  100% { box-shadow: 0 0 0 0 rgba(255, 60, 60, 0.0); }
}
`;

const styles = {
  list: { padding: '0 16px' },
  cardWrapper: {
    position: 'relative', marginBottom: 12, borderRadius: 16,
    overflow: 'hidden', background: '#0a0a0a'
  },
  cardWrapperDue: {
    position: 'relative', marginBottom: 12, borderRadius: 16,
    overflow: 'hidden', background: '#0a0a0a',
    animation: 'restockPulse 2.5s ease-in-out infinite'
  },
  actions: {
    position: 'absolute', right: 0, top: 0, bottom: 0,
    display: 'flex', alignItems: 'stretch',
    zIndex: 1
  },
  editBtn: {
    width: 70, border: 'none', background: '#2196f3',
    color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer'
  },
  delBtn: {
    width: 70, border: 'none', background: '#ef5350',
    color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer'
  },
  card: {
    position: 'relative', background: '#161616', borderRadius: 16,
    padding: '18px 16px', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', transition: 'transform 0.2s ease',
    zIndex: 2, border: 'none', outline: 'none'
  },
  cardDue: {
    position: 'relative', background: '#161616', borderRadius: 16,
    padding: '18px 16px', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', transition: 'transform 0.2s ease',
    zIndex: 2, borderLeft: '3px solid #ff3c3c'
  },
  name: { fontSize: 17, fontWeight: 700, color: '#fff' },
  meta: {
    fontSize: 12, color: '#f97316', marginTop: 5,
    textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600
  },
  cycle: {
    fontSize: 11, color: '#555', marginTop: 3
  },
  due: {
    fontSize: 10, color: '#ff3c3c', marginTop: 4, fontWeight: 700,
    letterSpacing: 0.3
  },
  toBuyBtn: {
    padding: '10px 20px', border: 'none', borderRadius: 20,
    fontSize: 13, fontWeight: 700, cursor: 'pointer',
    background: '#f97316', color: '#fff', flexShrink: 0
  },
  empty: {
    textAlign: 'center', color: '#444', padding: 50, fontSize: 15
  }
};

function SwipeCard({ children, onEdit, onDelete, isDue }) {
  const startX = useRef(0);
  const currentX = useRef(0);
  const cardRef = useRef(null);

  function handleTouchStart(e) {
    startX.current = e.touches[0].clientX;
    if (cardRef.current) {
      cardRef.current.style.transition = 'none';
    }
  }

  function handleTouchMove(e) {
    const diff = e.touches[0].clientX - startX.current;
    currentX.current = Math.min(0, Math.max(-140, diff));
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${currentX.current}px)`;
    }
  }

  function handleTouchEnd() {
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.2s ease';
      if (currentX.current < -50) {
        cardRef.current.style.transform = 'translateX(-140px)';
      } else {
        cardRef.current.style.transform = 'translateX(0)';
      }
    }
  }

  function resetSwipe() {
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.2s ease';
      cardRef.current.style.transform = 'translateX(0)';
    }
  }

  return (
    <div style={isDue ? styles.cardWrapperDue : styles.cardWrapper}>
      <div style={styles.actions}>
        <button style={styles.editBtn} onClick={() => { resetSwipe(); onEdit(); }}>Edit</button>
        <button style={styles.delBtn} onClick={() => { resetSwipe(); onDelete(); }}>Delete</button>
      </div>
      <div
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

export default function Pantry({ items, onRefresh }) {
  const [editingItem, setEditingItem] = useState(null);
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
    return <div style={styles.empty}>Pantry is empty. Tap + to add items.</div>;
  }

  return (
    <div style={styles.list}>
      <style>{pulseKeyframes}</style>
      {pantryItems.map(item => {
        const due = isRestockDue(item);
        return (
          <SwipeCard
            key={item.id}
            onEdit={() => setEditingItem(item)}
            onDelete={() => handleDelete(item.id)}
            isDue={due}
          >
            <div style={due ? styles.cardDue : styles.card}>
              <div>
                <div style={styles.name}>{item.name}</div>
                <div style={styles.meta}>
                  {item.quantity} {item.unit}
                </div>
                {item.avgRestockDays > 0 && (
                  <div style={styles.cycle}>~{item.avgRestockDays}d cycle</div>
                )}
                {due && <div style={styles.due}>⚠ RESTOCK DUE</div>}
              </div>
              <button
                style={styles.toBuyBtn}
                onClick={() => handleToBuy(item)}
              >
                To Buy
              </button>
            </div>
          </SwipeCard>
        );
      })}

      {editingItem && (
        <EditItem
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSaved={onRefresh}
        />
      )}
    </div>
  );
}