import { readDocx } from "./docx/read-docx";
const nodes = readDocx(process.argv[2]);
console.log("nodes:", nodes.length);
const styles = new Map<string, number>();
for (const n of nodes) {
  if (n.type === "para") styles.set(n.style, (styles.get(n.style) ?? 0) + 1);
  else styles.set("TABLE", (styles.get("TABLE") ?? 0) + 1);
}
console.log([...styles].sort((a, b) => b[1] - a[1]));
// the Part 1 opener and the question-number run signal
for (const n of nodes) {
  if (n.type === "para" && n.text.startsWith("22.")) {
    console.log("Q22 runs:", JSON.stringify(n.runs));
    break;
  }
}
const h1 = nodes.filter((n) => n.type === "para" && n.style === "Heading1");
console.log("Heading1:", h1.map((n) => (n as { text: string }).text));
