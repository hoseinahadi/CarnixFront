import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "C:/Users/hosein/Downloads/CARNIX_UI_AUDIT.xlsx";
const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);
const summary = await workbook.inspect({
  kind: "workbook,sheet,table",
  maxChars: 12000,
  tableMaxRows: 20,
  tableMaxCols: 20,
  tableMaxCellChars: 200,
});
console.log(summary.ndjson);
const sheets = workbook.worksheets.items;
const raw = {};
for (const sheet of sheets) {
  const used = sheet.getUsedRange(true);
  console.log(`SHEET=${sheet.name} USED=${used?.address ?? "none"}`);
  if (used) {
    raw[sheet.name] = used.values;
    const region = await workbook.inspect({
      kind: "region",
      sheetId: sheet.name,
      range: used.address,
      maxChars: 20000,
    });
    console.log(region.ndjson);
  }
}
await fs.writeFile("audit_values.json", JSON.stringify(raw, null, 2), "utf8");
for (const sheet of sheets) {
  const preview = await workbook.render({ sheetName: sheet.name, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(`preview-${sheet.name}.png`, new Uint8Array(await preview.arrayBuffer()));
}
