// --- Restock Calculation ---

export function calcAvgRestockDays(restockHistory) {
  if (restockHistory.length < 1) return 0;
  
  const intervals = restockHistory
    .filter(r => r.boughtAt && r.addedToBuyAt)
    .map(r => {
      const diff = r.addedToBuyAt - r.boughtAt;
      return diff / (1000 * 60 * 60 * 24);
    })
    .filter(d => d > 0);
  
  if (intervals.length === 0) return 0;
  const sum = intervals.reduce((a, b) => a + b, 0);
  return Math.round(sum / intervals.length);
}

export function isRestockDue(item) {
  if (item.avgRestockDays <= 0) return false;
  if (item.status !== 'pantry') return false;
  
  const lastBought = getLastBoughtTimestamp(item);
  if (!lastBought) return false;
  
  const dueDate = lastBought + item.avgRestockDays * 24 * 60 * 60 * 1000;
  return Date.now() >= dueDate;
}

function getLastBoughtTimestamp(item) {
  const history = item.restockHistory;
  if (!history || history.length === 0) return null;
  const last = history[history.length - 1];
  return last.boughtAt || null;
}

// --- Status Transitions ---

export function moveToBuy(item) {
  const now = Date.now();
  const newHistory = [...item.restockHistory];
  
  if (newHistory.length > 0) {
    const last = newHistory[newHistory.length - 1];
    if (last.boughtAt && !last.addedToBuyAt) {
      last.addedToBuyAt = now;
    } else {
      newHistory.push({ boughtAt: null, addedToBuyAt: now });
    }
  } else {
    newHistory.push({ boughtAt: null, addedToBuyAt: now });
  }
  
  return {
    ...item,
    status: 'to_buy',
    restockHistory: newHistory,
    avgRestockDays: calcAvgRestockDays(newHistory)
  };
}

export function moveToBought(item) {
  const now = Date.now();
  const newHistory = [...item.restockHistory];
  
  if (newHistory.length > 0) {
    const last = newHistory[newHistory.length - 1];
    if (!last.boughtAt) {
      last.boughtAt = now;
    }
  } else {
    newHistory.push({ boughtAt: now, addedToBuyAt: null });
  }
  
  return {
    ...item,
    status: 'bought',
    restockHistory: newHistory,
    avgRestockDays: calcAvgRestockDays(newHistory)
  };
}

export function moveToPantry(item) {
  return {
    ...item,
    status: 'pantry'
  };
}

// --- Notifications ---

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  const result = await Notification.requestPermission();
  return result;
}

export function sendNotification(title, body) {
  if (Notification.permission !== 'granted') return;
  new Notification(title, { body, icon: '/icon.png' });
}

export function checkAndNotify(items) {
  const due = items.filter(i => isRestockDue(i));
  if (due.length === 0) return;
  
  const names = due.map(i => i.name).join(', ');
  sendNotification('Groc — Restock Due', `Time to restock: ${names}`);
}