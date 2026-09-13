const windows1252: Record<number, number> = {
  0x20ac:0x80,0x201a:0x82,0x0192:0x83,0x201e:0x84,0x2026:0x85,0x2020:0x86,0x2021:0x87,
  0x02c6:0x88,0x2030:0x89,0x0160:0x8a,0x2039:0x8b,0x0152:0x8c,0x017d:0x8e,
  0x2018:0x91,0x2019:0x92,0x201c:0x93,0x201d:0x94,0x2022:0x95,0x2013:0x96,0x2014:0x97,
  0x02dc:0x98,0x2122:0x99,0x0161:0x9a,0x203a:0x9b,0x0153:0x9c,0x017e:0x9e,0x0178:0x9f,
};
const broken=/[ØÙÛÃÂâ]/g; const persian=/[\u0600-\u06ff]/g;
export function repairMojibakeText(value:string):string{
 if(!broken.test(value)){broken.lastIndex=0;return value} broken.lastIndex=0;
 const bytes:number[]=[];for(const char of value){const code=char.codePointAt(0)!;const byte=code<=255?code:windows1252[code];if(byte===undefined)return value;bytes.push(byte)}
 const candidate=new TextDecoder().decode(new Uint8Array(bytes));
 const oldBroken=(value.match(broken)||[]).length,newBroken=(candidate.match(broken)||[]).length;
 return (candidate.match(persian)||[]).length>0&&newBroken<oldBroken?candidate:value;
}
export function repairMojibake<T>(value:T):T{
 if(typeof value==='string')return repairMojibakeText(value) as T;
 if(Array.isArray(value))return value.map(repairMojibake) as T;
 if(value&&typeof value==='object'){for(const key of Object.keys(value as object)){const record=value as Record<string,unknown>;record[key]=repairMojibake(record[key])}return value}
 return value;
}
