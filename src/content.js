/*
 * Script de contenu : parcourt la page, surligne les entités, ajoute une coche après
 * chacune, affiche le panneau flottant et exporte en CSV.
 */
(() => {
  'use strict';
  if (window.__NERX__) return;
  const E = window.NERX;
  // API des extensions : `browser` (Firefox) ou `chrome`
  const api = globalThis.browser || globalThis.chrome || null;

  /* Traduction : langue de l'interface du navigateur (anglais par défaut) */
  const t = (key, subs) => {
    try { const m = api.i18n.getMessage(key, subs); if (m) return m; } catch (e) { /* hors extension */ }
    return key;
  };
  const TYPES = E.TYPES.map((x) => Object.assign({}, x, { label: t(x.msg), single: t(x.msg + 'One') }));
  const TYPE_BY_ID = Object.fromEntries(TYPES.map((x) => [x.id, x]));
  const HOST_ID = 'nerx-panel-host';
  const DEFAULTS = {
    types: { person: true, work: true, org: true, place: true, event: true, date: true, other: false },
    sep: ',',
    showBoxes: true
  };

  const state = {
    settings: merge(DEFAULTS),
    entities: new Map(), // clé normalisée -> entité
    analyzed: false,
    filter: '',
    minimized: false,
    host: null,
    root: null,
    ignored: new Set(),      // entités ignorées (conservé lors d'une relance)
    overrides: new Map()     // types corrigés à la main (conservé lors d'une relance)
  };

  /* ------------------------------------------------------------------ */
  /* Paramètres (storage.sync)                                           */
  /* ------------------------------------------------------------------ */
  const storage = (api && api.storage && api.storage.sync) || null;
  function merge(v) {
    v = v || {};
    return {
      types: Object.assign({}, DEFAULTS.types, v.types || {}),
      sep: v.sep || DEFAULTS.sep,
      showBoxes: v.showBoxes !== undefined ? !!v.showBoxes : true
    };
  }
  function loadSettings() {
    return new Promise((res) => {
      if (!storage) return res(state.settings);
      try { storage.get(DEFAULTS).then((v) => res(merge(v)), () => res(state.settings)); } catch (e) { res(state.settings); }
    });
  }
  function saveSettings() {
    if (storage) try { storage.set(JSON.parse(JSON.stringify(state.settings))).catch(() => {}); } catch (e) { /* ignore */ }
  }
  if (storage && api.storage.onChanged) {
    api.storage.onChanged.addListener((ch, area) => {
      if (area !== 'sync') return;
      const next = {
        types: ch.types ? ch.types.newValue : state.settings.types,
        sep: ch.sep ? ch.sep.newValue : state.settings.sep,
        showBoxes: ch.showBoxes ? ch.showBoxes.newValue : state.settings.showBoxes
      };
      state.settings = merge(next);
      applyVisibility();
      renderPanel();
    });
  }

  /* ------------------------------------------------------------------ */
  /* Collecte du texte de la page en blocs                               */
  /* ------------------------------------------------------------------ */
  const SKIP = new Set(['script', 'style', 'noscript', 'textarea', 'input', 'select', 'option', 'button', 'code', 'pre', 'kbd',
    'samp', 'var', 'svg', 'math', 'canvas', 'iframe', 'object', 'embed', 'template', 'video', 'audio', 'head', 'title', 'meta',
    'link', 'rt', 'rp', 'nerx-mark', 'map', 'dialog']);
  const INLINE = new Set(['a', 'abbr', 'acronym', 'b', 'bdi', 'bdo', 'big', 'cite', 'data', 'del', 'dfn', 'em', 'font', 'i', 'ins',
    'label', 'mark', 'q', 's', 'small', 'span', 'strike', 'strong', 'sub', 'sup', 'time', 'tt', 'u', 'nobr', 'output', 'ruby', 'rb']);
  const TITLE_KIND = { cite: 'cite', i: 'i', em: 'em', q: 'q' };
  const BREAK_IN_LINE = '￼';

  function langOf(el) {
    const l = el.closest && el.closest('[lang]');
    return ((l && l.getAttribute('lang')) || document.documentElement.lang || '').toLowerCase();
  }
  function isHidden(el) {
    if (el.hidden) return true;
    if (typeof el.checkVisibility === 'function' && !el.checkVisibility()) {
      return getComputedStyle(el).display !== 'contents';
    }
    return false;
  }

  function collectBlocks(rootEl) {
    const blocks = [];
    const newBlock = (lang) => { const b = { text: '', map: [], italics: [], lang }; blocks.push(b); return b; };
    let nodeCount = 0;
    function walk(el, block) {
      for (let c = el.firstChild; c; c = c.nextSibling) {
        if (c.nodeType === 3) {
          const v = c.nodeValue;
          if (!v) continue;
          block.map.push({ node: c, start: block.text.length, len: v.length });
          block.text += v;
          if (++nodeCount > 60000) return;
        } else if (c.nodeType === 1) {
          const name = c.localName;
          if (c.id === HOST_ID) continue;
          if (SKIP.has(name) || c.isContentEditable || c.classList.contains('nerx-cb')) { block.text += BREAK_IN_LINE; continue; }
          if (name === 'br' || name === 'img' || name === 'hr' || name === 'wbr') { block.text += name === 'wbr' ? '' : '\n'; continue; }
          if (isHidden(c)) continue;
          if (INLINE.has(name)) {
            const st = block.text.length;
            walk(c, block);
            if (TITLE_KIND[name]) block.italics.push({ start: st, end: block.text.length, kind: TITLE_KIND[name] });
          } else {
            block.text += '\n';
            walk(c, newBlock(langOf(c)));
            block.text += '\n';
          }
        }
      }
    }
    walk(rootEl, newBlock(langOf(rootEl)));
    return blocks.filter((b) => /\S/.test(b.text) && b.map.length);
  }

  /* Données structurées schema.org (JSON-LD) */
  function schemaHints() {
    const map = {
      Person: 'person', Organization: 'org', Corporation: 'org', EducationalOrganization: 'org', CollegeOrUniversity: 'org',
      Library: 'org', Museum: 'org', GovernmentOrganization: 'org', NewsMediaOrganization: 'org', NGO: 'org', LocalBusiness: 'org',
      Place: 'place', City: 'place', Country: 'place', State: 'place', AdministrativeArea: 'place', TouristAttraction: 'place',
      Event: 'event', Festival: 'event', ExhibitionEvent: 'event', SportsEvent: 'event',
      CreativeWork: 'work', Book: 'work', Movie: 'work', MusicAlbum: 'work', MusicRecording: 'work', Painting: 'work',
      VisualArtwork: 'work', TVSeries: 'work', Periodical: 'work', Thesis: 'work', Play: 'work', MusicComposition: 'work'
    };
    const hints = [];
    const visit = (o, d) => {
      if (!o || d > 8) return;
      if (Array.isArray(o)) { o.forEach((x) => visit(x, d + 1)); return; }
      if (typeof o !== 'object') return;
      for (const t of [].concat(o['@type'] || [])) {
        if (map[t] && typeof o.name === 'string' && o.name.length < 150) hints.push([o.name, map[t]]);
      }
      for (const k in o) if (o[k] && typeof o[k] === 'object') visit(o[k], d + 1);
    };
    document.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
      try { visit(JSON.parse(s.textContent), 0); } catch (e) { /* JSON invalide */ }
    });
    return hints;
  }

  /* ------------------------------------------------------------------ */
  /* Surlignage                                                          */
  /* ------------------------------------------------------------------ */
  function boxTitle(ent) {
    return t('boxTitle', [ent.text, TYPE_BY_ID[ent.type].single]);
  }
  function makeBox(ent) {
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'nerx-cb';
    cb.dataset.nerxKey = ent.key;
    cb.dataset.nerxType = ent.type;
    cb.checked = ent.checked;
    cb.title = boxTitle(ent);
    cb.setAttribute('aria-label', boxTitle(ent));
    return cb;
  }

  function applyHighlights(blocks, occs, keepChecked) {
    const pieces = new Map(); // nœud texte -> morceaux
    occs.forEach((o, oi) => {
      const b = blocks[o.block];
      let ent = state.entities.get(o.key);
      if (!ent) {
        ent = { key: o.key, text: o.text, type: o.type, checked: keepChecked.has(o.key), occs: [], boxes: [], cursor: -1 };
        state.entities.set(o.key, ent);
      }
      const occ = { marks: [] };
      const list = [];
      for (const m of b.map) {
        if (m.start >= o.e) break;
        const me = m.start + m.len;
        if (me <= o.s) continue;
        const a = Math.max(o.s, m.start) - m.start, z = Math.min(o.e, me) - m.start;
        if (z > a) list.push({ node: m.node, a, z, ent, occ, last: false });
      }
      if (!list.length) return;
      list[list.length - 1].last = true;
      ent.occs.push(occ);
      for (const p of list) {
        if (!pieces.has(p.node)) pieces.set(p.node, []);
        pieces.get(p.node).push(p);
      }
    });
    for (const [node, ps] of pieces) {
      ps.sort((x, y) => y.a - x.a);
      for (const p of ps) {
        if (!node.parentNode) continue;
        if (p.z < node.nodeValue.length) node.splitText(p.z);
        const mid = p.a > 0 ? node.splitText(p.a) : node;
        const mark = document.createElement('nerx-mark');
        mark.dataset.nerxType = p.ent.type;
        mark.dataset.nerxKey = p.ent.key;
        mid.parentNode.insertBefore(mark, mid);
        mark.appendChild(mid);
        p.occ.marks.unshift(mark);
        if (p.last) {
          const cb = makeBox(p.ent);
          mark.after(cb);
          p.ent.boxes.push(cb);
        }
      }
    }
    // Remettre les morceaux de chaque occurrence dans l'ordre du document
    for (const ent of state.entities.values()) for (const occ of ent.occs) {
      if (occ.marks.length > 1) occ.marks.sort((x, y) => (x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1);
    }
    // Retirer les entités sans occurrence effective
    for (const [k, ent] of state.entities) if (!ent.occs.length || !ent.occs.some((o) => o.marks.length)) state.entities.delete(k);
  }

  function unwrapEntity(ent) {
    const parents = new Set();
    for (const occ of ent.occs) for (const m of occ.marks) {
      const p = m.parentNode;
      if (!p) continue;
      parents.add(p);
      while (m.firstChild) p.insertBefore(m.firstChild, m);
      m.remove();
    }
    for (const b of ent.boxes) b.remove();
    parents.forEach((p) => p.normalize());
  }

  function clearMarks() {
    const parents = new Set();
    document.querySelectorAll('nerx-mark').forEach((m) => {
      const p = m.parentNode;
      if (!p) return;
      parents.add(p);
      while (m.firstChild) p.insertBefore(m.firstChild, m);
      m.remove();
    });
    document.querySelectorAll('input.nerx-cb').forEach((b) => b.remove());
    parents.forEach((p) => p.normalize());
    state.entities.clear();
  }

  function applyVisibility() {
    const cl = document.documentElement.classList;
    for (const t of TYPES) cl.toggle('nerx-off-' + t.id, !state.settings.types[t.id]);
    cl.toggle('nerx-hide-cb', !state.settings.showBoxes);
  }

  /* Coches dans la page */
  function setChecked(key, val) {
    const ent = state.entities.get(key);
    if (!ent) return;
    ent.checked = val;
    for (const b of ent.boxes) b.checked = val;
    if (ent.row) ent.row.querySelector('input[type=checkbox]').checked = val;
    updateFooter();
  }
  const isBox = (t) => t && t.nodeType === 1 && t.classList && t.classList.contains('nerx-cb');
  document.addEventListener('click', (e) => { if (isBox(e.target)) e.stopPropagation(); }, true);
  ['mousedown', 'mouseup', 'pointerdown', 'pointerup', 'touchstart'].forEach((ev) =>
    document.addEventListener(ev, (e) => { if (isBox(e.target)) e.stopPropagation(); }, true));
  document.addEventListener('change', (e) => {
    if (!isBox(e.target)) return;
    e.stopPropagation();
    setChecked(e.target.dataset.nerxKey, e.target.checked);
  }, true);

  /* ------------------------------------------------------------------ */
  /* Export CSV                                                          */
  /* ------------------------------------------------------------------ */
  function visibleEntities() {
    return [...state.entities.values()].filter((e) => state.settings.types[e.type]);
  }
  function exportCSV(onlySelected) {
    const ents = visibleEntities().filter((e) => !onlySelected || e.checked);
    if (!ents.length) {
      toast(onlySelected ? t('toastNoneChecked') : t('toastNone'));
      return;
    }
    const sep = state.settings.sep === 'tab' ? '\t' : state.settings.sep;
    const cell = (v) => {
      v = String(v);
      if (/^[=+\-@]/.test(v)) v = "'" + v; // protection contre l'injection de formules
      return (v.includes(sep) || /["\r\n]/.test(v)) ? '"' + v.replace(/"/g, '""') + '"' : v;
    };
    const rows = [[t('csvEntity'), t('csvType'), t('csvOccurrences'), t('csvPage')].map(cell).join(sep)];
    for (const e of ents) rows.push([e.text, TYPE_BY_ID[e.type].single, e.occs.length, location.href].map(cell).join(sep));
    const blob = new Blob(['﻿' + rows.join('\r\n') + '\r\n'], { type: 'text/csv;charset=utf-8' });
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
    const host = (location.hostname || 'page').replace(/[^\w.-]+/g, '_');
    const name = `${t(onlySelected ? 'filePrefixSel' : 'filePrefixAll')}_${host}_${stamp}.csv`;
    const url = URL.createObjectURL(blob);
    // Ancre placée dans le Shadow DOM du panneau : Firefox exige qu'elle soit dans le document,
    // et les scripts de la page ne voient pas qu'il s'agit d'un lien.
    const a = document.createElement('a');
    a.href = url; a.download = name; a.style.display = 'none';
    (state.root || document.body || document.documentElement).appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    toast(t('toastExported', [String(ents.length), name]));
  }

  /* ------------------------------------------------------------------ */
  /* Panneau flottant (Shadow DOM, isolé du style de la page)            */
  /* ------------------------------------------------------------------ */
  const PANEL_CSS = `
    :host { all: initial; }
    * { box-sizing: border-box; }
    .panel { position: fixed; top: 12px; right: 12px; width: 360px; max-height: calc(100vh - 24px); display: flex; flex-direction: column;
      font: 13px/1.4 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #1d1d1f; background: #fff; border: 1px solid #d0d0d7;
      border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.18); z-index: 2147483647; overflow: hidden; }
    header { display: flex; align-items: center; gap: 6px; padding: 8px 8px 8px 12px; background: #f5f5f8; border-bottom: 1px solid #e3e3ea; cursor: move; user-select: none; }
    .title { flex: 1; font-weight: 650; font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .title small { font-weight: 500; color: #6b6b75; }
    button { font: inherit; cursor: pointer; border-radius: 7px; border: 1px solid #c9c9d2; background: #fff; color: #1d1d1f; padding: 4px 9px; }
    button:hover { background: #f0f0f5; }
    button.primary { background: #3a2bd9; border-color: #3a2bd9; color: #fff; font-weight: 600; }
    button.primary:hover { background: #2d20b8; }
    button.icon { width: 26px; height: 26px; padding: 0; font-size: 16px; line-height: 1; border-color: transparent; background: transparent; color: #55555f; }
    button.icon:hover { background: #e4e4ec; }
    .body { overflow: auto; padding: 8px 12px; flex: 1; min-height: 0; }
    .types { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 10px; margin-bottom: 8px; }
    .types label { display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 2px 0; }
    .chip { width: 14px; height: 14px; border-radius: 4px; flex: none; border: 1px solid rgba(0,0,0,.15); }
    .count { margin-left: auto; color: #6b6b75; font-variant-numeric: tabular-nums; font-size: 12px; }
    .tools { display: flex; gap: 6px; align-items: center; margin: 6px 0; }
    .tools input[type=search] { flex: 1; min-width: 0; font: inherit; padding: 4px 8px; border: 1px solid #c9c9d2; border-radius: 7px; }
    .tools button { padding: 3px 7px; font-size: 12px; }
    .group { margin-top: 8px; }
    .group h3 { display: flex; align-items: center; gap: 6px; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; color: #55555f; margin: 0 0 3px; font-weight: 650; }
    .row { display: flex; align-items: center; gap: 6px; padding: 2px 0; border-radius: 6px; }
    .row:hover { background: #f5f5f8; }
    .row .name { flex: 1; min-width: 0; text-align: left; border: none; background: none; padding: 1px 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #1d1d1f; }
    .row .name:hover { text-decoration: underline; background: none; }
    .row .n { color: #6b6b75; font-size: 11.5px; font-variant-numeric: tabular-nums; }
    .row select { font: inherit; font-size: 11.5px; padding: 1px 2px; border: 1px solid #d6d6de; border-radius: 5px; background: #fff; color: #333; max-width: 104px; }
    .empty { color: #6b6b75; padding: 8px 0; }
    footer { display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-top: 1px solid #e3e3ea; background: #fafafc; }
    footer .sel { flex: 1; color: #55555f; font-size: 12px; }
    .toast { padding: 6px 12px; background: #1d1d1f; color: #fff; font-size: 12px; display: none; }
    .toast.show { display: block; }
    .min .body, .min footer, .min .toast { display: none !important; }
    .min { width: auto; }
    @media (prefers-color-scheme: dark) {
      .panel { background: #1f1f24; color: #ececf1; border-color: #3a3a44; }
      header, footer { background: #26262d; border-color: #3a3a44; }
      button { background: #2c2c34; color: #ececf1; border-color: #45454f; }
      button:hover { background: #36363f; }
      button.icon { background: transparent; color: #b5b5c0; }
      .row:hover { background: #2a2a31; }
      .row .name { color: #ececf1; }
      .tools input[type=search], .row select { background: #2c2c34; color: #ececf1; border-color: #45454f; }
      .count, .row .n, .title small, footer .sel, .group h3, .empty { color: #a0a0ab; }
    }`;

  function ensurePanel() {
    if (state.host && state.host.isConnected) return;
    const host = document.createElement('div');
    host.id = HOST_ID;
    const root = host.attachShadow({ mode: 'open' });
    // Construction du panneau par le DOM (pas d'innerHTML)
    const h = (tag, attrs, ...kids) => {
      const el = document.createElement(tag);
      for (const [k, v] of Object.entries(attrs || {})) el.setAttribute(k, v);
      el.append(...kids);
      return el;
    };
    const style = document.createElement('style');
    style.textContent = PANEL_CSS;
    root.append(style, h('div', { class: 'panel', role: 'dialog' },
      h('header', {},
        h('div', { class: 'title' }, h('span', { class: 'name' }), ' ', h('small', { class: 'total' })),
        h('button', { class: 'primary', 'data-act': 'export-all' }),
        h('button', { class: 'icon', 'data-act': 'min' }, '–'),
        h('button', { class: 'icon', 'data-act': 'close' }, '×')),
      h('div', { class: 'toast', role: 'status' }),
      h('div', { class: 'body' },
        h('div', { class: 'types' }),
        h('div', { class: 'tools' },
          h('input', { type: 'search' }),
          h('button', { 'data-act': 'check-all' }),
          h('button', { 'data-act': 'uncheck-all' })),
        h('div', { class: 'list' })),
      h('footer', {},
        h('span', { class: 'sel' }),
        h('button', { 'data-act': 'rescan' }),
        h('button', { class: 'primary', 'data-act': 'export-sel' }))));
    // Textes traduits (insérés via textContent / attributs, jamais en HTML)
    const q = (sel) => root.querySelector(sel);
    const set = (sel, text, title) => { const el = q(sel); if (text != null) el.textContent = text; if (title) { el.title = title; el.setAttribute('aria-label', title); } };
    q('.panel').setAttribute('aria-label', t('extShortName'));
    set('.title .name', t('extShortName'));
    set('[data-act="export-all"]', t('btnExportAll'), t('panelExportAllTitle'));
    set('[data-act="min"]', null, t('panelMin'));
    set('[data-act="close"]', null, t('panelClose'));
    const search = q('input[type=search]');
    search.placeholder = t('panelFilter'); search.setAttribute('aria-label', t('panelFilter'));
    set('[data-act="check-all"]', t('panelCheckAll'), t('panelCheckAllTitle'));
    set('[data-act="uncheck-all"]', t('panelUncheckAll'), t('panelUncheckAllTitle'));
    set('[data-act="rescan"]', t('panelRescan'), t('panelRescanTitle'));
    set('[data-act="export-sel"]', t('btnExportSel'), t('panelExportSelTitle'));
    (document.body || document.documentElement).appendChild(host);
    state.host = host;
    state.root = root;

    root.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      const act = btn.dataset.act;
      if (act === 'export-all') exportCSV(false);
      else if (act === 'export-sel') exportCSV(true);
      else if (act === 'min') { state.minimized = !state.minimized; root.querySelector('.panel').classList.toggle('min', state.minimized); }
      else if (act === 'close') clearAll();
      else if (act === 'rescan') run();
      else if (act === 'check-all' || act === 'uncheck-all') {
        for (const ent of filteredEntities()) setChecked(ent.key, act === 'check-all');
      }
    });
    root.querySelector('input[type=search]').addEventListener('input', (e) => { state.filter = e.target.value; renderList(); });
    // Déplacement du panneau par son en-tête
    const panel = root.querySelector('.panel');
    const header = root.querySelector('header');
    header.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      const r = panel.getBoundingClientRect();
      const dx = e.clientX - r.left, dy = e.clientY - r.top;
      header.setPointerCapture(e.pointerId);
      const move = (ev) => {
        panel.style.left = Math.max(0, Math.min(window.innerWidth - 80, ev.clientX - dx)) + 'px';
        panel.style.top = Math.max(0, Math.min(window.innerHeight - 40, ev.clientY - dy)) + 'px';
        panel.style.right = 'auto';
      };
      const up = () => { header.removeEventListener('pointermove', move); header.removeEventListener('pointerup', up); };
      header.addEventListener('pointermove', move);
      header.addEventListener('pointerup', up);
    });
  }

  function filteredEntities() {
    const f = E.norm(state.filter || '');
    return visibleEntities().filter((e) => !f || e.key.includes(f));
  }

  function renderTypes() {
    const box = state.root.querySelector('.types');
    box.textContent = '';
    const counts = {};
    for (const e of state.entities.values()) counts[e.type] = (counts[e.type] || 0) + 1;
    for (const ty of TYPES) {
      const lab = document.createElement('label');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !!state.settings.types[ty.id];
      cb.addEventListener('change', () => {
        state.settings.types[ty.id] = cb.checked;
        saveSettings(); applyVisibility(); renderPanel();
      });
      const chip = document.createElement('span');
      chip.className = 'chip'; chip.style.background = ty.color;
      const name = document.createElement('span'); name.textContent = ty.label;
      const cnt = document.createElement('span'); cnt.className = 'count'; cnt.textContent = counts[ty.id] || 0;
      lab.append(cb, chip, name, cnt);
      box.appendChild(lab);
    }
  }

  function renderList() {
    if (!state.root) return;
    const list = state.root.querySelector('.list');
    list.textContent = '';
    for (const ent of state.entities.values()) ent.row = null;
    const ents = filteredEntities();
    if (!ents.length) {
      const p = document.createElement('div'); p.className = 'empty';
      p.textContent = state.entities.size ? t('panelEmptyFilter') : t('panelEmptyPage');
      list.appendChild(p);
      return;
    }
    const frag = document.createDocumentFragment();
    for (const ty of TYPES) {
      const group = ents.filter((e) => e.type === ty.id);
      if (!group.length) continue;
      const g = document.createElement('div'); g.className = 'group';
      const h = document.createElement('h3');
      const chip = document.createElement('span'); chip.className = 'chip'; chip.style.background = ty.color;
      h.append(chip, document.createTextNode(`${ty.label} (${group.length})`));
      g.appendChild(h);
      for (const ent of group) {
        const row = document.createElement('div'); row.className = 'row';
        const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = ent.checked;
        cb.title = t('rowCheckTitle');
        cb.addEventListener('change', () => setChecked(ent.key, cb.checked));
        const name = document.createElement('button'); name.className = 'name'; name.textContent = ent.text;
        name.title = t('rowNameTitle');
        name.addEventListener('click', () => goTo(ent));
        const n = document.createElement('span'); n.className = 'n'; n.textContent = '×' + ent.occs.length;
        const sel = document.createElement('select');
        sel.title = t('rowSelectTitle');
        for (const tt of TYPES) {
          const o = document.createElement('option'); o.value = tt.id; o.textContent = tt.single; o.selected = tt.id === ent.type; sel.appendChild(o);
        }
        const ig = document.createElement('option'); ig.value = '__ignore'; ig.textContent = t('rowIgnore'); sel.appendChild(ig);
        sel.addEventListener('change', () => changeType(ent, sel.value));
        row.append(cb, name, n, sel);
        ent.row = row;
        g.appendChild(row);
      }
      frag.appendChild(g);
    }
    list.appendChild(frag);
  }

  function updateFooter() {
    if (!state.root) return;
    const vis = visibleEntities();
    const sel = vis.filter((e) => e.checked).length;
    state.root.querySelector('.sel').textContent = t('panelSelected', [String(sel), String(vis.length)]);
    state.root.querySelector('.total').textContent = `(${vis.length})`;
    const b = state.root.querySelector('[data-act="export-sel"]');
    b.textContent = sel ? t('btnExportSelN', [String(sel)]) : t('btnExportSel');
  }

  function renderPanel() {
    if (!state.root || !state.host.isConnected) return;
    renderTypes();
    renderList();
    updateFooter();
  }

  let toastTimer = null;
  function toast(msg) {
    if (!state.root) return;
    const t = state.root.querySelector('.toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 4500);
  }

  function goTo(ent) {
    if (!ent.occs.length) return;
    ent.cursor = (ent.cursor + 1) % ent.occs.length;
    const marks = ent.occs[ent.cursor].marks;
    if (!marks.length) return;
    marks[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    marks.forEach((m) => m.classList.add('nerx-flash'));
    setTimeout(() => marks.forEach((m) => m.classList.remove('nerx-flash')), 1600);
    toast(t('toastOccurrence', [ent.text, String(ent.cursor + 1), String(ent.occs.length)]));
  }

  function changeType(ent, type) {
    if (type === '__ignore') {
      state.ignored.add(ent.key);
      unwrapEntity(ent);
      state.entities.delete(ent.key);
    } else {
      state.overrides.set(ent.key, type);
      ent.type = type;
      for (const occ of ent.occs) for (const m of occ.marks) m.dataset.nerxType = type;
      for (const b of ent.boxes) { b.dataset.nerxType = type; b.title = boxTitle(ent); }
    }
    renderPanel();
    notifyCount();
  }

  function notifyCount() {
    sendCount(visibleEntities().length);
  }

  function sendCount(count) {
    try { const p = api.runtime.sendMessage({ type: 'nerx-count', count }); if (p && p.catch) p.catch(() => {}); } catch (e) { /* hors extension */ }
  }

  function clearAll() {
    clearMarks();
    if (state.host) state.host.remove();
    state.host = null; state.root = null; state.analyzed = false;
    const cl = document.documentElement.classList;
    [...cl].filter((c) => c.startsWith('nerx-')).forEach((c) => cl.remove(c));
    sendCount(0);
  }

  /* ------------------------------------------------------------------ */
  /* Analyse                                                             */
  /* ------------------------------------------------------------------ */
  async function run() {
    const t0 = performance.now();
    state.settings = await loadSettings();
    const keep = new Set([...state.entities.values()].filter((e) => e.checked).map((e) => e.key));
    clearMarks();
    const blocks = collectBlocks(document.body || document.documentElement);
    const occs = E.analyze(blocks, { hints: schemaHints() })
      .filter((o) => !state.ignored.has(o.key))
      .map((o) => (state.overrides.has(o.key) ? Object.assign(o, { type: state.overrides.get(o.key) }) : o));
    applyHighlights(blocks, occs, keep);
    state.analyzed = true;
    ensurePanel();
    applyVisibility();
    renderPanel();
    notifyCount();
    const ms = Math.round(performance.now() - t0);
    toast(t('toastAnalysis', [String(state.entities.size), String(occs.length), String(ms)]));
    return { entities: visibleEntities().length, occurrences: occs.length, ms };
  }

  window.__NERX__ = { run, clear: clearAll, exportCSV, isActive: () => state.analyzed };
})();
