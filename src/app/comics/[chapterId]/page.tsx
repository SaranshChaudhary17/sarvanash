import fs from "fs";
import path from "path";
import ClientComicReader from "./ClientComicReader";
import type { Metadata } from "next";

// Read comics database on the server
function getComicData(chapterId: string) {
  const comicsFilePath = path.join(process.cwd(), "src/data/comics.json");
  try {
    if (!fs.existsSync(comicsFilePath)) return null;
    const fileContent = fs.readFileSync(comicsFilePath, "utf8");
    const comics = JSON.parse(fileContent);
    const comic = comics.find((c: any) => c.id === chapterId);
    
    // Find next chapter id
    const currentIdx = comics.findIndex((c: any) => c.id === chapterId);
    let nextChapterId: string | null = null;
    if (currentIdx > -1 && currentIdx < comics.length - 1) {
      nextChapterId = comics[currentIdx + 1].id;
    }
    
    return { comic, nextChapterId };
  } catch (error) {
    console.error("Error reading comics on server:", error);
    return null;
  }
}

// Generate dynamic OpenGraph SEO Metadata
export async function generateMetadata({ params }: { params: { chapterId: string } }): Promise<Metadata> {
  const data = getComicData(params.chapterId);
  const comic = data?.comic;
  
  const title = comic 
    ? `${comic.title} (Chapter ${comic.chapter}) | Sarvanash Cinematic Comics` 
    : "Cinematic Digital Comics | Sarvanash";
  
  const description = comic?.desc || "Enter an immersive digital comic reader with breathtaking cinematic visuals and deep sci-fi stories.";
  
  // Base site URL for Absolute OpenGraph Images
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sarvanash.com";
  const imageUrl = comic?.image ? `${siteUrl}${comic.image}` : `${siteUrl}/hero-backdrop.jpg`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/comics/${params.chapterId}`,
      siteName: "Sarvanash",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: comic ? `${comic.title} Chapter Cover` : "Sarvanash Cinematic Comic",
        }
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    }
  };
}

export default function ComicReaderPage({ params }: { params: { chapterId: string } }) {
  const data = getComicData(params.chapterId);
  
  // Fallbacks for Chapter 1 and Chapter 2 if JSON database doesn't have custom ones
  let fallbackPages: string[] = [];
  if (params.chapterId === "chapter-1") {
    for (let i = 1; i <= 25; i++) {
      fallbackPages.push(`/comics/Chapter-1/${i}.jpeg`);
    }
    fallbackPages.push(`/comics/Chapter-1/EOC1.jpeg`);
  } else if (params.chapterId === "chapter-2") {
    for (let i = 26; i <= 50; i++) {
      fallbackPages.push(`/comics/Chapter-2/${i}.jpeg`);
    }
    fallbackPages.push(`/comics/Chapter-2/the end.jpeg`);
  }

  return (
    <ClientComicReader
      initialComic={data?.comic || null}
      fallbackPages={fallbackPages}
      nextChapterId={data?.nextChapterId || null}
    />
  );
}

export const dynamic = "force-dynamic";
