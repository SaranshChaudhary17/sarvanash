import fs from "fs";
import path from "path";
import AboutClient from "../../components/AboutClient";

function getAboutSettings() {
  const filePath = path.join(process.cwd(), "src/data/adminSettings.json");
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return parsed.about;
  } catch (error) {
    console.error("Server-side read error for about settings:", error);
    return null;
  }
}

export default function AboutPage() {
  const initialAboutData = getAboutSettings();

  return <AboutClient initialAboutData={initialAboutData} />;
}
