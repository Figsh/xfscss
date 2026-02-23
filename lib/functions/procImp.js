import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

function fetchRemote(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, res => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch ${url}, status ${res.statusCode}`));
        return;
      }
      let data = "";
      res.on("data", chunk => (data += chunk));
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

export async function procImp(css, { inputDir }) {
  // async replace: collect promises then resolve
  const matches = [...css.matchAll(/@import\(exec\(([^)]+)\)\)/g)];

  for (const match of matches) {
    const rawPath = match[1].trim();
    let importedContent = "";

    if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
      // remote import
      importedContent = await fetchRemote(rawPath);
    } else {
      // local import
      const absPath = path.resolve(inputDir, rawPath);
      if (!fs.existsSync(absPath)) {
        throw new Error(`FSCSS import failed: file not found ${absPath}`);
      }
      importedContent = fs.readFileSync(absPath, "utf8");

      // recursive support (nested imports)
      importedContent = await procImp(importedContent, {
        inputDir: path.dirname(absPath),
      });
    }

    css = css.replace(match[0], importedContent);
  }

  return css;
}
