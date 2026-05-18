import fs from "fs";
import path from "path";
import ComicsClient from "@/components/ComicsClient";

const DEFAULT_COMICS = [
  {
    id: "chapter-1",
    title: "The Awakening",
    chapter: "01",
    image: "/comics/ch-1 thumbnail.jpeg",
    year: "2026",
    genre: "Sci-Fi / Action",
    desc: "The journey begins on Floor 13. A forgotten world beneath the surface.",
  },
  {
    id: "chapter-2",
    title: "Descent",
    chapter: "02",
    image: "/comics/Ch-2 thumbnail.jpeg",
    year: "2026",
    genre: "Sci-Fi / Action",
    desc: "Deeper into the abyss. New enemies await.",
  },
];

function getServerData() {
  const settingsPath = path.join(process.cwd(), "src/data/adminSettings.json");
  const comicsPath = path.join(process.cwd(), "src/data/comics.json");

  let heroImage = "/comics/Ch-2 thumbnail.jpeg";
  let comics = DEFAULT_COMICS;

  try {
    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
      if (settings?.hero?.image) heroImage = settings.hero.image;
    }
  } catch { }

  try {
    if (fs.existsSync(comicsPath)) {
      const parsed = JSON.parse(fs.readFileSync(comicsPath, "utf8"));
      if (Array.isArray(parsed) && parsed.length > 0) comics = parsed;
    }
  } catch { }

  return { heroImage, comics };
}

export default function ComicsPage() {
  const { heroImage, comics } = getServerData();
  return <ComicsClient initialHeroImage={heroImage} initialComics={comics} />;
}

export const dynamic = "force-dynamic";
