// API des extensions : `browser` (Firefox, promesses) ou `chrome`.
export const api = globalThis.browser ?? globalThis.chrome;

// Injection du moteur et du script de contenu dans l'onglet, puis lancement de l'analyse.
export const DEFAULTS = {
  types: { person: true, work: true, org: true, place: true, event: true, date: true, other: false },
  sep: ',',
  showBoxes: true
};

async function ensureLoaded(tabId) {
  const [{ result: loaded }] = await api.scripting.executeScript({
    target: { tabId }, func: () => !!window.__NERX__
  });
  if (!loaded) {
    await api.scripting.insertCSS({ target: { tabId }, files: ['src/content.css'] });
    await api.scripting.executeScript({
      target: { tabId }, files: ['src/data.js', 'src/ner-engine.js', 'src/content.js']
    });
  }
}

export async function analyzeTab(tabId) {
  await ensureLoaded(tabId);
  const [{ result }] = await api.scripting.executeScript({
    target: { tabId }, func: () => window.__NERX__.run()
  });
  return result;
}

export async function clearTab(tabId) {
  await api.scripting.executeScript({
    target: { tabId }, func: () => { if (window.__NERX__) window.__NERX__.clear(); }
  });
}

export async function exportTab(tabId, onlySelected) {
  const [{ result }] = await api.scripting.executeScript({
    target: { tabId },
    func: (sel) => { if (!window.__NERX__ || !window.__NERX__.isActive()) return false; window.__NERX__.exportCSV(sel); return true; },
    args: [onlySelected]
  });
  return result;
}
