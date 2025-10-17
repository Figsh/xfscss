#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { processFscss } from "../lib/processor.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const input = process.argv[2];
const output = process.argv[3] || "out.css";

if (!input) {
  console.error("Usage: fscss <input.fscss> [output.css]");
  process.exit(1);
}

const inputPath = path.resolve(process.cwd(), input);
const outputPath = path.resolve(process.cwd(), output);

try {
  const css = fs.readFileSync(inputPath, "utf8");
  
  const processed = await processFscss(css);

  if (typeof processed !== "string") {
    throw new TypeError("processFscss did not return a string");
  }

  fs.writeFileSync(outputPath, processed, "utf8");
  console.log(`[FSCSS] ✔ Compiled ${input} → ${output}`);
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
}
