// lib/functions/impSel.js
import fs from "fs/promises";
import path from "path";

export async function impSel(text, { inputDir = process.cwd() } = {}) {
  const validImpExt = [".fscss", ".css", ".txt", ".scss", ".less", ".xfscss"];
  const regex = /@import\(exec\(([^)]+)\)\s*\.\s*(?:pick|find)\(([^)]+)\)\)/g;
  const matches = [...text.matchAll(regex)];

  let result = text;

  for (const match of matches) {
    const [fullMatch, urlSrc, part] = match;

    try {
      const impUrl = urlSrc.replace(/["']/g, "");
      const impExt = impUrl.slice(impUrl.lastIndexOf(".")).toLowerCase();

      if (impUrl.trim().startsWith("_init") && impUrl.includes(" ")) {
        console.warn(`fscss[@import] library not found for: ${impUrl}`);
        continue;
      }

      if (!validImpExt.includes(impExt)) {
        console.warn(`fscss[@import] invalid extension for: ${impUrl}`);
        continue;
      }

      let resText;

      if (/^https?:\/\//.test(impUrl)) {
        // Remote import
        const response = await fetch(impUrl);
        if (!response.ok) {
          throw new Error(`fscss[@import] HTTP ${response.status} for ${impUrl}`);
        }
        resText = await response.text();
      } else {
        // Local import
        const filePath = path.resolve(inputDir, impUrl);
        resText = await fs.readFile(filePath, "utf8");
      }

      const extracted = extractOnlyBlock(resText, part.trim());
      result = result.replace(fullMatch, extracted || `/* fscss[@import pick] No block matches: ${part} */`);
    } catch (err) {
      console.error(`fscss[@import] Failed: ${urlSrc}`, err);
      result = result.replace(fullMatch, `/* Failed import: ${urlSrc} */`);
    }
  }

  return result;
}

function extractOnlyBlock(cssText, blockName) {
  const regex = new RegExp(`${blockName}\\s*{[^}]*}`, "g");
  const match = cssText.match(regex);
  return match ? match.join("\n") : null;
}
