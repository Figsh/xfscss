// lip/functions/impFrom.js

import fs from "fs/promises";
import path from "path";
import { initlibraries } from "./all.js";

const isRemote = (s) => /^https?:\/\//.test(s);

// resolve an import path against the importing file's location (dir or URL)
function resolveImport(spec, base) {
  if (isRemote(spec)) return spec;
  if (isRemote(base)) return new URL(spec, base).href;
  return path.resolve(base, spec);
}

// location that nested imports inside this file resolve against
function baseOf(resolved) {
  return isRemote(resolved) ? resolved : path.dirname(resolved);
}

async function readSource(resolved) {
  if (isRemote(resolved)) {
    const response = await fetch(resolved);
    if (!response.ok) throw new Error(`fscss[@import] HTTP ${response.status} for ${resolved}`);
    return response.text();
  }
  return fs.readFile(resolved, "utf8");
}

export async function impFrom(text, { inputDir = process.cwd() } = {}) {
  return resolveImports(text, inputDir, [], new Set());
}

async function resolveImports(text, base, stack, seen) {
  text = await initlibraries(text);
  const regex = /\@import\((?:\s+)?(?:exec)?\(([\w\d\.\@\—\-_*\#\$\s\,]+)\)(?:\s+)?from(?:\s+)?(?:"([^"]+)"|'([^']+)'|`([^`]+)`)(?:\s+)?\)/g;

  let result = text;

  for (const match of [...text.matchAll(regex)]) {
    let [fullMatch, blocks, url1, url2, url3] = match;
    blocks = blocks.trim();
    const impUrl = resolveImport((url1 || url2 || url3).trim(), base);

    if (stack.includes(impUrl)) {
      console.warn(`[FSCSS Warning] Circular import ${impUrl}`);
      result = result.replace(fullMatch, () => `/* Circular import: ${impUrl} */`);
      continue;
    }

    if (blocks === "*" && seen.has(impUrl)) {
      console.warn(`[FSCSS Warning] Can't import ${impUrl} multiple times`);
      result = result.replace(fullMatch, () => `/* Can't import ${impUrl} multiple times */`);
      continue;
    }

    try {
      // resolve the imported file's own imports first
      const raw = await readSource(impUrl);
      const resText = await resolveImports(raw, baseOf(impUrl), [...stack, impUrl], seen);

      let out = "";
      if (blocks === "*") {
        seen.add(impUrl);
        out = resText;
      } else if (blocks.includes("*")) {
        console.warn(`[FSCSS Warning] syntax error at ${fullMatch}: unexpected *`);
        out = `/* syntax error: unexpected * */`;
      } else {
        out = (await findBlock(resText, blocks.split(",").map((a) => a.trim()))) ?? "";
      }

      // function replacer so $ patterns in CSS are not interpreted
      result = result.replace(fullMatch, () => out);
    } catch (error) {
      console.error(`fscss[@import] Failed: ${impUrl}`, error);
      result = result.replace(fullMatch, () => `/* Failed import: ${impUrl} */`);
    }
  }

  return result;
}

const DEFINE = '@define\\s+([\\w-]+)\\s*\\(([^)]*)\\)\\s*\\$?\\{\\s*(?:"([^"]*)"|\'([^\']*)\'|`([^`]*)`|([^\\}^\\{]*?))\\s*\\}';

function collectDeps(text, names) {
  const defs = new Map();
  for (const m of text.matchAll(new RegExp(DEFINE, "g"))) defs.set(m[1], m[0]);

  const need = new Set();
  const queue = [...names];
  while (queue.length) {
    const def = defs.get(queue.pop());
    if (!def) continue;
    for (const c of def.matchAll(/@([\w-]+)\s*\(/g)) {
      const dep = c[1];
      if (defs.has(dep) && !need.has(dep) && !names.includes(dep)) {
        need.add(dep);
        queue.push(dep);
      }
    }
  }
  return [...need].map((n) => defs.get(n)).join("\n");
}


function findBlock(text, blocks = []) {
  if (!text || text === "" || typeof text !== "string") return console.warn("FSCSS >Invalid input");
  if (!blocks || blocks.length === 0){
    console.warn("FSCSS >Invalid input");
    return '';
  } 
  let resBlock = '';
  
  blocks.forEach(key => {
    let blk = '';
    let keyname = key;
    
    //Captures the source, the 'as' keyword, and 
    const aliasRegex = /([^\s]+)(?:\s+as\s+([^\s]+))?/;
    const matchAs = key.trim().match(aliasRegex);
    
    if (matchAs) {
      const [_, name, alias] = matchAs;
      keyname = name;
      if (alias) {
        blk = alias;
      } else if (key.includes(' as')) {
        // Handles the "func as " (missing alias) case
        console.warn(`[FSCSS Warning] Can't assign @${name} to invalid or empty value`);
        blk = name;
      } else {
        blk = name;
      }
    }
    
    const regex = new RegExp('@define\\s+(' + keyname + ')\\s*\\(([^)]*)\\)\\s*\\$?\\{\\s*(?:"([^"]*)"|\'([^\']*)\'|`([^`]*)`|([^\\}^\\{]*?))\\s*\\}', "g");
    
    const match = text.match(regex);
    if (!match) {
      return console.warn(`[FSCSS Warning] @${keyname} is undefined for import`);
    }
    const resRegex = new RegExp('(@define\\s+)(' + keyname + ')(\\s*\\(([^)]*)\\)\\s*\\$?\\{\\s*(?:"([^"]*)"|\'([^\']*)\'|`([^`]*)`|([^\\}^\\{]*?))\\s*\\})', 'g');
    
    resBlock += (match.join('\n')).replace(resRegex, (m, g1, g2, g3) => {
      return `${g1}${blk}${g3}`;
    }) + '\n';
  })
  // before: return resBlock.trim();
const names = blocks.map((k) => k.trim().split(/\s+as\s+/)[0]);
return (resBlock + "\n" + collectDeps(text, names)).trim();
}

