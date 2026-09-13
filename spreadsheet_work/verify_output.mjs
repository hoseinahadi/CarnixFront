import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
const path="D:/Project/Front/Next/New folder/outputs/audit-progress/CARNIX_UI_AUDIT_PROGRESS.xlsx";
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(path));
const summary=wb.worksheets.getItem("خلاصه");
console.log(JSON.stringify({overall:summary.getRange("E37").values[0][0], summaryRows:summary.getRange("D31:F35").values, tech:wb.worksheets.getItem("ایرادات فنی و منطقی").getRange("J1:L5").values},null,2));
const errors=await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!",options:{useRegex:true,maxResults:300},summary:"exported workbook formula scan"});
console.log(errors.ndjson);
for(const name of ["خلاصه","ایرادات فنی و منطقی","قابلیت‌های لازم"]){const p=await wb.render({sheetName:name,autoCrop:"all",scale:1,format:"png"});await fs.writeFile(`verify-${name}.png`,new Uint8Array(await p.arrayBuffer()));}
