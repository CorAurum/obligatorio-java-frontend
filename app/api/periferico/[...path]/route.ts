import { NextRequest, NextResponse } from 'next/server';

const PERIFERICO_BASE_URL = process.env.NEXT_PUBLIC_API_PERIFERICO || 'http://localhost:8081/api';
const DEFAULT_CLINIC_DOMAIN = 'santamaria';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return proxyRequest(request, resolvedParams.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return proxyRequest(request, resolvedParams.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return proxyRequest(request, resolvedParams.path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return proxyRequest(request, resolvedParams.path, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return proxyRequest(request, resolvedParams.path, 'PATCH');
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    // Construct the target URL
    const path = pathSegments.join('/');
    const targetUrl = `${PERIFERICO_BASE_URL}/${path}`;

    // Get query parameters from the original request
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const fullUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;

    // Get clinic domain from query parameter or use default
    const clinicDomain = searchParams.get('clinicDomain') || DEFAULT_CLINIC_DOMAIN;

    // Prepare headers for the backend request
    // Note: We use X-Forwarded-Host as Host header cannot be set in fetch()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Forwarded-Host': clinicDomain, // Backend will need to read this
    };

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers,
    };

    // If there's a body (POST, PUT, PATCH), include it
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        const body = await request.text();
        if (body) {
          requestOptions.body = body;
        }
      } catch (error) {
        console.error('Error reading request body:', error);
      }
    }

    // Make the request to the peripheral backend
    console.log(`🔄 Proxying ${method} request to: ${fullUrl} with Host: ${clinicDomain}`);
    const response = await fetch(fullUrl, requestOptions);

    // Get response body
    const responseBody = await response.text();

    // Return the response with the same status code
    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Error en el proxy al backend periférico', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
