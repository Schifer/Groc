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
    display: 'flex', flexDirection: 'column', background: '#0a0a0a',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    paddingTop: 'env(safe-area-inset-top, 40px)'
  },
  header: {
    padding: '16px 20px 0', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center'
  },
  logo: {
    fontSize: 34, fontWeight: 800, color: '#fff', letterSpacing: -1
  },
  addBtn: {
    width: 48, height: 48, borderRadius: '50%', border: 'none',
    background: '#00ff66', color: '#000', fontSize: 28,
    fontWeight: 700, cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', lineHeight: 1
  },
  tabs: {
    display: 'flex', padding: '16px 20px 0', gap: 8
  },
  tab: {
    flex: 1, padding: '10px 0', textAlign: 'center',
    border: 'none', borderRadius: 20,
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
    background: '#1a1a1a', color: '#666'
  },
  tabActive: {
    flex: 1, padding: '10px 0', textAlign: 'center',
    border: 'none', borderRadius: 20,
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
    background: '#fff', color: '#000'
  },
  content: {
    flex: 1, paddingTop: 16, paddingBottom: 20
  },
  debug: {
    padding: '8px 20px', fontSize: 10, color: '#444', textAlign: 'center'
  }
};

export default function App() {
  const [tab, setTab] = useState(0);
  const [items, setItems] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [dbStatus, setDbStatus] = useState('loading...');

  const loadItems = useCallback(async () => {
    try {
      const all = await getAllItems();
      setItems(all);
      const counts = {
        pantry: all.filter(i => i.status === 'pantry').length,
        to_buy: all.filter(i => i.status === 'to_buy').length,
        bought: all.filter(i => i.status === 'bought').length
      };
      setDbStatus(`P:${counts.pantry} B:${counts.to_buy} D:${counts.bought} T:${all.length}`);
    } catch (e) {
      setDbStatus('DB ERROR: ' + e.message);
    }
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

      <div style={styles.debug}>{dbStatus}</div>

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