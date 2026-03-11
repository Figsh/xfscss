// lip/functions/procImp.js

import fs from "fs/promises";
import path from "path";
import { initlibraries } from "./all.js";
const runnedSetImp = new Set();

async function impFrom(text, {inputDir=process.cwd()} = {}) {
  text = await initlibraries(text);
  const regex = /\@import\((?:\s+)?exec\((?:\s+)?(?:"([^"]+)"|'([^']+)'|`([^`]+)`|([^\)]+)(?:\s+)?)\)(?:\s+)?\)/g;
  
  const matches = [...text.matchAll(regex)];
  
  let result = text;
  let setFile = null;
  
  
  for (const match of matches) {
    let [fullMatch, url1, url2, url3, url4] = match;
    
    const impUrl = (url1 || url2 || url3 || url4).trim();
    setFile = impUrl;
    
    if (runnedSetImp.has(setFile)) {
      // Helper to escape special characters in the filename (like dots or dashes)
      const escapedFile = setFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Simplified regex using \s* for zero-or-more whitespace
      const fregex = new RegExp("\\@import\\((?:\\s+)?exec\\((?:\\s+)?(?:\"("+ escapedFile + ")\"|'("+ escapedFile + ")'|`("+ escapedFile + ")`|("+ escapedFile + ")(?:\\s+)?)\\)(?:\\s+)?\\)", 'g');
      
      
      result = result.replace(fregex, `/* Can't import ${setFile} multiple times */`);
      
      console.warn(`[FSCSS Warning]  Can't import ${setFile} multiple times at `);
    }
    
    
    try {
      
      let resRegex;
      
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
      
      result = result.replace(fullMatch, resText);
      
    } catch (error) {
      console.error(`fscss[@import]  Failed: ${impUrl} `, error);
      
      result = result.replace(fullMatch, `/* Failed import: ${impUrl} */`);
      
    }
  }
  
  if (!result.match(regex)) return result;
  runnedSetImp.add(setFile);
  return procImp(result);
}


