import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';
const path='D:/Project/Front/Next/New folder/outputs/full-project-audit/CARNIX_PROJECT_FULL_AUDIT.xlsx';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(path));
const sheets=await wb.inspect({kind:'sheet',include:'id,name'}); console.log(sheets.ndjson);
const summary=await wb.inspect({kind:'table',range:'خلاصه!A1:H16',include:'values,formulas',tableMaxRows:20,tableMaxCols:10,maxChars:8000}); console.log(summary.ndjson);
const issues=await wb.inspect({kind:'table',range:'ایرادات فنی و ظاهری!A1:M49',include:'values,formulas',tableMaxRows:55,tableMaxCols:14,maxChars:4000}); console.log(issues.ndjson);
const errs=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:300},summary:'saved workbook formula error scan'}); console.log(errs.ndjson);
for(const [name,range] of [['خلاصه','A1:H16'],['ایرادات فنی و ظاهری','A1:M12'],['پوشش مسیرها','A1:D11']]){const p=await wb.render({sheetName:name,range,scale:1,format:'png'}); await fs.writeFile(`D:/Project/Front/Next/New folder/outputs/full-project-audit/final-${name}.png`,new Uint8Array(await p.arrayBuffer()));}
console.log('SAVED_VERIFY=OK');
