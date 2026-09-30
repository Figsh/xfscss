/* editable */



const ALIAS = {
  m: 'margin', mt: 'margin-top', mb: 'margin-bottom', ml: 'margin-left', mr: 'margin-right',
  p: 'padding', pt: 'padding-top', pb: 'padding-bottom', pl: 'padding-left', pr: 'padding-right',
  fs: 'font-size', fw: 'font-weight', ff: 'font-family', lh: 'line-height',
  ls: 'letter-spacing', ta: 'text-align', td: 'text-decoration', tt: 'text-transform',
  ws: 'white-space', tsh: 'text-shadow',
  ov: 'overflow', ovx: 'overflow-x', ovy: 'overflow-y',
  z: 'z-index', op: 'opacity', cur: 'cursor', pe: 'pointer-events', us: 'user-select', pos: 'position',
  jc: 'justify-content', ai: 'align-items', ac: 'align-content',
  ji: 'justify-items', js: 'justify-self', as: 'align-self', pi: 'place-items',
  fdir: 'flex-direction', fwrap: 'flex-wrap', grow: 'flex-grow', shrink: 'flex-shrink', basis: 'flex-basis',
  trans: 'transition', anim: 'animation', tf: 'transform', fil: 'filter',
  shadow: 'box-shadow', aspect: 'aspect-ratio', 'obj-fit': 'object-fit', 'obj-pos': 'object-position',
};

const track = (v) => (/^\d+$/.test(v) ? `repeat(${v}, 1fr)` : v);

const HELPERS = {
  center: (v) =>
    v === 'x' ? 'display: flex; justify-content: center;' :
    v === 'y' ? 'display: flex; align-items: center;' :
    'display: grid; place-items: center;',
  stack:  (v) => `display: flex; flex-direction: column; gap: ${v};`,
  hstack: (v) => `display: flex; flex-direction: row; gap: ${v};`,
  fill:   (v) => `position: ${v === 'fixed' ? 'fixed' : 'absolute'}; inset: 0;`,
  'abs-center': () => 'position: absolute; inset: 0; margin: auto;',
  truncate: () => 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;',
  'line-clamp': (v) =>
    `display: -webkit-box; -webkit-line-clamp: ${v}; -webkit-box-orient: vertical; line-clamp: ${v}; overflow: hidden;`,
  cols: (v) => `display: grid; grid-template-columns: ${track(v)};`,
  rows: (v) => `display: grid; grid-template-rows: ${track(v)};`,
  'auto-fit': (v) => `display: grid; grid-template-columns: repeat(auto-fit, minmax(${v}, 1fr));`,
  glass: (v) => `backdrop-filter: blur(${v}); -webkit-backdrop-filter: blur(${v});`,
  ring:  (v) => `box-shadow: 0 0 0 ${v};`,
};

function expandMoreShorthands(css) {
  // wrapRe is the shared helper from the main FSCSS file (single copy).
  const run = (name, fn) => {
    const re = wrapRe(new RegExp(`${name}\\s*:\\s*([^;]+);`, 'gi'));
    css = css.replace(re, (_, v) => fn(v.trim()));
  };


  for (const [name, fn] of Object.entries(HELPERS)) run(name, fn);
  for (const [short, long] of Object.entries(ALIAS)) run(short, (v) => `${long}: ${v};`);

  return css;
}


const wrapRe = (re) => new RegExp(
  (/^\(\?</.test(re.source) ? '' : '(?<![\\w-])') +
  re.source.replace(/^\\b/, '').replace('([^;]+);', '([^;{}]+?)\\s*(?:;|(?=\\s*\\}))'),
  re.flags
);

const SIDEABLE = {
  padding:        (side) => `padding-${side}`,
  margin:         (side) => `margin-${side}`,
  'border-width': (side) => `border-${side}-width`,
  'border-style': (side) => `border-${side}-style`,
  'border-color': (side) => `border-${side}-color`,
  border:         (side) => `border-${side}`,
  inset:          (side) => side,
  offset:         (side) => side,
  'border-radius': (side) => {
    const map = {
      top:    ['border-top-left-radius', 'border-top-right-radius'],
      bottom: ['border-bottom-left-radius', 'border-bottom-right-radius'],
      left:   ['border-top-left-radius', 'border-bottom-left-radius'],
      right:  ['border-top-right-radius', 'border-bottom-right-radius'],
      'block-start':  ['border-start-start-radius', 'border-start-end-radius'],
      'block-end':    ['border-end-start-radius', 'border-end-end-radius'],
      'inline-start': ['border-start-start-radius', 'border-end-start-radius'],
      'inline-end':   ['border-start-end-radius', 'border-end-end-radius'],
    };
    return map[side] || [`border-${side}-radius`];
  },
};

function rewriteForSide(decl, side) {
  const colon = decl.indexOf(':');
  if (colon === -1) return decl;

  const prop = decl.slice(0, colon).trim().toLowerCase();
  const value = decl.slice(colon + 1).trim().replace(/;$/, '');

  const rewriter = SIDEABLE[prop];
  if (!rewriter) return `${prop}: ${value};`;

  const result = rewriter(side);
  if (Array.isArray(result)) {
    return result.map(p => `${p}: ${value};`).join(' ');
  }
  return `${result}: ${value};`;
}

function expandSideBlocks(css) {
  const blockRe = /((?:top|bottom|left|right|block-start|block-end|inline-start|inline-end))\s*\|\s*([\s\S]*?)\s*\|/gi;

  return css.replace(blockRe, (full, sideRaw, body) => {
    const side = sideRaw.toLowerCase().trim();
    const validSides = [
      'top', 'bottom', 'left', 'right',
      'block-start', 'block-end', 'inline-start', 'inline-end'
    ];

    if (!validSides.includes(side)) {
      console.warn(`fscss[axis] Unknown side "${side}" – left unchanged`);
      return full;
    }

    const decls = body
      .split(';')
      .map(d => d.replace(/^,+\s*|,+\s*$/g, '').trim())
      .filter(Boolean);

    return decls.map(d => rewriteForSide(d, side)).join(' ');
  });
}

/* ------------------------------------------------------------------ */
/*  Axis + short property expanders                                   */
/* ------------------------------------------------------------------ */

function expandAxisShorthands(css) {
  const r = (re, repl) => { css = css.replace(wrapRe(re), repl); };

  // ── inset ──────────────────────────────────────────────────────
  r(/inset-x\s*:\s*([^;]+);/gi, (_, v) => `left: ${v.trim()}; right: ${v.trim()};`);
  r(/inset-y\s*:\s*([^;]+);/gi, (_, v) => `top: ${v.trim()}; bottom: ${v.trim()};`);

  // ── scroll margin / padding  (BEFORE short mx/my/px/py) ────────
  r(/scroll-mx\s*:\s*([^;]+);/gi, (_, v) => `scroll-margin-left: ${v.trim()}; scroll-margin-right: ${v.trim()};`);
  r(/scroll-my\s*:\s*([^;]+);/gi, (_, v) => `scroll-margin-top: ${v.trim()}; scroll-margin-bottom: ${v.trim()};`);
  r(/scroll-px\s*:\s*([^;]+);/gi, (_, v) => `scroll-padding-left: ${v.trim()}; scroll-padding-right: ${v.trim()};`);
  r(/scroll-py\s*:\s*([^;]+);/gi, (_, v) => `scroll-padding-top: ${v.trim()}; scroll-padding-bottom: ${v.trim()};`);

  // ── margin (long + short) ──────────────────────────────────────
  r(/margin-x\s*:\s*([^;]+);/gi, (_, v) => `margin-left: ${v.trim()}; margin-right: ${v.trim()};`);
  r(/margin-y\s*:\s*([^;]+);/gi, (_, v) => `margin-top: ${v.trim()}; margin-bottom: ${v.trim()};`);
  r(/(?<![\w-])mx\s*:\s*([^;]+);/gi, (_, v) => `margin-left: ${v.trim()}; margin-right: ${v.trim()};`);
  r(/(?<![\w-])my\s*:\s*([^;]+);/gi, (_, v) => `margin-top: ${v.trim()}; margin-bottom: ${v.trim()};`);

  // ── padding (long + short) ─────────────────────────────────────
  r(/padding-x\s*:\s*([^;]+);/gi, (_, v) => `padding-left: ${v.trim()}; padding-right: ${v.trim()};`);
  r(/padding-y\s*:\s*([^;]+);/gi, (_, v) => `padding-top: ${v.trim()}; padding-bottom: ${v.trim()};`);
  r(/(?<![\w-])px\s*:\s*([^;]+);/gi, (_, v) => `padding-left: ${v.trim()}; padding-right: ${v.trim()};`);
  r(/(?<![\w-])py\s*:\s*([^;]+);/gi, (_, v) => `padding-top: ${v.trim()}; padding-bottom: ${v.trim()};`);

  // ── gap ────────────────────────────────────────────────────────
  r(/gap-x\s*:\s*([^;]+);/gi, (_, v) => `column-gap: ${v.trim()};`);
  r(/gap-y\s*:\s*([^;]+);/gi, (_, v) => `row-gap: ${v.trim()};`);

  // ── size shortcuts ─────────────────────────────────────────────
  r(/min-size\s*:\s*([^;]+);/gi, (_, v) => {
    const parts = v.trim().split(/\s+/);
    if (parts.length === 1) return `min-width: ${parts[0]}; min-height: ${parts[0]};`;
    return `min-width: ${parts[0]}; min-height: ${parts[1]};`;
  });
  r(/max-size\s*:\s*([^;]+);/gi, (_, v) => {
    const parts = v.trim().split(/\s+/);
    if (parts.length === 1) return `max-width: ${parts[0]}; max-height: ${parts[0]};`;
    return `max-width: ${parts[0]}; max-height: ${parts[1]};`;
  });
  r(/(?<![\w-])size\s*:\s*([^;]+);/gi, (_, v) => {
    const parts = v.trim().split(/\s+/);
    if (parts.length === 1) return `width: ${parts[0]}; height: ${parts[0]};`;
    return `width: ${parts[0]}; height: ${parts[1]};`;
  });

  r(/(?<![\w-])w\s*:\s*([^;]+);/gi,   (_, v) => `width: ${v.trim()};`);
  r(/(?<![\w-])h\s*:\s*([^;]+);/gi,   (_, v) => `height: ${v.trim()};`);
  r(/min-w\s*:\s*([^;]+);/gi,         (_, v) => `min-width: ${v.trim()};`);
  r(/max-w\s*:\s*([^;]+);/gi,         (_, v) => `max-width: ${v.trim()};`);
  r(/min-h\s*:\s*([^;]+);/gi,         (_, v) => `min-height: ${v.trim()};`);
  r(/max-h\s*:\s*([^;]+);/gi,         (_, v) => `max-height: ${v.trim()};`);

  // ── place-x / place-y ──────────────────────────────────────────
  r(/place-x\s*:\s*([^;]+);/gi, (_, v) =>
    `justify-content: ${v.trim()}; justify-items: ${v.trim()};`
  );
  r(/place-y\s*:\s*([^;]+);/gi, (_, v) =>
    `align-content: ${v.trim()}; align-items: ${v.trim()};`
  );

  // ── transform-origin axis ──────────────────────────────────────
  r(/origin-x\s*:\s*([^;]+);/gi, (_, v) => `transform-origin: ${v.trim()} center;`);
  r(/origin-y\s*:\s*([^;]+);/gi, (_, v) => `transform-origin: center ${v.trim()};`);

  // ── object-position axis ───────────────────────────────────────
  r(/object-x\s*:\s*([^;]+);/gi, (_, v) => `object-position: ${v.trim()} center;`);
  r(/object-y\s*:\s*([^;]+);/gi, (_, v) => `object-position: center ${v.trim()};`);

  // ── safe-area ──────────────────────────────────────────────────
  r(/safe-x\s*:\s*([^;]+);/gi, (_, v) => {
    const val = v.trim();
    return `padding-left: max(${val}, env(safe-area-inset-left)); padding-right: max(${val}, env(safe-area-inset-right));`;
  });
  r(/safe-y\s*:\s*([^;]+);/gi, (_, v) => {
    const val = v.trim();
    return `padding-top: max(${val}, env(safe-area-inset-top)); padding-bottom: max(${val}, env(safe-area-inset-bottom));`;
  });
  r(/inset-safe\s*:\s*([^;]+);/gi, (_, v) => {
    const val = v.trim() === '0' || v.trim() === '' ? '0px' : v.trim();
    return [
      `top: max(${val}, env(safe-area-inset-top))`,
      `right: max(${val}, env(safe-area-inset-right))`,
      `bottom: max(${val}, env(safe-area-inset-bottom))`,
      `left: max(${val}, env(safe-area-inset-left))`
    ].join('; ') + ';';
  });

  return css;
}

/* ------------------------------------------------------------------ */
/*  Border shorthands                                                 */
/* ------------------------------------------------------------------ */

function expandBorderShorthands(css) {
  const r = (re, repl) => { css = css.replace(re, repl); };

  // ── full border axis (accepts full values like "2px solid #333") ─
  r(/border-x\s*:\s*([^;]+);/gi, (_, v) =>
    `border-left: ${v.trim()}; border-right: ${v.trim()};`
  );
  r(/border-y\s*:\s*([^;]+);/gi, (_, v) =>
    `border-top: ${v.trim()}; border-bottom: ${v.trim()};`
  );

  // ── single-side full border ────────────────────────────────────
  r(/border-t\s*:\s*([^;]+);/gi, (_, v) => `border-top: ${v.trim()};`);
  r(/border-b\s*:\s*([^;]+);/gi, (_, v) => `border-bottom: ${v.trim()};`);
  r(/border-l\s*:\s*([^;]+);/gi, (_, v) => `border-left: ${v.trim()};`);
  r(/border-r\s*:\s*([^;]+);/gi, (_, v) => `border-right: ${v.trim()};`);

  // ── border-width shortcuts (bw*) ───────────────────────────────
  r(/\bbw-x\s*:\s*([^;]+);/gi, (_, v) =>
    `border-left-width: ${v.trim()}; border-right-width: ${v.trim()};`
  );
  r(/\bbw-y\s*:\s*([^;]+);/gi, (_, v) =>
    `border-top-width: ${v.trim()}; border-bottom-width: ${v.trim()};`
  );
  r(/\bbw-t\s*:\s*([^;]+);/gi, (_, v) => `border-top-width: ${v.trim()};`);
  r(/\bbw-b\s*:\s*([^;]+);/gi, (_, v) => `border-bottom-width: ${v.trim()};`);
  r(/\bbw-l\s*:\s*([^;]+);/gi, (_, v) => `border-left-width: ${v.trim()};`);
  r(/\bbw-r\s*:\s*([^;]+);/gi, (_, v) => `border-right-width: ${v.trim()};`);
  r(/(?<![\w-])bw\s*:\s*([^;]+);/gi, (_, v) => `border-width: ${v.trim()};`);

  // ── border-style shortcuts (bs*) ───────────────────────────────
  r(/\bbs-x\s*:\s*([^;]+);/gi, (_, v) =>
    `border-left-style: ${v.trim()}; border-right-style: ${v.trim()};`
  );
  r(/\bbs-y\s*:\s*([^;]+);/gi, (_, v) =>
    `border-top-style: ${v.trim()}; border-bottom-style: ${v.trim()};`
  );
  r(/\bbs-t\s*:\s*([^;]+);/gi, (_, v) => `border-top-style: ${v.trim()};`);
  r(/\bbs-b\s*:\s*([^;]+);/gi, (_, v) => `border-bottom-style: ${v.trim()};`);
  r(/\bbs-l\s*:\s*([^;]+);/gi, (_, v) => `border-left-style: ${v.trim()};`);
  r(/\bbs-r\s*:\s*([^;]+);/gi, (_, v) => `border-right-style: ${v.trim()};`);
  r(/(?<![\w-])bs\s*:\s*([^;]+);/gi, (_, v) => `border-style: ${v.trim()};`);

  // ── border-color shortcuts (bc*) ───────────────────────────────
  r(/\bbc-x\s*:\s*([^;]+);/gi, (_, v) =>
    `border-left-color: ${v.trim()}; border-right-color: ${v.trim()};`
  );
  r(/\bbc-y\s*:\s*([^;]+);/gi, (_, v) =>
    `border-top-color: ${v.trim()}; border-bottom-color: ${v.trim()};`
  );
  r(/\bbc-t\s*:\s*([^;]+);/gi, (_, v) => `border-top-color: ${v.trim()};`);
  r(/\bbc-b\s*:\s*([^;]+);/gi, (_, v) => `border-bottom-color: ${v.trim()};`);
  r(/\bbc-l\s*:\s*([^;]+);/gi, (_, v) => `border-left-color: ${v.trim()};`);
  r(/\bbc-r\s*:\s*([^;]+);/gi, (_, v) => `border-right-color: ${v.trim()};`);
  r(/(?<![\w-])bc\s*:\s*([^;]+);/gi, (_, v) => `border-color: ${v.trim()};`);

  // ── radius / rounded ───────────────────────────────────────────
  // individual corners first (longer names)
  const cornerMap = {
    'rounded-tl': 'border-top-left-radius',
    'rounded-tr': 'border-top-right-radius',
    'rounded-bl': 'border-bottom-left-radius',
    'rounded-br': 'border-bottom-right-radius',
    'radius-tl':  'border-top-left-radius',
    'radius-tr':  'border-top-right-radius',
    'radius-bl':  'border-bottom-left-radius',
    'radius-br':  'border-bottom-right-radius',
  };
  for (const [short, long] of Object.entries(cornerMap)) {
    r(new RegExp(`${short}\\s*:\\s*([^;]+);`, 'gi'), (_, v) =>
      `${long}: ${v.trim()};`
    );
  }

  // side pairs
  const sideRadiusMap = {
    'rounded-t': ['border-top-left-radius', 'border-top-right-radius'],
    'rounded-b': ['border-bottom-left-radius', 'border-bottom-right-radius'],
    'rounded-l': ['border-top-left-radius', 'border-bottom-left-radius'],
    'rounded-r': ['border-top-right-radius', 'border-bottom-right-radius'],
    'radius-top':    ['border-top-left-radius', 'border-top-right-radius'],
    'radius-bottom': ['border-bottom-left-radius', 'border-bottom-right-radius'],
    'radius-left':   ['border-top-left-radius', 'border-bottom-left-radius'],
    'radius-right':  ['border-top-right-radius', 'border-bottom-right-radius'],
  };
  for (const [short, longs] of Object.entries(sideRadiusMap)) {
    r(new RegExp(`${short}\\s*:\\s*([^;]+);`, 'gi'), (_, v) =>
      longs.map(p => `${p}: ${v.trim()};`).join(' ')
    );
  }

  // plain rounded / radius
  r(/(?<![\w-])rounded\s*:\s*([^;]+);/gi, (_, v) => `border-radius: ${v.trim()};`);
  r(/(?<![\w-])radius\s*:\s*([^;]+);/gi,  (_, v) => `border-radius: ${v.trim()};`);

  return css;
}

/* ------------------------------------------------------------------ */
/*  Background helpers                                                */
/* ------------------------------------------------------------------ */

function expandBgShorthands(css) {
  const r = (re, repl) => { css = css.replace(re, repl); };

  r(/bg-x\s*:\s*([^;]+);/gi, (_, v) => `background-position-x: ${v.trim()};`);
  r(/bg-y\s*:\s*([^;]+);/gi, (_, v) => `background-position-y: ${v.trim()};`);

  r(/bg-size-x\s*:\s*([^;]+);/gi, (_, v) => `background-size: ${v.trim()} auto;`);
  r(/bg-size-y\s*:\s*([^;]+);/gi, (_, v) => `background-size: auto ${v.trim()};`);

  r(/bg-color\s*:\s*([^;]+);/gi,      (_, v) => `background-color: ${v.trim()};`);
  r(/bg-image\s*:\s*([^;]+);/gi,      (_, v) => `background-image: ${v.trim()};`);
  r(/bg-repeat\s*:\s*([^;]+);/gi,     (_, v) => `background-repeat: ${v.trim()};`);
  r(/bg-pos\s*:\s*([^;]+);/gi,        (_, v) => `background-position: ${v.trim()};`);
  r(/bg-attachment\s*:\s*([^;]+);/gi, (_, v) => `background-attachment: ${v.trim()};`);
  r(/bg-clip\s*:\s*([^;]+);/gi,       (_, v) => `background-clip: ${v.trim()};`);
  r(/bg-origin\s*:\s*([^;]+);/gi,     (_, v) => `background-origin: ${v.trim()};`);
  r(/bg-size\s*:\s*([^;]+);/gi,       (_, v) => `background-size: ${v.trim()};`);

  r(/(?<![\w-])bg\s*:\s*([^;]+);/gi, (_, v) => `background: ${v.trim()};`);

  return css;
}

/* ------------------------------------------------------------------ */
/*  ratio-fit()                                                       */
/* ------------------------------------------------------------------ */

function expandRatioFit(css) {
  return css.replace(
    /inset\s*:\s*ratio-fit\(\s*([\d.]+)\s*\/\s*([\d.]+)\s*\)\s*;?/gi,
    (_, w, h) => {
      const ratio = `${w} / ${h}`;
      return [
        'position: absolute',
        'inset: 0',
        'margin: auto',
        `aspect-ratio: ${ratio}`,
        `width: min(100%, 100cqh * ${w} / ${h})`,
        `height: min(100%, 100cqw * ${h} / ${w})`
      ].join('; ') + ';';
    }
  );
}

/* ------------------------------------------------------------------ */
/*  Main entry                                                        */
/* ------------------------------------------------------------------ */

function procAxisShorthand(code) {
  let out = code;

  // 1. Side-scoped blocks first
  out = expandSideBlocks(out);

  // 2. Axis + short properties
  out = expandAxisShorthands(out);
  out = expandMoreShorthands(out);
  // 3. Border shorthands
  out = expandBorderShorthands(out);

  // 4. Background helpers
  out = expandBgShorthands(out);

  // 5. ratio-fit
  out = expandRatioFit(out);

  out = out.replace(/\n{3,}/g, '\n\n').trim();
  return out;
}

export { procAxisShorthand }
