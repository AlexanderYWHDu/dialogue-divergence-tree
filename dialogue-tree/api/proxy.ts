export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const provider = process.env.LLM_PROVIDER || 'anthropic';
  const apiKey = process.env.LLM_API_KEY || '';
  const baseUrl = (process.env.LLM_BASE_URL || 'https://api.anthropic.com').replace(/\/$/, '');

  const url = new URL(req.url);
  const subpath = url.pathname.replace(/^\/api\/llm/, '');
  const targetUrl = baseUrl + subpath;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (provider === 'anthropic') {
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
  } else {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
    // @ts-ignore
    duplex: 'half',
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
      'Cache-Control': 'no-cache',
    },
  });
}
