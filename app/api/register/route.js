import { headers } from 'next/headers';

export async function POST(request) {
  const headerList = await headers();
  const body = await request.json();

  // 1. Get real data from Cloudflare headers
  // 'cf-connecting-ip' is the gold standard when using Cloudflare
  const ip =
    headerList.get('cf-connecting-ip') ||
    headerList.get('x-forwarded-for') ||
    headerList.get('x-real-ip') ||
    request.ip ||
    '127.0.0.1';

  const country =
    headerList.get('cf-ipcountry') ||
    headerList.get('cloudfront-viewer-country') ||
    headerList.get('x-country-code') ||
    'XX';

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env.NEXT_PUBLIC_API
      ? process.env.NEXT_PUBLIC_API.replace(/\/api\/?$/, '')
      : '');
  
  const internalSecret = process.env.INTERNAL_API_SECRET; // Set this in .env

  if (!apiBaseUrl) {
    return new Response(
      JSON.stringify({ status: false, message: 'API base URL is not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const url = `${apiBaseUrl.replace(/\/$/, '')}/api/register`;

  try {
    const laravelRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Internal-Secret': internalSecret || '', // Secret handshake
        'X-Forwarded-For': ip,                // Forwarding for Laravel's TrustProxies
        'CF-Connecting-IP': ip,               // Direct IP header
        'CF-IPCountry': country,
      },
      body: JSON.stringify({
        ...body,
        country_code: country, // Pass country directly into the payload
      }),
    });

    const result = await laravelRes.json();
    return new Response(JSON.stringify(result), {
      status: laravelRes.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'API Connection Error' }), { status: 500 });
  }
}

