import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const comicsFilePath = path.join(process.cwd(), "src/data/comics.json");

function readComicsFile() {
  try {
    if (!fs.existsSync(comicsFilePath)) {
      return [];
    }
    const fileContent = fs.readFileSync(comicsFilePath, "utf8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading comics database file:", error);
    return [];
  }
}

function writeComicsFile(data: any) {
  try {
    fs.writeFileSync(comicsFilePath, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error writing comics database file:", error);
    return false;
  }
}

export async function GET() {
  const comics = readComicsFile();
  // Sort comics by sortOrder ascending
  comics.sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
  return NextResponse.json(comics);
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const comics = readComicsFile();

    const existingIndex = comics.findIndex((c: any) => c.id === payload.id);
    if (existingIndex > -1) {
      // Update existing comic
      comics[existingIndex] = {
        ...comics[existingIndex],
        ...payload,
      };
    } else {
      // Create new comic
      const newSortOrder = comics.length > 0 
        ? Math.max(...comics.map((c: any) => c.sortOrder || 0)) + 1 
        : 1;

      comics.push({
        ...payload,
        sortOrder: payload.sortOrder || newSortOrder,
      });
    }

    const success = writeComicsFile(comics);
    if (success) {
      return NextResponse.json(comics);
    } else {
      return NextResponse.json({ error: "Failed to write updates" }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to parse payload" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Comic ID is required" }, { status: 400 });
    }

    const comics = readComicsFile();
    const filtered = comics.filter((c: any) => c.id !== id);

    const success = writeComicsFile(filtered);
    if (success) {
      return NextResponse.json(filtered);
    } else {
      return NextResponse.json({ error: "Failed to write updates" }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
