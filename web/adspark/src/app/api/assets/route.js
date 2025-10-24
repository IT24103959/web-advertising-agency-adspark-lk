// Proxy route for assets to avoid CORS issues
export async function GET(request) {
  try {
    // Get authorization header from the incoming request
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return Response.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    // Forward the request to the backend
    const backendResponse = await fetch("http://localhost:8080/api/assets", {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return Response.json(
        { error: `Backend error: ${backendResponse.status} - ${errorText}` },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return Response.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Get authorization header from the incoming request
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return Response.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    // Get the request body
    const body = await request.text();

    // Forward the request to the backend
    const backendResponse = await fetch("http://localhost:8080/api/assets", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type":
          request.headers.get("content-type") || "application/json",
      },
      body: body,
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return Response.json(
        { error: `Backend error: ${backendResponse.status} - ${errorText}` },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return Response.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
