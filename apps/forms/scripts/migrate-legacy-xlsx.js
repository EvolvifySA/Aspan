import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { pool } from "../server/db.js";
import { readLegacyWorkbook } from "../server/legacy/importer.js";
import { applyLegacyImport, rollbackLegacyImport } from "../server/legacy/persistence.js";

function parseArguments(argv) {
  const args = { mode: "dry-run", file: null, rollbackBatch: null };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--apply") args.mode = "apply";
    else if (value === "--dry-run") args.mode = "dry-run";
    else if (value === "--file") args.file = argv[++index];
    else if (value === "--rollback") {
      args.mode = "rollback";
      args.rollbackBatch = argv[++index];
    } else if (!value.startsWith("--") && !args.file) args.file = value;
    else throw new Error(`Argumento desconhecido: ${value}`);
  }
  return args;
}

async function sha256(filePath) {
  const file = await fs.readFile(filePath);
  return createHash("sha256").update(file).digest("hex");
}

function printResult(result) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

async function main() {
  const args = parseArguments(process.argv.slice(2));
  if (args.mode === "rollback") {
    if (!args.rollbackBatch) throw new Error("Informe o ID do lote para rollback.");
    printResult(await rollbackLegacyImport(args.rollbackBatch));
    return;
  }

  if (!args.file) throw new Error("Informe o XLSX com --file <caminho>.");
  const filePath = path.resolve(args.file);
  await fs.access(filePath);
  const fileSha256 = await sha256(filePath);
  const { records, summary } = await readLegacyWorkbook(filePath);
  if (summary.totalRows !== 968) {
    throw new Error(`Dry-run encontrou ${summary.totalRows} registros; esperado: 968.`);
  }

  if (args.mode === "dry-run") {
    printResult({ mode: "dry-run", sourceFile: path.basename(filePath), fileSha256, ...summary });
    return;
  }

  const result = await applyLegacyImport({
    fileName: path.basename(filePath), fileSha256, records, summary,
  });
  printResult({ mode: "apply", ...result });
}

main()
  .catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());

