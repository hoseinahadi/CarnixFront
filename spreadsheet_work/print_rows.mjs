import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load("C:/Users/hosein/Downloads/CARNIX_UI_AUDIT.xlsx"));
for (const s of wb.worksheets.items) {
  if (s.name === "خلاصه" || s.name === "راهنمای استفاده") continue;
  const rows=s.getUsedRange(true).values;
  console.log(`### ${s.name}`);
  for (let i=1;i<rows.length;i++) console.log(`${i+1}\t${rows[i].map(v=>v??"").join("\t")}`);
}
