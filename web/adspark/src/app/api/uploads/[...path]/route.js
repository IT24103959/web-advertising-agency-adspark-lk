// Proxy route for serving asset files from local filesystem
import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { path: pathSegments } = params;

    console.log("Requested path segments:", pathSegments);
    console.log("Current working directory:", process.cwd());

    // Build the file path - the uploads directory is in the adspark project
    // Current path: web/adspark/src/app/api/uploads/[...path]/route.js
    // Target path: adspark/uploads/
    const uploadsDir = path.join(
      process.cwd(),
      "..",
      "..",
      "..",
      "adspark",
      "uploads"
    );
    const filePath = path.join(uploadsDir, ...pathSegments);

    console.log("Uploads directory:", uploadsDir);
    console.log("Full file path:", filePath);

    // Security check - ensure the requested path is within the uploads directory
    const resolvedPath = path.resolve(filePath);
    const resolvedUploadsDir = path.resolve(uploadsDir);

    console.log("Resolved file path:", resolvedPath);
    console.log("Resolved uploads dir:", resolvedUploadsDir);

    if (!resolvedPath.startsWith(resolvedUploadsDir)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if file exists and read it
    try {
      console.log("Attempting to read file:", resolvedPath);

      // First check if file exists
      await fs.access(resolvedPath);
      console.log("File exists, reading...");

      const fileBuffer = await fs.readFile(resolvedPath);
      console.log("File read successfully, size:", fileBuffer.length);

      // Determine content type based on file extension
      const ext = path.extname(resolvedPath).toLowerCase();
      const contentTypeMap = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".svg": "image/svg+xml",
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".pdf": "application/pdf",
      };

      const contentType = contentTypeMap[ext] || "application/octet-stream";

      return new Response(fileBuffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000",
          "Content-Length": fileBuffer.length.toString(),
        },
      });
    } catch (fileError) {
      console.error("File access error:", fileError);
      if (fileError.code === "ENOENT") {
        return NextResponse.json(
          {
            error: "File not found",
            requestedPath: resolvedPath,
            uploadsDir: resolvedUploadsDir,
          },
          { status: 404 }
        );
      }
      throw fileError;
    }
  } catch (error) {
    console.error("File proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
