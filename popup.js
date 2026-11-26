import { api, DEFAULTS, analyzeTab, clearTab, exportTab } from './inject.js';

// Traduction : langue de l'interface du navigateur, anglais par défaut (_locales/)
const t = (key, subs) => api.i18n.getMessage(key, subs) || key;
document.documentElement.lang = api.i18n.getUILanguage();
document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });

const TYPES = [
  { id: 'person', msg: 'typePerson', color: '#FFE94D' },
  { id: 'work', msg: 'typeWork', color: '#FF7BEF' },
  { id: 'org', msg: 'typeOrg', color: '#7EE08A' },
  { id: 'place', msg: 'typePlace', color: '#8CCBFF' },
  { id: 'event', msg: 'typeEvent', color: '#FFB35C' },
  { id: 'date', msg: 'typeDate', color: '#CDBBFF' },
  { id: 'other', msg: 'typeOther', color: '#D4D4D4' }
];
const $ = (id) => document.getElementById(id);
const status = (msg, err) => { $('status').textContent = msg; $('status').className = err ? 'err' : ''; };

let settings = structuredClone(DEFAULTS);

async function load() {
  const v = await api.storage.sync.get(DEFAULTS);
  settings = { types: { ...DEFAULTS.types, ...(v.types || {}) }, sep: v.sep || ',', showBoxes: v.showBoxes !== false };
  const box = $('types');
  box.textContent = '';
  for (const ty of TYPES) {
    const lab = document.createElement('label');
    const cb = document.createElement('input');
    cb.type = 'checkbox'; cb.checked = !!settings.types[ty.id];
    cb.addEventListener('change', () => { settings.types[ty.id] = cb.checked; save(); });
    const chip = document.createElement('span'); chip.className = 'chip'; chip.style.background = ty.color;
    lab.append(cb, chip, document.createTextNode(t(ty.msg)));
    box.appendChild(lab);
  }
  $('sep').value = settings.sep;
  $('showBoxes').checked = settings.showBoxes;
}
const save = () => api.storage.sync.set(settings);

async function activeTab() {
  const [tab] = await api.tabs.query({ active: true, currentWindow: true });
  return tab;
}
function explain(e) {
  const m = String((e && e.message) || e);
  if (/cannot be scripted|Cannot access|chrome:\/\/|extensions gallery|webstore/i.test(m)) return t('errRestricted');
  if (/file:/.test(m)) return t('errFile');
  return t('errGeneric', [m]);
}

$('sep').addEventListener('change', () => { settings.sep = $('sep').value; save(); });
$('showBoxes').addEventListener('change', () => { settings.showBoxes = $('showBoxes').checked; save(); });

$('analyze').addEventListener('click', async () => {
  status(t('statusAnalyzing'));
  try {
    const r = await analyzeTab((await activeTab()).id);
    status(t('statusResult', [String(r.entities), String(r.occurrences), String(r.ms)]));
  } catch (e) { status(explain(e), true); }
});
$('clear').addEventListener('click', async () => {
  try { await clearTab((await activeTab()).id); status(t('statusCleared')); } catch (e) { status(explain(e), true); }
});
for (const [id, sel] of [['exportSel', true], ['exportAll', false]]) {
  $(id).addEventListener('click', async () => {
    try {
      const ok = await exportTab((await activeTab()).id, sel);
      status(ok ? t('statusExportStarted') : t('statusAnalyzeFirst'), !ok);
    } catch (e) { status(explain(e), true); }
  });
}

load();
