import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary server-side
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    
    if (files.length === 0) {
      return NextResponse.json({ error: "No files found" }, { status: 400 });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ error: "Cloudinary credentials missing on server." }, { status: 500 });
    }

    const paths: string[] = [];

    for (const file of files) {
      // 1. Read file as array buffer and convert to base64
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileBase64 = `data:${file.type};base64,${buffer.toString("base64")}`;

      // 2. Upload directly to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
        folder: "sarvanash_comics",
        resource_type: "auto",
      });

      // 3. Collect secure Cloudinary URL
      paths.push(uploadResponse.secure_url);
    }

    return NextResponse.json({ paths });
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json({ error: error.message || "File upload to Cloudinary failed." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
