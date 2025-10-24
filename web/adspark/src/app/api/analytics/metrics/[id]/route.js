// Proxy route for advertisement metrics to avoid CORS issues
export async function GET(request, { params }) {
  try {
    // Get the advertisement ID from the URL parameters
    const { id } = params;

    // Get authorization header from the incoming request
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return Response.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    if (!id) {
      return Response.json(
        { error: "Advertisement ID is required" },
        { status: 400 }
      );
    }

    // Forward the request to the backend
    const backendResponse = await fetch(
      `http://localhost:8080/api/analytics/metrics/${id}`,
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
