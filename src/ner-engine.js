/*
 * Moteur de reconnaissance d'entités nommées — 100 % local, heuristique, multilingue.
 *
 * Signaux utilisés :
 *  - séquences de mots à majuscule initiale (avec particules : de, van, von, of, d'…)
 *  - mots-indices (Université, Musée, Festival, rue, lac…), titres (Dr, Mme, président…)
 *  - dictionnaires (prénoms, lieux), initiales (J. K. Rowling), sigles (UNESCO, BAnQ)
 *  - typographie : guillemets « » “ ” „ “ 《 》 『 』, balises <cite>, <i>, <em>
 *  - contexte : « le roman X », « à X », « X (1802-1885) », « X a déclaré »
 *  - cohérence à l'échelle de la page (une même chaîne garde le même type ; les noms
 *    de famille héritent du type « personne » ; les sigles entre parenthèses héritent
 *    du type de l'entité qui les précède)
 *  - segmentation Intl.Segmenter pour le chinois, le japonais et le coréen
 *  - données structurées schema.org (JSON-LD) de la page, si présentes
 */
(function (g) {
  'use strict';
  const D = g.NERX_DATA;
  if (!D) throw new Error('NERX_DATA introuvable');

  /* ---------- Normalisation ---------- */
  const stripAccents = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  const norm = (s) => stripAccents(String(s)).replace(/[’‘`´ʼ]/g, "'")
    .replace(/[\s  ]+/g, ' ').trim().toLowerCase();
  const lowerRaw = (s) => String(s).replace(/[’‘`´ʼ]/g, "'").toLowerCase();
  const setN = (a) => new Set(a.map(norm));
  const setR = (a) => new Set(a.map(lowerRaw));

  const FIRST = setN(D.firstNames);
  const PLACES = setN(D.places);
  const ORG_CUES = setN(D.orgCues);
  const EVENT_CUES = setN(D.eventCues);
  const PLACE_CUES = setN(D.placeCues);
  const WORK_CUES = setN(D.workCues);
  const WORK_VERBS = setN(D.workVerbs);
  const KNOWN_ORGS = setN(D.knownOrgs);
  const TITLES = setN(D.personTitles);
  const PERSON_NEXT = setN(D.personNext);
  const PLACE_PREP = setR(D.placePreps);
  const STOP_START = setN(D.startStopwords);
  const ARTICLES = setN(D.articles);
  const CONNECTORS = setR(D.connectors);
  const CUE_CONNECTORS = setR(D.connectorsInCue);
  const CUE_ADJ = setN(D.cueAdjectives);
  const CONJ = setR(D.conjunctions);
  const PARTICLES = setR(D.nameParticles);
  const MONTHDAY = setN(D.monthsDays);
  const UI_WORDS = setN(D.uiWords);
  const ABBREV = setN(D.abbreviations);
  const GERMAN_FW = setN(D.germanFunctionWords);
  const PRONOUNS = setR(D.pronouns);
  const CJK_PLACES = new Set(D.cjkPlaces);
  const CJK_ORG_SUFFIX = D.cjkOrgSuffixes.slice().sort((a, b) => b.length - a.length);
  const CJK_EVENT_SUFFIX = D.cjkEventSuffixes;

  const ORG_SUFFIX_RE = /^(inc|ltd|llc|llp|gmbh|sa|sas|sarl|ag|plc|corp|co|spa|srl|bv|nv|ab|oy|kg|ltee|limitee|limited|cie)\.?$/;
  const ROMAN_RE = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
  const SAINT_RE = /^(saint|sainte|st|ste|san|santa|santo|sao|sankt)[- ]/;

  /* ---------- Types d'entités ---------- */
  // Libellés : clés de traduction dans _locales/<langue>/messages.json (msg, puis msg + 'One' au singulier)
  const TYPES = [
    { id: 'person', msg: 'typePerson', color: '#FFE94D' },
    { id: 'work', msg: 'typeWork', color: '#FF7BEF' },
    { id: 'org', msg: 'typeOrg', color: '#7EE08A' },
    { id: 'place', msg: 'typePlace', color: '#8CCBFF' },
    { id: 'event', msg: 'typeEvent', color: '#FFB35C' },
    { id: 'date', msg: 'typeDate', color: '#CDBBFF' },
    { id: 'other', msg: 'typeOther', color: '#D4D4D4' }
  ];
  const SCORED = ['person', 'work', 'org', 'place', 'event'];
  const THRESHOLD = 1.5;

  /* ---------- Tokenisation ---------- */
  const TOKEN_RE = /[\p{L}\p{N}][\p{L}\p{M}\p{N}'’\-]*\.?|&/gu;
  const ELISION_RE = /^(qu|dell|dall|nell|sull|all|[dljnscmt])['’](?=\p{L})/iu;

  function makeTok(w, s, e, extra) {
    const upperCount = (w.match(/\p{Lu}/gu) || []).length;
    const letters = (w.match(/\p{L}/gu) || []).length;
    const t = Object.assign({
      w, s, e, n: norm(w.replace(/\.$/, '')), l: lowerRaw(w),
      cap: /^[\p{Lu}\p{Lt}]/u.test(w),
      digit: /^\p{N}+$/u.test(w),
      elision: false, sentEnd: false, initial: false, abbrev: false, poss: false
    }, extra || {});
    t.roman = w.length <= 5 && ROMAN_RE.test(w.replace(/\.$/, '')) && w.length > 0;
    t.acronym = !t.initial && !t.roman && letters >= 2 && w.length <= 9 &&
      (/^[\p{Lu}][\p{Lu}\p{N}&]+\.?$/u.test(w) ||
        (/^\p{Lu}/u.test(w) && upperCount >= 2 && upperCount / letters >= 0.4 && /^[\p{L}&]+$/u.test(w)));
    return t;
  }

  function tokenize(text) {
    const out = [];
    for (const m of text.matchAll(TOKEN_RE)) {
      let s = m.index, w = m[0];
      const el = ELISION_RE.exec(w);
      if (el) {
        out.push(makeTok(el[0], s, s + el[0].length, { elision: true }));
        s += el[0].length; w = w.slice(el[0].length);
      }
      let sentEnd = false, initial = false, abbrev = false, poss = false;
      if (w.endsWith('.')) {
        const base = w.slice(0, -1);
        if (/^\p{Lu}$/u.test(base)) initial = true;
        else if (ABBREV.has(norm(base))) abbrev = true;
        else { w = base; sentEnd = true; }
      }
      w = w.replace(/[-'’]+$/u, '');
      const pm = /^(.{2,})['’]s$/u.exec(w);
      if (pm) { w = pm[1]; poss = true; }
      if (!w) continue;
      out.push(makeTok(w, s, s + w.length, { sentEnd, initial, abbrev, poss }));
    }
    // Début de phrase
    for (let i = 0; i < out.length; i++) {
      const prev = out[i - 1];
      const gap = text.slice(prev ? prev.e : 0, out[i].s);
      out[i].gapBefore = gap;
      out[i].sentStart = !prev || prev.sentEnd || /[.!?…\n•·|￼«“"„]|:\s*$/.test(gap);
    }
    return out;
  }

  const contiguous = (toks, a, b) => {
    const gap = toks[b].gapBefore;
    return gap === '' || /^[   ]{1,2}$/.test(gap);
  };
  // Contexte (mots précédents) sans franchir une fin de phrase
  function prevWords(toks, i, max) {
    const out = [];
    for (let k = i - 1; k >= 0 && out.length < max; k--) {
      if (/[.!?;\n￼()]/.test(toks[k + 1].gapBefore)) break;
      out.push(toks[k]);
      if (toks[k].sentEnd) break;
    }
    return out;
  }
  function nextWords(toks, j, max) {
    const out = [];
    for (let k = j + 1; k < toks.length && out.length < max; k++) {
      if (/[.!?;\n￼()]/.test(toks[k].gapBefore)) break;
      out.push(toks[k]);
    }
    return out;
  }

  const cueModeOf = (t) => ORG_CUES.has(t.n) ? 'org' : EVENT_CUES.has(t.n) ? 'event' : PLACE_CUES.has(t.n) ? 'place' : null;
  const isMonthDay = (t) => MONTHDAY.has(t.n);

  /* ---------- Séquences de mots à majuscule ---------- */
  function buildSequences(toks) {
    const seqs = [];
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i];
      if (!t.cap || t.digit) continue;
      if (t.roman && !t.acronym) continue;
      const nxt = toks[i + 1];
      if (isMonthDay(t) && !(nxt && nxt.cap && contiguous(toks, i, i + 1))) continue;
      const idx = [i];
      let j = i;
      let mode = cueModeOf(t);
      while (idx.length < 14) {
        const k = j + 1;
        if (k >= toks.length || toks[j].sentEnd || toks[j].poss || !contiguous(toks, j, k)) break;
        const tk = toks[k];
        if (tk.cap && !(isMonthDay(tk) && toks[k + 1] && toks[k + 1].digit)) {
          idx.push(k); j = k; mode = mode || cueModeOf(tk); continue;
        }
        // Connecteurs / adjectifs d'institution entre deux mots à majuscule
        const buf = [];
        let m = k;
        while (m < toks.length && buf.length < 6) {
          if (m > k && (toks[m - 1].sentEnd || !contiguous(toks, m - 1, m))) break;
          const tm = toks[m];
          if (tm.cap) break;
          if (buf.length && CONJ.has(toks[buf[buf.length - 1]].l)) break; // « et » doit précéder une majuscule
          // « Université du Québec à Montréal » : « à » seulement entre deux noms de lieux
          if ((tm.l === 'à' || tm.l === 'a') && !buf.length && PLACES.has(toks[j].n) && toks[j - 1] && /^(du|de|of)$/.test(toks[j - 1].l) &&
            toks[m + 1] && PLACES.has(toks[m + 1].n) && contiguous(toks, m, m + 1)) { buf.push(m); m++; break; }
          const isConn = (x) => x && (CONNECTORS.has(x.l) || (mode && CUE_CONNECTORS.has(x.l)));
          let ok = isConn(tm) ||
            (mode && (CUE_ADJ.has(tm.n) || ORG_CUES.has(tm.n) || PLACE_CUES.has(tm.n))) ||
            (mode === 'event' && tm.digit);
          // « Festival de jazz de Montréal » : connecteur + mot + connecteur + Majuscule
          if (!ok && mode && buf.length && isConn(toks[buf[buf.length - 1]]) && isConn(toks[m + 1]) &&
            m + 1 < toks.length && contiguous(toks, m, m + 1) && !tm.sentEnd && /\p{L}/u.test(tm.w)) ok = true;
          if (!ok) break;
          buf.push(m); m++;
        }
        if (buf.length && m < toks.length && toks[m].cap && !isMonthDay(toks[m]) && !toks[m - 1].sentEnd && contiguous(toks, m - 1, m)) {
          // « Guernica de Pablo Picasso » : ne pas fusionner avec un prénom + nom qui suit
          const nameAhead = !mode && FIRST.has(toks[m].n.split('-')[0]) && toks[m + 1] && toks[m + 1].cap && contiguous(toks, m, m + 1);
          if (!nameAhead) { idx.push(...buf, m); j = m; mode = mode || cueModeOf(toks[m]); continue; }
        }
        // Adjectifs finaux (« Bibliothèque nationale », « Jeux olympiques », « Expo 67 »)
        if (mode && buf.length) {
          let last = -1;
          for (let q = 0; q < buf.length; q++) {
            const tq = toks[buf[q]];
            if (CUE_ADJ.has(tq.n) || (mode === 'event' && tq.digit)) last = q;
            else if (!(CONNECTORS.has(tq.l) || CUE_CONNECTORS.has(tq.l))) break;
          }
          if (last >= 0) { idx.push(...buf.slice(0, last + 1)); j = buf[last]; }
        }
        break;
      }
      seqs.push(idx);
      i = j;
    }
    return seqs;
  }

  /* ---------- Score d'une séquence ---------- */
  function scoreCore(core, text, ctx) {
    const sc = { person: 0, work: 0, org: 0, place: 0, event: 0 };
    const n = core.length;
    const full = norm(text);
    let cue = false, strongPerson = false;

    if (core.some((t) => ORG_CUES.has(t.n))) { sc.org += 3; cue = true; }
    if (core.some((t) => EVENT_CUES.has(t.n))) { sc.event += 3; cue = true; }
    if (core.some((t) => PLACE_CUES.has(t.n))) { sc.place += 2.6; cue = true; }
    const last = core[n - 1];
    if (n >= 2 && last.cap && ORG_SUFFIX_RE.test(last.n)) { sc.org += 3; cue = true; }
    if (PLACES.has(full)) { sc.place += 3.2; cue = true; }
    if (KNOWN_ORGS.has(full)) { sc.org += 3.4; cue = true; }
    if (SAINT_RE.test(full)) { sc.place += 1.6; }
    if (n === 1 && core[0].acronym) sc.org += 1.6;

    // Personnes
    const f0 = core[0].n.split('-')[0];
    if (n >= 2 && (FIRST.has(core[0].n) || FIRST.has(f0)) && !PLACES.has(full)) { sc.person += 2.6; strongPerson = true; }
    else if (n === 1 && FIRST.has(core[0].n)) sc.person += 1.0;
    if (n >= 2 && core.some((t) => t.initial) && last.cap && !last.initial) { sc.person += 2.2; strongPerson = true; }
    if (ctx.titleCue) { sc.person += 3; strongPerson = true; }
    const p0 = ctx.prev[0], p1 = ctx.prev[1];
    if (p0 && TITLES.has(p0.n)) { sc.person += 3; strongPerson = true; }
    else if (p1 && TITLES.has(p1.n) && !p0.cap) { sc.person += 1.4; }
    if (ctx.next[0] && PERSON_NEXT.has(ctx.next[0].n)) sc.person += 1.2;
    if (/^\s*\(\s*(?:\p{L}+\.?\s+)?(?:né|née|born|nacido|nata|nato|geboren|\*|†)?\s*(?:vers |ca?\.\s*)?\d{3,4}\s*[-–—]/u.test(ctx.after)) {
      sc.person += 1.8; strongPerson = true;
    }
    const knownInside = core.some((t, i) => PLACES.has(t.n) || KNOWN_ORGS.has(t.n) || (core[i + 1] && PLACES.has(t.n + ' ' + core[i + 1].n)));
    if (!cue && !knownInside && n >= 2 && n <= 4 && core.every((t) => (t.cap && !(t.acronym && t.w.length > 3)) || PARTICLES.has(t.l))) sc.person += 1.5;

    // Œuvres
    if (ctx.prev.slice(0, 3).some((t) => !t.cap && WORK_CUES.has(t.n))) sc.work += 2.6;
    else if (p0 && !p0.cap && WORK_VERBS.has(p0.n)) sc.work += 2;

    // Lieux (préposition)
    if (p0 && !p0.cap && PLACE_PREP.has(p0.l)) sc.place += /^(in|near|nach|em|throughout)$/.test(p0.l) && sc.person < 2 ? 1.5 : 0.8;

    // Pénalités
    if (ctx.sentStart && n === 1) for (const k of SCORED) sc[k] = Math.max(0, sc[k] - 1);
    if (ctx.titleCaseBlock && !cue) for (const k of SCORED) sc[k] *= strongPerson && k === 'person' ? 0.9 : 0.6;
    if (ctx.nounCaps && !cue && !strongPerson) for (const k of SCORED) sc[k] = 0;
    return { sc, cue };
  }

  function best(sc) {
    let bt = null, bs = 0;
    for (const k of SCORED) if (sc[k] > bs) { bs = sc[k]; bt = k; }
    return { type: bt, score: bs };
  }

  /* ---------- Dates ---------- */
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const MONTHS = [...new Set(D.months)].sort((a, b) => b.length - a.length).map(esc).join('|');
  const NB = '(?<![\\p{L}\\p{N}])', NA = '(?![\\p{L}\\p{N}])';
  const YEAR_CTX = "en|in|em|année|annee|year|años?|anno|jahr|depuis|since|seit|desde|dal|vers|circa|ca\\.|c\\.|dès|jusqu'en|jusqu’en|until|till|bis|hasta|durant|during|pendant|around|été|hiver|automne|printemps|summer|winter|spring|fall|autumn|fin|début|mi|late|early|mid";
  const DATE_RES = [
    new RegExp(`${NB}\\d{1,2}(?:er|re|st|nd|rd|th|º|°|\\.)?\\s*(?:de\\s+)?(?:${MONTHS})\\.?(?:,?\\s+(?:de\\s+|del\\s+)?\\d{3,4})?${NA}`, 'giu'),
    new RegExp(`${NB}(?:${MONTHS})\\.?\\s+\\d{1,2}(?:st|nd|rd|th)?(?:,?\\s+\\d{4})?${NA}`, 'giu'),
    new RegExp(`${NB}(?:${MONTHS})\\.?\\s+(?:de\\s+)?\\d{4}${NA}`, 'giu'),
    /(?<![\p{L}\p{N}])\d{4}-\d{2}-\d{2}(?![\p{L}\p{N}])/gu,
    /(?<![\p{L}\p{N}/])\d{1,2}\/\d{1,2}\/\d{2,4}(?![\p{L}\p{N}/])/gu,
    /(?<![\p{L}\p{N}])(?:[IVXL]+|\d{1,2})(?:e|ème|eme|er|ᵉ|th|st|nd|rd)\s+(?:siècles?|siecles?|century|centuries)(?!\p{L})/giu,
    /(?<!\p{L})(?:siglo|secolo|século)\s+[IVXL]+(?!\p{L})/giu,
    /(?<![\p{L}\p{N}])\d{1,2}\.\s*Jahrhundert/gu,
    /(?<![\p{L}\p{N}])(?:1\d{3}|20\d{2})\s*[-–—]\s*(?:1\d{3}|20\d{2})(?![\p{L}\p{N}])/gu,
    new RegExp(`(?<=(?:^|[^\\p{L}])(?:${YEAR_CTX})\\s)(?:1\\d{3}|20\\d{2})(?![\\p{L}\\p{N}])`, 'giu'),
    /(?<=\()(?:1\d{3}|20\d{2})(?=\))/gu,
    /\d{3,4}\s*年(?:\s*\d{1,2}\s*月)?(?:\s*\d{1,2}\s*日)?/gu,
    /\d{4}\s*년(?:\s*\d{1,2}\s*월)?(?:\s*\d{1,2}\s*일)?/gu
  ];

  /* ---------- Titres entre guillemets ---------- */
  const QUOTE_RES = [
    [/«[\s  ]*([^«»\n]{1,150}?)[\s  ]*»/gdu, 'q'],
    [/“([^“”\n]{1,150}?)”/gdu, 'q'],
    [/„([^“”„\n]{1,150}?)[“”]/gdu, 'q'],
    [/(?<![\p{L}\p{N}])"([^"\n]{1,150}?)"(?![\p{L}\p{N}])/gdu, 'q'],
    [/《([^《》\n]{1,80})》/gdu, 'cjk'],
    [/〈([^〈〉\n]{1,80})〉/gdu, 'cjk'],
    [/『([^『』\n]{1,80})』/gdu, 'cjk'],
    [/「([^「」\n]{1,80})」/gdu, 'q']
  ];
  const SPAN_BASE = { q: 1.2, cjk: 3.2, cite: 3.5, i: 1.5, em: 1.3 };

  function evalTitleSpan(text, toks, s, e, kind) {
    let inner = text.slice(s, e);
    const lead = inner.length - inner.trimStart().length;
    inner = inner.trim();
    s += lead; e = s + inner.length;
    inner = inner.replace(/[,:;]+$/, '');
    e = s + inner.length;
    if (!inner || inner.length > 150 || /\n/.test(inner)) return null;
    const words = inner.split(/\s+/).filter(Boolean);
    if (words.length > 14) return null;
    const cjk = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(inner);
    if (!cjk && !/^[\p{Lu}\p{Lt}\p{N}¿¡]/u.test(inner)) return null;
    if (!/\p{L}/u.test(inner)) return null;
    const span = toks.filter((t) => t.s >= s && t.e <= e);
    if (!cjk && !span.length) return null;
    if (span.length === 1 && (STOP_START.has(span[0].n) || UI_WORDS.has(span[0].n))) return null;

    let w = SPAN_BASE[kind] || 1.2;
    const lettered = span.filter((t) => /\p{L}/u.test(t.w) && !CONNECTORS.has(t.l));
    const capRatio = lettered.length ? lettered.filter((t) => t.cap).length / lettered.length : 0;
    if (words.length >= 2 && capRatio >= 0.5) w += 1;
    const i0 = toks.findIndex((t) => t.s >= s);
    const prev = i0 >= 0 ? prevWords(toks, i0, 3) : [];
    if (prev.some((t) => !t.cap && WORK_CUES.has(t.n))) w += 2.6;
    if (kind === 'q') {
      if (span.some((t) => PRONOUNS.has(t.l))) w -= 1.5;
      if (/[.!?;]\s+\S/.test(inner)) w -= 1.5;
      if (/[.!]$/.test(inner)) w -= 0.8;
      if (words.length > 10) w -= 1;
    }
    if (kind === 'i' || kind === 'em') {
      const sentStart = span[0] && span[0].sentStart;
      if (words.length === 1 && sentStart) w -= 0.7; else w += 0.5;
      if (words.length > 8) w -= 1;
      if (/[.!?]\s+\S/.test(inner)) w -= 1.5;
    }
    // Indices plus forts d'un autre type (ex. « Université Laval » entre guillemets)
    let type = 'work', score = w;
    if (span.length && !cjk) {
      const { sc } = scoreCore(span, inner, { prev, next: [], after: '', sentStart: false });
      for (const k of ['org', 'event', 'place']) if (sc[k] >= 2.5 && sc[k] > score) { type = k; score = sc[k]; }
    }
    if (score < 2) return null;
    return { s, e, type, score, kind: 'span', tokCount: span.length || 1 };
  }

  /* ---------- Chinois / japonais / coréen ---------- */
  let segmenters = {};
  function cjkCandidates(text, lang) {
    const out = [];
    if (!/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(text)) return out;
    if (typeof Intl === 'undefined' || !Intl.Segmenter) return out;
    const loc = /^ja/.test(lang) ? 'ja' : /^ko/.test(lang) ? 'ko' : /[\p{Script=Hiragana}\p{Script=Katakana}]/u.test(text) ? 'ja' : /\p{Script=Hangul}/u.test(text) ? 'ko' : 'zh';
    const seg = segmenters[loc] || (segmenters[loc] = new Intl.Segmenter(loc, { granularity: 'word' }));
    let prev = null;
    for (const sg of seg.segment(text)) {
      if (!sg.isWordLike) { prev = null; continue; }
      const w = sg.segment;
      const isCJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(w);
      if (!isCJK) { prev = null; continue; }
      if (CJK_PLACES.has(w)) out.push({ s: sg.index, e: sg.index + w.length, type: 'place', score: 3, kind: 'cjk', tokCount: 1 });
      const suf = CJK_ORG_SUFFIX.find((x) => w.endsWith(x));
      const evs = CJK_EVENT_SUFFIX.find((x) => w.endsWith(x));
      const typ = suf ? 'org' : evs ? 'event' : null;
      const sx = suf || evs;
      if (typ) {
        if (w.length > sx.length) out.push({ s: sg.index, e: sg.index + w.length, type: typ, score: 3, kind: 'cjk', tokCount: 1 });
        else if (prev && sg.index === prev.index + prev.segment.length) out.push({ s: prev.index, e: sg.index + w.length, type: typ, score: 3, kind: 'cjk', tokCount: 2 });
      }
      prev = sg;
    }
    return out;
  }

  /* ---------- Analyse d'un bloc ---------- */
  function analyzeBlock(block) {
    const text = block.text;
    const toks = tokenize(text);
    const cands = [];

    // Caractéristiques du bloc
    const wordToks = toks.filter((t) => /\p{L}/u.test(t.w) && t.w.length > 3);
    const capCount = wordToks.filter((t) => t.cap).length;
    // Titre/intertitre en « Title Case » (pas de ponctuation finale, majorité de mots à majuscule)
    const titleCaseBlock = wordToks.length >= 4 && wordToks.length <= 20 && capCount / wordToks.length >= 0.75 && !/[.!?:]\s*$/.test(text.trim());
    const lowerToks = toks.filter((t) => !t.cap && /\p{L}/u.test(t.w));
    const gfw = lowerToks.filter((t) => GERMAN_FW.has(t.n)).length;
    const nounCaps = /^de\b/.test(block.lang || '') || (toks.length >= 8 && gfw / Math.max(1, toks.length) > 0.1);
    const allCapsBlock = wordToks.length >= 3 && wordToks.every((t) => t.w === t.w.toUpperCase());

    // 1) Dates
    for (const re of DATE_RES) {
      re.lastIndex = 0;
      for (const m of text.matchAll(re)) cands.push({ s: m.index, e: m.index + m[0].length, type: 'date', score: 5, kind: 'date', tokCount: 1, prio: 3 });
    }
    // 2) Titres entre guillemets et en italique
    for (const [re, kind] of QUOTE_RES) {
      re.lastIndex = 0;
      for (const m of text.matchAll(re)) {
        const [s, e] = m.indices[1];
        const c = evalTitleSpan(text, toks, s, e, kind);
        if (c) { c.prio = 2; cands.push(c); }
      }
    }
    for (const it of block.italics || []) {
      const c = evalTitleSpan(text, toks, it.start, it.end, it.kind);
      if (c) { c.prio = 2; cands.push(c); }
    }
    // 3) CJK
    for (const c of cjkCandidates(text, block.lang || '')) { c.prio = 1; cands.push(c); }

    // 4) Séquences à majuscule
    if (!allCapsBlock) {
      for (const idx of buildSequences(toks)) {
        let a = idx[0], b = idx[idx.length - 1];
        let titleCue = false;
        const stripped = [];
        // Retrait des mots-outils / titres en tête
        while (a <= b) {
          const t = toks[a];
          if (t.cap && (TITLES.has(t.n) && a < b && (t.abbrev || !CONNECTORS.has(toks[a + 1].l)))) { titleCue = true; stripped.push(a); a++; continue; }
          if ((STOP_START.has(t.n) && !t.initial) || CONNECTORS.has(t.l) || t.elision) { stripped.push(a); a++; continue; }
          break;
        }
        while (b >= a && (CONNECTORS.has(toks[b].l) || CUE_CONNECTORS.has(toks[b].l))) b--;
        if (a > b) continue;
        let core = toks.slice(a, b + 1);
        if (core.length === 1 && (UI_WORDS.has(core[0].n) || STOP_START.has(core[0].n) || core[0].w.length < 2)) continue;
        if (core.every((t) => t.roman || t.digit)) continue;
        // Mot-indice générique isolé (« Université », « Straße ») : pas une entité
        if (b === a && cueModeOf(core[0]) && !core[0].acronym && !KNOWN_ORGS.has(core[0].n) && !PLACES.has(core[0].n)) continue;

        // Mot-indice en minuscules juste avant (« rue Sherbrooke », « musée des Beaux-Arts »)
        let pa = a;
        const back1 = toks[a - 1], back2 = toks[a - 2];
        const isCue = (t) => t && !t.cap && (ORG_CUES.has(t.n) || PLACE_CUES.has(t.n) || EVENT_CUES.has(t.n));
        if (!stripped.length || stripped[stripped.length - 1] !== a - 1) {
          if (isCue(back1) && contiguous(toks, a - 1, a)) pa = a - 1;
          else if (back1 && CONNECTORS.has(back1.l) && isCue(back2) && contiguous(toks, a - 2, a - 1) && contiguous(toks, a - 1, a)) pa = a - 2;
        }
        if (pa < a) { core = toks.slice(pa, b + 1); }
        const s0 = toks[pa].s, e0 = toks[b].e;
        const coreText = text.slice(s0, e0);
        const ctx = {
          prev: prevWords(toks, idx[0], 3).filter((t) => !stripped.includes(toks.indexOf(t))),
          next: nextWords(toks, b, 2),
          after: text.slice(e0, e0 + 40),
          sentStart: toks[pa].sentStart && pa === idx[0],
          titleCue, titleCaseBlock, nounCaps
        };
        const { sc, cue } = scoreCore(core, coreText, ctx);
        let { type, score } = best(sc);
        let s = s0;
        let e = e0;
        // Titre en apposition : « son roman, Bonheur d'occasion, paru en 1945 » ou « le roman Bonheur d'occasion (1945) »
        if (type === 'work' && toks[b + 1] && !toks[b + 1].cap && !toks[b].sentEnd) {
          const rest = text.slice(e0, e0 + 80);
          const mm = /^((?:[\s\u00A0]*[\p{L}\p{N}'’\-]+){1,5})(?=\s*(?:,|\(\s*\d{4}\s*\)))/u.exec(rest);
          const apposition = /,\s*$/.test(toks[idx[0]].gapBefore) || /^\s*\(\s*\d{4}/.test(rest.slice(mm ? mm[1].length : 0));
          if (mm && apposition) e = e0 + mm[1].length;
        }
        // Réintégrer l'article d'un titre d'œuvre (« Les Misérables »)
        if (type === 'work' && stripped.length && stripped[stripped.length - 1] === a - 1 && ARTICLES.has(toks[a - 1].n)) s = toks[a - 1].s;
        const acr = /^\s*\(\s*([\p{Lu}][\p{L}&.]{1,10})\s*\)/u.exec(ctx.after);
        cands.push({
          s, e, type: score >= THRESHOLD ? type : null, score, kind: 'seq', prio: 0,
          tokCount: core.length, sentStart: ctx.sentStart, cue,
          eligibleOther: !nounCaps && !titleCaseBlock && (core.length >= 2 || !ctx.sentStart) && !(core.length === 1 && core[0].roman),
          lastTok: core[core.length - 1], firstTok: core[0],
          acronymAfter: acr && (acr[1].match(/\p{Lu}/gu) || []).length >= 2 ? acr[1] : null
        });
      }
    }

    // Résolution des chevauchements : priorité puis score puis longueur
    cands.sort((x, y) => (y.prio - x.prio) || ((y.type ? 1 : 0) - (x.type ? 1 : 0)) || (y.score - x.score) || ((y.e - y.s) - (x.e - x.s)));
    const kept = [];
    for (const c of cands) {
      if (kept.some((k) => c.s < k.e && k.s < c.e)) continue;
      c.text = text.slice(c.s, c.e).replace(/[\s  ]+/g, ' ').trim();
      c.key = norm(c.text);
      if (!c.key) continue;
      kept.push(c);
    }
    kept.sort((x, y) => x.s - y.s);
    return kept;
  }

  /* ---------- Analyse d'une page (ensemble des blocs) ---------- */
  function analyze(blocks, opts) {
    opts = opts || {};
    const perBlock = blocks.map(analyzeBlock);
    const votes = new Map();
    const vote = (key, type, w) => {
      if (!key || !type) return;
      let v = votes.get(key);
      if (!v) votes.set(key, (v = {}));
      v[type] = (v[type] || 0) + w;
    };
    // Indices schema.org fournis par la page
    if (opts.hints) for (const [k, t] of opts.hints) vote(norm(k), t, 4);

    for (const list of perBlock) {
      for (const c of list) {
        if (c.type && c.type !== 'date' && c.kind !== 'span') vote(c.key, c.type, c.score);
        if (c.kind === 'span') vote(c.key, c.type, c.score);
        if (c.type === 'person' && c.tokCount >= 2 && c.lastTok && c.lastTok.cap && c.lastTok.w.length >= 3 &&
          !STOP_START.has(c.lastTok.n) && !PLACES.has(c.lastTok.n) && !c.lastTok.initial) {
          vote(c.lastTok.n, 'person', 1.6);
        }
        if (c.acronymAfter && c.type) vote(norm(c.acronymAfter), c.type, 3);
      }
    }
    const resolved = new Map();
    for (const [k, v] of votes) {
      let bt = null, bs = 0;
      for (const t in v) if (v[t] > bs) { bs = v[t]; bt = t; }
      if (bs >= THRESHOLD) resolved.set(k, bt);
    }

    const occurrences = [];
    perBlock.forEach((list, bi) => {
      for (const c of list) {
        let type = c.type;
        if (type === 'date') { /* garder */ }
        else if (resolved.has(c.key)) type = resolved.get(c.key);
        else if (!type) type = c.eligibleOther ? 'other' : null;
        if (!type) continue;
        occurrences.push({ block: bi, s: c.s, e: c.e, text: c.text, key: c.key, type });
      }
    });
    return occurrences;
  }

  g.NERX = { TYPES, analyze, analyzeBlock, tokenize, norm };
})(typeof window !== 'undefined' ? window : globalThis);
