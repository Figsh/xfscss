#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { processFscss } from "../lib/processor.js";

// resolve __dirname in ES modules
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
  const processed = processFscss(css);

  fs.writeFileSync(outputPath, processed, "utf8");
  console.log(`✔ Compiled ${input} → ${output}`);
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
}
