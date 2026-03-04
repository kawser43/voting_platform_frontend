import { headers } from 'next/headers';

export async function POST(request) {
  const headerList = await headers();
  const body = await request.json();

  const countryCode =
    headerList.get('cf-ipcountry') ||
    headerList.get('cloudfront-viewer-country') ||
    headerList.get('x-country-code') ||
    null;

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env.NEXT_PUBLIC_API
      ? process.env.NEXT_PUBLIC_API.replace(/\/api\/?$/, '')
      : '');

  if (!apiBaseUrl) {
    return new Response(
      JSON.stringify({ status: false, message: 'API base URL is not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const url = `${apiBaseUrl.replace(/\/$/, '')}/api/register`;

  const laravelRes = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'CF-IPCountry': countryCode || '',
    },
    body: JSON.stringify({
      ...body,
      country_code: countryCode || body.country_code || null,
    }),
  });

  const result = await laravelRes.json();
  return new Response(JSON.stringify(result), {
    status: laravelRes.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

