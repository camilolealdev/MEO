import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { compile } from "@mdx-js/mdx";

const DIR = path.join(process.cwd(), "content", "frameworks");
const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx")).sort();

async function main() {
  let bad = 0;
  for (const f of files) {
    const raw = fs.readFileSync(path.join(DIR, f), "utf8");
    const { content } = matter(raw);
    try {
      await compile(content, { format: "mdx" });
    } catch (e) {
      bad++;
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`FAIL ${f}: ${msg.split("\n")[0]}`);
      const m = msg.match(/\((\d+):(\d+)-(\d+):(\d+)\)/);
      if (m) {
        const line = Number(m[1]);
        const lines = content.split("\n");
        for (let i = Math.max(0, line - 3); i < Math.min(lines.length, line + 2); i++) {
          console.log(`   ${i + 1 === line ? ">>" : "  "} ${i + 1}: ${JSON.stringify(lines[i].slice(0, 110))}`);
        }
      }
    }
  }
  console.log(`\nTotal: ${files.length} | fallan: ${bad}`);
}
main();
