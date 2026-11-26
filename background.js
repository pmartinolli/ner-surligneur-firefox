import { api, analyzeTab } from './inject.js';

// Raccourci clavier (Alt+Maj+E par défaut)
api.commands.onCommand.addListener(async (command, tab) => {
  if (command !== 'analyze-page' || !tab || !tab.id) return;
  try { await analyzeTab(tab.id); } catch (e) { console.warn('Analyse impossible :', e); }
});

// Badge : nombre d'entités trouvées dans l'onglet
api.runtime.onMessage.addListener((msg, sender) => {
  if (msg && msg.type === 'nerx-count' && sender.tab) {
    const n = msg.count || 0;
    api.action.setBadgeBackgroundColor({ tabId: sender.tab.id, color: '#3a2bd9' });
    api.action.setBadgeText({ tabId: sender.tab.id, text: n ? (n > 999 ? '999+' : String(n)) : '' });
  }
});
