#!/usr/bin/env node
const fs = require('fs/promises');
const path = require('path');

async function main() {
  const files = process.argv.slice(2);
  const targets = files.length ? files : [path.join(process.cwd(), '.figma_cache', 'handoff.md')];

  for (const target of targets) {
    const absolute = path.resolve(target);
    const text = await fs.readFile(absolute, 'utf-8');
    const chars = text.length;
    const roughTokens = Math.ceil(chars / 4);
    console.log(`${absolute}\n  chars=${chars}\n  rough_tokens=${roughTokens}`);
  }
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
