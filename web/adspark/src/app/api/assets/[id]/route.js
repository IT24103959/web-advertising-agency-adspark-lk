// Proxy route for individual assets to avoid CORS issues
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const download = searchParams.get("download");

    // Get authorization header from the incoming request
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return Response.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    let backendUrl = `http://localhost:8080/api/assets/${id}`;
    if (download === "true") {
      backendUrl += "/download";
    }

    // Forward the request to the backend
    const backendResponse = await fetch(backendUrl, {
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

    // For downloads, return the blob with appropriate headers
    if (download === "true") {
      const blob = await backendResponse.blob();
      return new Response(blob, {
        headers: {
          "Content-Type":
            backendResponse.headers.get("Content-Type") ||
            "application/octet-stream",
          "Content-Disposition":
            backendResponse.headers.get("Content-Disposition") || "attachment",
        },
      });
    }

    // For regular asset info, return JSON
    const data = await backendResponse.json();
    return Response.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
