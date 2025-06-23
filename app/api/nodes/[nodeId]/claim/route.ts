import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint for claiming a node
 * 
 * This endpoint implements the claimMyNode operation from the OpenAPI specification.
 * It allows a publisher to claim an unclaimed node that they own the repo for.
 */
export const POST = async (
  request: NextRequest,
  { params }: { params: { nodeId: string } }
) => {
  try {
    const nodeId = params.nodeId;
    const data = await request.json();
    const { publisherId, GH_TOKEN } = data;
    
    if (!nodeId || !publisherId || !GH_TOKEN) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get the authorization token from the request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing or invalid authentication token' },
        { status: 401 }
      );
    }
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Call the backend API to claim the node
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await fetch(
      `${apiBaseUrl}/publishers/${publisherId}/nodes/${nodeId}/claim-my-node`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ GH_TOKEN }),
      }
    );

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    // Handle error responses
    const errorData = await response.json();
    return NextResponse.json(
      errorData,
      { status: response.status }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
