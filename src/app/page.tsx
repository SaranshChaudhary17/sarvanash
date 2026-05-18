import fs from "fs";
import path from "path";
import HomeClient from "@/components/HomeClient";

function getAdminSettings() {
  const filePath = path.join(process.cwd(), "src/data/adminSettings.json");
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

const DEFAULT_SETTINGS = {
  hero: {
    image: "/comics/Ch-2 thumbnail.jpeg",
    subHeader: "A Sarvanash Original Stories",
    header: "WELCOME SARVANASHI",
    paragraphs: [
      "Welcome to a universe where every frame tells a story.",
      "Dive into a premium digital comic experience filled with cinematic worlds, unforgettable characters, and visually immersive storytelling.",
      "Explore new chapters, discover original heroes, and experience stories beyond reality."
    ]
  },
  trending: [
    { comicId: "chapter-1", title: "The Awakening", chapter: "01", image: "/comics/ch-1 thumbnail.jpeg" },
    { comicId: "chapter-2", title: "Descent", chapter: "02", image: "/comics/Ch-2 thumbnail.jpeg" },
  ]
};

export default function Home() {
  const settings = getAdminSettings() || DEFAULT_SETTINGS;
  return <HomeClient initialData={settings} />;
}

export const dynamic = "force-dynamic";
