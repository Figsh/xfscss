// lip/functions/impFrom.js

import fs from "fs/promises";
import path from "path";


export async function impFrom(text, {inputDir=process.cwd()} = {}) {
  
  const regex = /\@import\((?:\s+)?(?:exec)?\(([\w\d\.\@\—\-_*\#\$\s\,]+)\)(?:\s+)?from(?:\s+)?(?:"([^"]+)"|'([^']+)'|`([^`]+)`)(?:\s+)?\)/g;
  
  const matches = [...text.matchAll(regex)]
  
  let result = text;
  
  for (const match of matches) {
    let [fullMatch, blocks, url1, url2, url3] = match;
    
    blocks = blocks.trim();
    
    const impUrl = (url1 || url2 || url3).trim();
    
    try {
      let resRegex;
      let resText;
      if(/^https?:\/\//.test(impUrl)){
        // remote 
      const response = await fetch(impUrl);
      
      if (!response.ok) throw new Error(`fscss[@import] HTTP ${response.status} for ${impUrl}`);
      
      resText = await response.text();
      }
      else{
        // local 
        const fillPath = path.resolve(inputDir, impUrl);
        resText = await fs.readFile(fillPath, 'utf8');
      }
      if (blocks === '*') {
        result = result.replace(fullMatch, resText);
      }
      if (blocks !== '*' && blocks.includes('*')) {
        console.warn(`[FSCSS Warning] syntax error at ${fullMatch}: unexpected *`);
        result = result.replace(fullMatch, `/* syntax error: unexpected * */`);
      }
      if (blocks !== '*' && !blocks.includes('*')) {
        const arblock = blocks.split(",").map(a => a.trim());
        const exblocks = await findBlock(resText, arblock);
        result = result.replace(fullMatch, exblocks);
      }
      
    } catch (error) {
      console.error(`fscss[@import]  Failed: ${impUrl} `, error);
      
      result = result.replace(fullMatch, `/* Failed import: ${impUrl} */`);
      
    }
  }
  return result;
}

async function findBlock(text, blocks = []) {
  if (!text || text === "" || typeof text !== "string") return console.warn("FSCSS >Invalid input");
  if (!blocks || blocks.length === 0) return console.warn("FSCSS >Invalid input");
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
  return resBlock.trim();
}
