import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const getFilePath = () => path.join(process.cwd(), "src/data/adminSettings.json");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    const filePath = getFilePath();
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Data store not found" }, { status: 404 });
    }

    const currentData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    
    const newTransmission = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      email,
      message,
      timestamp: new Date().toISOString(),
    };

    const updatedData = {
      ...currentData,
      messages: [newTransmission, ...(currentData.messages || [])],
    };

    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), "utf-8");
    return NextResponse.json({ success: true, message: "Transmission received" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to log transmission" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Transmission ID is required" }, { status: 400 });
    }

    const filePath = getFilePath();
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Data store not found" }, { status: 404 });
    }

    const currentData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const updatedMessages = (currentData.messages || []).filter((msg: any) => msg.id !== id);

    const updatedData = {
      ...currentData,
      messages: updatedMessages,
    };

    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), "utf-8");
    return NextResponse.json({ success: true, message: "Transmission deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete transmission" }, { status: 500 });
  }
}
