export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7191').replace(/\/$/, '');
const TOKEN_KEY = 'carnix_admin_api_token';
export const tokenStore = {
  get: () => typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY),
  set: (value:string) => { if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, value); },
  clear: () => { if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY); },
};
export type ApiOptions = { method?:string; body?:unknown; query?:Record<string, unknown>; formData?:FormData; signal?:AbortSignal };
function queryString(query?:Record<string,unknown>) {
  if (!query) return '';
  const p = new URLSearchParams();
  Object.entries(query).forEach(([k,v]) => { if (v !== undefined && v !== null && v !== '') p.set(k,String(v)); });
  const q=p.toString(); return q ? `?${q}` : '';
}
export function fillPath(path:string, params:Record<string,string|number>) {
  return path.replace(/\{([^}:]+)(?::[^}]+)?\}/g, (_,k) => encodeURIComponent(String(params[k] ?? `{${k}}`)));
}
export async function api<T=any>(path:string, options:ApiOptions = {}):Promise<T> {
  const headers:Record<string,string> = { Accept:'application/json' };
  const token=tokenStore.get(); if (token) headers.Authorization=`ApiToken ${token}`;
  let body:BodyInit|undefined;
  if (options.formData) body=options.formData;
  else if (options.body !== undefined) { headers['Content-Type']='application/json'; body=JSON.stringify(options.body); }
  const url = `${API_BASE}/${path.replace(/^\//,'')}${queryString(options.query)}`;
  let res:Response;
  try { res=await fetch(url,{method:options.method||'GET',headers,body,credentials:'include',cache:'no-store',signal:options.signal}); }
  catch(e:any){ throw new Error(e?.message || 'ارتباط با سرور برقرار نشد.'); }
  const text=await res.text(); let data:any=null;
  if(text){ try{data=JSON.parse(text)}catch{data=text} }
  if(!res.ok){
    const msg=data?.message || data?.Message || data?.title || (typeof data==='string'?data:null) || `خطای HTTP ${res.status}`;
    const err:any=new Error(msg); err.status=res.status; err.data=data;
    if(res.status===401 && typeof window!=='undefined'){ tokenStore.clear(); if(!location.pathname.startsWith('/login')) location.href='/login'; }
    throw err;
  }
  return data as T;
}
export function unwrapList(input:any):any[]{
  if(Array.isArray(input)) return input;
  const paths=[input?.data,input?.items,input?.records,input?.result,input?.data?.items,input?.data?.records,input?.data?.data,input?.value,input?.data?.value];
  for(const p of paths) if(Array.isArray(p)) return p;
  if(input && typeof input==='object'){
    const arr=Object.values(input).find(Array.isArray); if(Array.isArray(arr)) return arr;
  }
  return [];
}
export function unwrapData(input:any){ return input?.data ?? input?.result ?? input; }
