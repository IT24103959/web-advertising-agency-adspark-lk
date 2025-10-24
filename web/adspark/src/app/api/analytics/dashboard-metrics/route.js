// Proxy route to avoid CORS issues during development
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
    const backendResponse = await fetch(
      "http://localhost:8080/api/analytics/dashboard-metrics",
      {
        method: "GET",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      }
    );

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
