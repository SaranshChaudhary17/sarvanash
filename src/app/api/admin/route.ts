import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const getFilePath = () => path.join(process.cwd(), "src/data/adminSettings.json");

export async function GET() {
  try {
    const filePath = getFilePath();
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Data store not found" }, { status: 404 });
    }
    const fileData = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(fileData);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const filePath = getFilePath();
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Data store not found" }, { status: 404 });
    }

    const currentData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    
    const updatedData = {
      ...currentData,
      hero: body.hero || currentData.hero,
      trending: body.trending || currentData.trending,
      about: body.about || currentData.about,
    };

    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), "utf-8");
    return NextResponse.json(updatedData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save settings" }, { status: 500 });
  }
}
