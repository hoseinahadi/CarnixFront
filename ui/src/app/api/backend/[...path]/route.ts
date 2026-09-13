import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { apiTimeoutMs, backendApiUrl } from '@/config/runtime';
import { repairMojibake } from '@/utils/text/repairMojibake';
import axios from 'axios';
import { localHttpsAgent } from '@/services/api/common/localHttpsAgent';

type Context = { params: Promise<{ path: string[] }> };
const forward = async (request: NextRequest, context: Context) => {
  const { path } = await context.params;
  const target = new URL(`${backendApiUrl}/${path.map(encodeURIComponent).join('/')}`);
  request.nextUrl.searchParams.forEach((value, key) => target.searchParams.append(key, value));
  const cookieStore = await cookies();
  const traceId = request.headers.get('x-trace-id') ?? crypto.randomUUID();
  const headers = new Headers();
  for (const name of ['accept', 'content-type', 'x-session-id']) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set('x-trace-id', traceId);
  const token = cookieStore.get('token')?.value;
  const incomingAuthorization = request.headers.get('authorization');
  if (token) headers.set('authorization', `ApiToken ${token}`);
  else if (incomingAuthorization && !incomingAuthorization.includes('__http_only_session__')) {
    headers.set('authorization', incomingAuthorization);
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), apiTimeoutMs);
  try {
    const response = await axios.request<ArrayBuffer>({
      adapter: 'http',
      url: target.toString(),
      method: request.method,
    headers: Object.fromEntries(headers.entries()),
      data: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer(),
      signal: controller.signal,
      timeout: apiTimeoutMs,
      httpsAgent: localHttpsAgent,
      responseType: 'arraybuffer',
      validateStatus: () => true,
    });
    const contentType = String(response.headers['content-type'] ?? 'application/json');
    if (contentType.includes('application/json')) {
      const bytes = new Uint8Array(response.data);
      const payload = repairMojibake(JSON.parse(new TextDecoder().decode(bytes)));
      const backendTraceId = response.headers['x-trace-id'] ?? traceId;
      return NextResponse.json(payload, {
        status: response.status,
        headers: { 'X-Trace-Id': String(backendTraceId) },
      });
    }
    const backendTraceId = response.headers['x-trace-id'] ?? traceId;
    return new NextResponse(new Blob([new Uint8Array(response.data)]), { status: response.status, headers: { 'content-type': contentType, 'X-Trace-Id': String(backendTraceId) } });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === 'AbortError';
    return NextResponse.json({ message: timedOut ? 'Backend request timed out.' : 'Backend is unavailable.' }, { status: timedOut ? 504 : 502, headers: { 'X-Trace-Id': traceId } });
  } finally {
    clearTimeout(timeout);
  }
};
export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
