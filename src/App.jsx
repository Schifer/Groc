import React, { useState, useEffect, useCallback } from 'react';
import { getAllItems, seedIfEmpty } from './db.js';
import { requestNotificationPermission, checkAndNotify } from './logic.js';
import Pantry from './views/Pantry.jsx';
import ToBuy from './views/ToBuy.jsx';
import Bought from './views/Bought.jsx';
import QuickAdd from './QuickAdd.jsx';

const TABS = ['Pantry', 'To Buy', 'Bought'];

const styles = {
  container: {
    maxWidth: 420, margin: '0 auto', minHeight: '100vh',
    display: 'flex', flexDirection: 'column', background: '#111'
  },
  header: {
    padding: '16px 16px 0', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center'
  },
  logo: { fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -0.5 },
  addBtn: {
    width: 40, height: 40, borderRadius: '50%', border: 'none',
    background: '#4caf50', color: '#fff', fontSize: 24,
    fontWeight: 600, cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', lineHeight: 1
  },
  tabs: {
    display: 'flex', padding: '12px 12px 0', gap: 4
  },
  tab: {
    flex: 1, padding: '10px 0', textAlign: 'center',
    border: 'none', borderRadius: '8px 8px 0 0',
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
    background: '#1a1a1a', color: '#666'
  },
  tabActive: {
    flex: 1, padding: '10px 0', textAlign: 'center',
    border: 'none', borderRadius: '8px 8px 0 0',
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
    background: '#222', color: '#fff'
  },
  content: {
    flex: 1, paddingTop: 12, paddingBottom: 20
  }
};

export default function App() {
  const [tab, setTab] = useState(0);
  const [items, setItems] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  const loadItems = useCallback(async () => {
    const all = await getAllItems();
    setItems(all);
  }, []);

  useEffect(() => {
    async function init() {
      await seedIfEmpty();
      await loadItems();
      await requestNotificationPermission();
    }
    init();
  }, [loadItems]);

  useEffect(() => {
    if (items.length > 0) {
      checkAndNotify(items);
    }
  }, [items]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logo}>Groc</div>
        <button style={styles.addBtn} onClick={() => setShowAdd(true)}>+</button>
      </div>

      <div style={styles.tabs}>
        {TABS.map((t, i) => (
          <button
            key={t}
            style={i === tab ? styles.tabActive : styles.tab}
            onClick={() => setTab(i)}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {tab === 0 && <Pantry items={items} onRefresh={loadItems} />}
        {tab === 1 && <ToBuy items={items} onRefresh={loadItems} />}
        {tab === 2 && <Bought items={items} onRefresh={loadItems} />}
      </div>

      {showAdd && (
        <QuickAdd onClose={() => setShowAdd(false)} onAdded={loadItems} />
      )}
    </div>
  );
}