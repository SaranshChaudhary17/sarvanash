"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Trash2, Mail, Layout, TrendingUp, Info, ShieldAlert, CheckCircle, BookOpen, Upload, Plus, X, ArrowUp, ArrowDown, ChevronDown, Check, LogOut } from "lucide-react";
import Image from "next/image";

type HeroSettings = {
  image: string;
  subHeader: string;
  header: string;
  paragraphs: string[];
};

type TrendingStory = {
  comicId?: string;
  title: string;
  chapter: string;
  image: string;
  genre?: string;
  pagesCount?: number;
};

type AboutSettings = {
  title: string;
  subtitle: string;
  image: string;
  philosophyHeader: string;
  philosophyDesc: string;
  statReaders: string;
  statStories: string;
};

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
};

type AdminData = {
  hero: HeroSettings;
  trending: TrendingStory[];
  about: AboutSettings;
  messages: ContactMessage[];
};

const AVAILABLE_GENRES = [
  "Sci-Fi", "Action", "Fantasy", "Adventure", "Mystery", 
  "Thriller", "Horror", "Supernatural", "Romance", "Drama",
  "Comedy", "Slice of Life", "Superhero", "Historical", "Epic", "Cyberpunk", "Mecha", "Isekai"
];

function AdminContent() {
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") as "hero" | "trending" | "about" | "messages" | "manage" | "upload") || "hero";

  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Comics Management States
  const [comicsList, setComicsList] = useState<any[]>([]);
  const [editingComic, setEditingComic] = useState<any | null>(null);
  const [comicToDelete, setComicToDelete] = useState<string | null>(null);

  // Upload Comic Form States
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadId, setUploadId] = useState("");
  const [uploadChapter, setUploadChapter] = useState("");
  const [uploadGenre, setUploadGenre] = useState("");
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
  const [editGenreDropdownOpen, setEditGenreDropdownOpen] = useState(false);
  const [uploadYear, setUploadYear] = useState("2026");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadCover, setUploadCover] = useState("");
  const [uploadPages, setUploadPages] = useState<string[]>([]);
  
  // File uploading states
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedPageFiles, setSelectedPageFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }

      const comicsRes = await fetch("/api/comics");
      if (comicsRes.ok) {
        const comicsJson = await comicsRes.json();
        setComicsList(comicsJson);
      }
    } catch (err) {
      showNotification("error", "Failed to retrieve configuration from database.");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setData(updated);
        showNotification("success", "Web platform configuration saved successfully.");
      } else {
        showNotification("error", "Failed to write updates to data store.");
      }
    } catch (err) {
      showNotification("error", "Network error. Failed to execute transmission.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      const res = await fetch(`/api/contact?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            messages: prev.messages.filter((m) => m.id !== id),
          };
        });
        showNotification("success", "Transmission resolved and deleted successfully.");
      } else {
        showNotification("error", "Failed to resolve message from database.");
      }
    } catch (err) {
      showNotification("error", "Network error. Failed to delete message.");
    }
  };

  // Generate safe Slug/ID automatically
  const handleTitleChange = (val: string) => {
    setUploadTitle(val);
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setUploadId(slug);
  };

  // Cover image local multipart uploader
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingFiles(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      const res = await fetch("/api/comics/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const json = await res.json();
        if (json.paths && json.paths.length > 0) {
          setUploadCover(json.paths[0]);
          showNotification("success", "Cover thumbnail uploaded successfully.");
        }
      } else {
        showNotification("error", "Failed to upload cover file.");
      }
    } catch (err) {
      showNotification("error", "Network error uploading cover.");
    } finally {
      setUploadingFiles(false);
    }
  };

  // Hero Image local multipart uploader
  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingFiles(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      const res = await fetch("/api/comics/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const json = await res.json();
        if (json.paths && json.paths.length > 0) {
          if (data) {
            setData({ ...data, hero: { ...data.hero, image: json.paths[0] } });
          }
          showNotification("success", "Hero backdrop image uploaded successfully.");
        }
      } else {
        showNotification("error", "Failed to upload hero image.");
      }
    } catch (err) {
      showNotification("error", "Network error uploading hero image.");
    } finally {
      setUploadingFiles(false);
    }
  };

  // About Image local multipart uploader
  const handleAboutImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingFiles(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      const res = await fetch("/api/comics/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const json = await res.json();
        if (json.paths && json.paths.length > 0) {
          if (data) {
            setData({ ...data, about: { ...data.about, image: json.paths[0] } });
          }
          showNotification("success", "About showcase image uploaded successfully.");
        }
      } else {
        showNotification("error", "Failed to upload about image.");
      }
    } catch (err) {
      showNotification("error", "Network error uploading about image.");
    } finally {
      setUploadingFiles(false);
    }
  };

  // Edit Cover Image local multipart uploader
  const handleEditCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingFiles(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      const res = await fetch("/api/comics/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const json = await res.json();
        if (json.paths && json.paths.length > 0 && editingComic) {
          setEditingComic({ ...editingComic, image: json.paths[0] });
          showNotification("success", "Cover thumbnail updated successfully.");
        }
      } else {
        showNotification("error", "Failed to upload cover thumbnail.");
      }
    } catch (err) {
      showNotification("error", "Network error uploading cover.");
    } finally {
      setUploadingFiles(false);
    }
  };

  // Multi-page local multipart uploader
  const handlePagesUpload = async () => {
    if (selectedPageFiles.length === 0) return;
    setUploadingFiles(true);
    setUploadProgress(10);
    try {
      const formData = new FormData();
      for (const file of selectedPageFiles) {
        formData.append("files", file);
      }

      const interval = setInterval(() => {
        setUploadProgress((prev) => (prev < 80 ? prev + 15 : prev));
      }, 200);

      const res = await fetch("/api/comics/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);
      setUploadProgress(100);

      if (res.ok) {
        const json = await res.json();
        if (json.paths) {
          setUploadPages(json.paths);
          showNotification("success", `Successfully uploaded ${json.paths.length} comic pages!`);
        }
      } else {
        showNotification("error", "Failed to upload comic pages.");
      }
    } catch (err) {
      showNotification("error", "Network error uploading pages.");
    } finally {
      setTimeout(() => {
        setUploadingFiles(false);
        setUploadProgress(0);
      }, 800);
    }
  };

  // Publish comic story
  const handlePublishComic = async () => {
    if (!uploadTitle || !uploadId || !uploadChapter || !uploadCover || uploadPages.length === 0) {
      showNotification("error", "Please fill in all fields, select a cover thumbnail, and upload pages.");
      return;
    }

    const payload = {
      id: uploadId,
      title: uploadTitle,
      chapter: uploadChapter,
      image: uploadCover,
      year: uploadYear,
      genre: uploadGenre,
      desc: uploadDesc,
      pages: uploadPages,
    };

    try {
      const res = await fetch("/api/comics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updatedList = await res.json();
        setComicsList(updatedList);

        // Reset
        setUploadTitle("");
        setUploadId("");
        setUploadChapter("");
        setUploadDesc("");
        setUploadCover("");
        setUploadPages([]);
        setSelectedPageFiles([]);
        showNotification("success", "Cinematic Comic Story published successfully!");
      } else {
        showNotification("error", "Failed to publish comic story.");
      }
    } catch (err) {
      showNotification("error", "Network error publishing comic.");
    }
  };

  // Edit comic save
  const handleEditComicSave = async () => {
    if (!editingComic) return;
    try {
      const res = await fetch("/api/comics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingComic),
      });
      if (res.ok) {
        const updatedList = await res.json();
        setComicsList(updatedList);
        setEditingComic(null);
        showNotification("success", "Comic story modifications saved successfully.");
      } else {
        showNotification("error", "Failed to update comic story.");
      }
    } catch (err) {
      showNotification("error", "Network error saving edits.");
    }
  };

  // Delete comic
  const confirmDeletion = async (id: string) => {
    try {
      const res = await fetch(`/api/comics?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        const updatedList = await res.json();
        setComicsList(updatedList);
        setComicToDelete(null);
        showNotification("success", "Comic story deleted successfully.");
      } else {
        showNotification("error", "Failed to delete comic story.");
        setComicToDelete(null);
      }
    } catch (err) {
      showNotification("error", "Network error executing deletion.");
      setComicToDelete(null);
    }
  };

  // Change sorting weight
  const handleSortComic = async (index: number, direction: "up" | "down") => {
    const list = [...comicsList];
    if (direction === "up" && index > 0) {
      const temp = list[index].sortOrder;
      list[index].sortOrder = list[index - 1].sortOrder;
      list[index - 1].sortOrder = temp;
    } else if (direction === "down" && index < list.length - 1) {
      const temp = list[index].sortOrder;
      list[index].sortOrder = list[index + 1].sortOrder;
      list[index + 1].sortOrder = temp;
    } else {
      return;
    }

    try {
      await fetch("/api/comics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(list[index]),
      });
      const partnerIndex = direction === "up" ? index - 1 : index + 1;
      const res = await fetch("/api/comics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(list[partnerIndex]),
      });
      if (res.ok) {
        const updatedList = await res.json();
        setComicsList(updatedList);
        showNotification("success", "Stories sorting weight updated.");
      }
    } catch (err) {
      showNotification("error", "Failed to sync sorted order.");
    }
  };

  // Secure Sign-Out Handler
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth", { method: "DELETE" });
      if (res.ok) {
        window.location.href = "/login";
      } else {
        showNotification("error", "Logout request failed.");
      }
    } catch {
      showNotification("error", "Connection error during logout.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#ff3300] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 font-semibold tracking-widest uppercase text-xs">Securing Admin Transmission Channel...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="glass-panel p-8 rounded-xl max-w-md text-center flex flex-col items-center gap-6 border-white/5">
          <ShieldAlert className="w-16 h-16 text-[#ff3300]" />
          <h2 className="text-2xl font-bold uppercase tracking-wider">Access Denied</h2>
          <p className="text-white/50 text-sm">Failed to connect to the configuration data store. Verify the JSON database exists in your environment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-24 relative select-none">
      {/* Background orange nebula blurs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#ff3300]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#ff3300]/3 blur-[120px] rounded-full pointer-events-none" />

      {/* Floating Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className={`fixed top-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-semibold border backdrop-blur-md ${
              notification.type === "success"
                ? "bg-green-950/80 border-green-500/30 text-green-400"
                : "bg-red-950/80 border-red-500/30 text-red-400"
            }`}
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            {notification.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {comicToDelete && (
          <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-panel max-w-sm w-full p-6 rounded-2xl border border-red-500/20 shadow-[0_0_40px_rgba(255,0,0,0.15)] flex flex-col items-center text-center gap-4 bg-[#050505]"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-black uppercase text-white tracking-wider">Confirm Erase</h3>
              <p className="text-white/50 text-sm font-semibold mb-2 leading-relaxed">
                This action is permanent. Are you sure you want to completely erase this comic story from the database?
              </p>
              <div className="flex w-full gap-4 mt-2">
                <button
                  onClick={() => setComicToDelete(null)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-xs border border-white/10 hover:bg-white/5 text-white/70 transition-colors pointer-events-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDeletion(comicToDelete)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-xs bg-[#ff3300] hover:bg-red-600 text-white shadow-[0_0_20px_rgba(255,51,0,0.4)] transition-colors pointer-events-auto"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-2">Admin Terminal</h1>
            <p className="text-white/40 text-sm font-semibold tracking-wider uppercase">Direct secure portal to manage Sarvanash web parameters</p>
          </div>
          <div className="flex items-center gap-4">
            {activeTab !== "manage" && activeTab !== "upload" && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-[#ff3300] text-white hover:bg-red-600 transition-colors rounded-lg flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(255,51,0,0.3)] disabled:opacity-50 pointer-events-auto"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Writing Parameters..." : "Save Configuration"}
              </button>
            )}
            
            <button
              onClick={handleLogout}
              className="px-5 py-3 border border-white/10 hover:bg-white/5 text-white/70 hover:text-white rounded-lg flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors pointer-events-auto shadow-sm"
              title="Secure System Exit"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit System</span>
            </button>
          </div>
        </div>

        {/* Tab panels workspace */}
        <div className="glass-panel p-6 md:p-10 rounded-2xl border-white/5 bg-[#0a0a0a]/40 backdrop-blur-[24px]">
          
          {/* Hero configuration */}
          {activeTab === "hero" && (
            <div className="space-y-8">
              <h2 className="text-xl font-bold uppercase tracking-wider text-white border-b border-white/5 pb-4 flex items-center gap-2">
                <Layout className="w-5 h-5 text-[#ff3300]" /> Hero Section Configuration
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Inputs */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-widest uppercase text-white/40">Hero Sub-Header Text</label>
                    <input
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff3300]/50 transition-colors"
                      value={data.hero.subHeader}
                      onChange={(e) =>
                        setData({ ...data, hero: { ...data.hero, subHeader: e.target.value } })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-widest uppercase text-white/40">Hero Main Title</label>
                    <input
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff3300]/50 transition-colors font-bold uppercase"
                      value={data.hero.header}
                      onChange={(e) =>
                        setData({ ...data, hero: { ...data.hero, header: e.target.value } })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-widest uppercase text-white/40 block">Hero Backdrop Image Source</label>
                    <div className="flex flex-col gap-3">
                      <input
                        type="text"
                        placeholder="Image URL path or upload file..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/70 focus:outline-none focus:border-[#ff3300]/50 transition-colors font-mono text-sm"
                        value={data.hero.image}
                        onChange={(e) =>
                          setData({ ...data, hero: { ...data.hero, image: e.target.value } })
                        }
                      />
                      <label className="px-5 py-2.5 bg-[#ff3300]/10 border border-[#ff3300]/30 hover:bg-[#ff3300] hover:border-[#ff3300] hover:text-white text-[#ff3300] text-[10px] font-black uppercase tracking-wider rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2 pointer-events-auto w-fit shadow-[0_0_15px_rgba(255,51,0,0.15)]">
                        <Upload className="w-4 h-4" /> Select Local Image File
                        <input type="file" accept="image/*" className="hidden" onChange={handleHeroImageUpload} disabled={uploadingFiles} />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right Image Preview */}
                <div className="flex flex-col gap-4 h-full">
                  <label className="text-xs font-bold tracking-widest uppercase text-white/40 block">Live Active Backdrop Preview</label>
                  <div className="glass-panel p-4 rounded-xl border-white/5 flex flex-col gap-4 bg-white/[0.02] h-full justify-center">
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-[0_0_30px_rgba(255,51,0,0.05)] border border-white/10 group">
                      <Image src={data.hero.image || "/comics/Ch-2 thumbnail.jpeg"} alt="Large preview" fill className="object-cover group-hover:scale-105 transition-transform duration-700" unoptimized />
                    </div>
                    <div className="w-full flex items-center justify-between mt-auto">
                      <p className="text-[10px] font-black uppercase text-[#ff3300] tracking-widest">Image Mounted</p>
                      <p className="text-[10px] text-white/40 font-mono truncate max-w-[220px] bg-black/40 px-2 py-1 rounded border border-white/5">{data.hero.image}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Multi paragraph welcome text editor */}
              <div className="space-y-4 border-t border-white/5 pt-8">
                <label className="text-xs font-bold tracking-widest uppercase text-white/40 block">Cinematic Welcome Paragraph Blocks</label>
                {data.hero.paragraphs.map((p, idx) => (
                  <div key={idx} className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-white/30">Paragraph {idx + 1}</label>
                    <textarea
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff3300]/50 transition-colors text-sm resize-none"
                      value={p}
                      onChange={(e) => {
                        const newParagraphs = [...data.hero.paragraphs];
                        newParagraphs[idx] = e.target.value;
                        setData({ ...data, hero: { ...data.hero, paragraphs: newParagraphs } });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending stories */}
          {activeTab === "trending" && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 gap-4">
                <h2 className="text-xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#ff3300]" /> Home Page Trending Stories
                </h2>
                <button
                  onClick={() => {
                    setData({
                      ...data,
                      trending: [
                        ...data.trending,
                        { comicId: "", title: "New Story Slot", chapter: "00", image: "" }
                      ]
                    });
                  }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors pointer-events-auto flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Trending Slot
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {data.trending.map((story, idx) => (
                  <div key={idx} className="glass-panel p-6 rounded-xl border-white/5 bg-white/[0.01] flex flex-col justify-between gap-6">
                    <div>
                      <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-6">
                        <span className="text-xs font-black tracking-widest uppercase text-[#ff3300]">SLOT {idx + 1}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-white/30 font-bold uppercase">TRENDING STORY</span>
                          <button
                            onClick={() => {
                              const list = [...data.trending];
                              list.splice(idx, 1);
                              setData({ ...data, trending: list });
                            }}
                            className="p-1 hover:bg-red-500/20 text-white/30 hover:text-red-400 rounded transition-colors pointer-events-auto"
                            title="Delete Slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold tracking-widest uppercase text-white/40 block">Select Uploaded Comic</label>
                          {comicsList.length === 0 ? (
                            <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-lg text-xs text-red-400 font-semibold uppercase tracking-wider">
                              No uploaded comics found. Upload a comic chapter first.
                            </div>
                          ) : (
                            <select
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#ff3300]/50 transition-colors text-sm pointer-events-auto"
                              value={story.comicId || ""}
                              onChange={(e) => {
                                const selectedComicId = e.target.value;
                                const selectedComic = comicsList.find((c) => c.id === selectedComicId);
                                if (selectedComic) {
                                  const list = [...data.trending];
                                  list[idx] = {
                                    comicId: selectedComic.id,
                                    title: selectedComic.title,
                                    chapter: selectedComic.chapter,
                                    image: selectedComic.image,
                                    genre: selectedComic.genre,
                                    pagesCount: selectedComic.pages ? selectedComic.pages.length : 0
                                  };
                                  setData({ ...data, trending: list });
                                }
                              }}
                            >
                              <option value="" disabled className="bg-[#0a0a0a]">-- Select Uploaded Comic --</option>
                              {comicsList.map((c) => (
                                <option key={c.id} value={c.id} className="bg-[#0a0a0a]">
                                  {c.title} (Chapter {c.chapter})
                                </option>
                              ))}
                            </select>
                          )}
                        </div>

                        {/* Active Story Live Preview */}
                        <div className="mt-6 p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-center gap-4">
                          <div className="relative w-16 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                            {story.image ? (
                              <Image src={story.image} alt={story.title} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-white/30 uppercase tracking-widest font-bold">None</div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold text-[#ff3300] tracking-widest uppercase">Chapter {story.chapter || "--"}</p>
                            <h4 className="text-sm font-black uppercase text-white truncate">{story.title || "Unselected Story"}</h4>
                            <p className="text-[9px] text-white/40 font-mono truncate">{story.comicId || "No comic link active"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* About page config */}
          {activeTab === "about" && (
            <div className="space-y-8">
              <h2 className="text-xl font-bold uppercase tracking-wider text-white border-b border-white/5 pb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-[#ff3300]" /> Full About Page Customizer
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Text fields */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-widest uppercase text-white/40">About Page Main Title</label>
                    <input
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff3300]/50 transition-colors"
                      value={data.about.title}
                      onChange={(e) =>
                        setData({ ...data, about: { ...data.about, title: e.target.value } })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-widest uppercase text-white/40">Introduction Subtitle text</label>
                    <textarea
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff3300]/50 transition-colors text-sm resize-none"
                      value={data.about.subtitle}
                      onChange={(e) =>
                        setData({ ...data, about: { ...data.about, subtitle: e.target.value } })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-widest uppercase text-white/40 block">About Showcase Image Source</label>
                    <div className="flex flex-col gap-3">
                      <input
                        type="text"
                        placeholder="Image URL path or upload file..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/70 focus:outline-none focus:border-[#ff3300]/50 transition-colors font-mono text-sm"
                        value={data.about.image}
                        onChange={(e) =>
                          setData({ ...data, about: { ...data.about, image: e.target.value } })
                        }
                      />
                      <label className="px-5 py-2.5 bg-[#ff3300]/10 border border-[#ff3300]/30 hover:bg-[#ff3300] hover:border-[#ff3300] hover:text-white text-[#ff3300] text-[10px] font-black uppercase tracking-wider rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2 pointer-events-auto w-fit shadow-[0_0_15px_rgba(255,51,0,0.15)]">
                        <Upload className="w-4 h-4" /> Select Local Image File
                        <input type="file" accept="image/*" className="hidden" onChange={handleAboutImageUpload} disabled={uploadingFiles} />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Philosophy and Image Preview */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-widest uppercase text-white/40">Philosophy Section Header</label>
                    <input
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff3300]/50 transition-colors"
                      value={data.about.philosophyHeader}
                      onChange={(e) =>
                        setData({ ...data, about: { ...data.about, philosophyHeader: e.target.value } })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-widest uppercase text-white/40">Philosophy Description Narrative</label>
                    <textarea
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff3300]/50 transition-colors text-sm resize-none"
                      value={data.about.philosophyDesc}
                      onChange={(e) =>
                        setData({ ...data, about: { ...data.about, philosophyDesc: e.target.value } })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Stats editor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/5 pt-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-widest uppercase text-white/40">Readers Milestone Stat (e.g. 1M+)</label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff3300]/50 transition-colors font-mono"
                    value={data.about.statReaders}
                    onChange={(e) =>
                      setData({ ...data, about: { ...data.about, statReaders: e.target.value } })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-widest uppercase text-white/40">Original Stories Stat Count (e.g. 24)</label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff3300]/50 transition-colors font-mono"
                    value={data.about.statStories}
                    onChange={(e) =>
                      setData({ ...data, about: { ...data.about, statStories: e.target.value } })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Manage Comics Portal */}
          {activeTab === "manage" && (
            <div className="space-y-8">
              <h2 className="text-xl font-bold uppercase tracking-wider text-white border-b border-white/5 pb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#ff3300]" /> Manage Dynamic Comics
              </h2>

              <div className="space-y-4">
                {comicsList.length === 0 ? (
                  <div className="text-center py-20 border border-dashed border-white/5 rounded-xl flex flex-col items-center gap-4">
                    <BookOpen className="w-12 h-12 text-white/10" />
                    <p className="text-white/40 text-sm font-semibold tracking-widest uppercase">No Dynamic Comics Registered.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {comicsList.map((comic, idx) => (
                      <div key={comic.id} className="glass-panel p-4 rounded-xl border-white/5 bg-white/[0.01] hover:border-white/10 transition-colors flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="relative w-16 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                            <Image src={comic.image || "/comics/ch-1 thumbnail.jpeg"} alt={comic.title} fill className="object-cover" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-[#ff3300]/20 text-[#ff3300] border border-[#ff3300]/30 text-[10px] font-bold tracking-wider rounded uppercase">
                                CH {comic.chapter}
                              </span>
                              <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{comic.genre} // {comic.year}</span>
                            </div>
                            <h3 className="text-lg font-black uppercase text-white">{comic.title}</h3>
                            <p className="text-white/40 text-xs line-clamp-1 max-w-[500px]">{comic.desc}</p>
                            <p className="text-[#ff3300] font-mono text-[10px] uppercase font-bold tracking-widest">{comic.pages ? comic.pages.length : 0} Comic Panels Loaded</p>
                          </div>
                        </div>

                        {/* Actions & Sorting */}
                        <div className="flex items-center gap-3">
                          {/* Sort Up / Down */}
                          <div className="flex flex-col gap-1">
                            <button
                              disabled={idx === 0}
                              onClick={() => handleSortComic(idx, "up")}
                              className="p-1.5 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded border border-white/5 disabled:opacity-30 disabled:pointer-events-none pointer-events-auto"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              disabled={idx === comicsList.length - 1}
                              onClick={() => handleSortComic(idx, "down")}
                              className="p-1.5 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded border border-white/5 disabled:opacity-30 disabled:pointer-events-none pointer-events-auto"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => setEditingComic(comic)}
                            className="px-4 py-2 border border-white/10 hover:border-white/30 text-white/80 hover:text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors pointer-events-auto"
                          >
                            Edit Story
                          </button>

                          <button
                            onClick={() => setComicToDelete(comic.id)}
                            className="p-2.5 bg-red-950/20 border border-red-500/10 hover:bg-red-500 hover:text-white hover:border-transparent transition-all duration-300 text-red-400 rounded-lg pointer-events-auto flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload new Comic Portal */}
          {activeTab === "upload" && (
            <div className="space-y-8">
              <h2 className="text-xl font-bold uppercase tracking-wider text-white border-b border-white/5 pb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#ff3300]" /> Upload Cinematic Comic Story
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form fields */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-widest uppercase text-white/40">Comic Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Horizon Awakening"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff3300]/50 transition-colors"
                      value={uploadTitle}
                      onChange={(e) => handleTitleChange(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-widest uppercase text-white/40">Chapter Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 03"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff3300]/50 transition-colors font-mono"
                        value={uploadChapter}
                        onChange={(e) => setUploadChapter(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-widest uppercase text-white/40">Comic ID / Slug</label>
                      <input
                        type="text"
                        placeholder="e.g. horizon-awakening"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/50 focus:outline-none focus:border-[#ff3300]/50 transition-colors font-mono"
                        value={uploadId}
                        onChange={(e) => setUploadId(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 relative">
                      <label className="text-xs font-bold tracking-widest uppercase text-white/40">Genre Tags (Multiple)</label>
                      <div 
                        onClick={() => setGenreDropdownOpen(!genreDropdownOpen)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white cursor-pointer flex justify-between items-center pointer-events-auto hover:bg-white/10 transition-colors"
                      >
                        <span className="truncate text-sm font-semibold text-white/80">
                          {uploadGenre || "Select Genres..."}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${genreDropdownOpen ? "rotate-180" : ""}`} />
                      </div>
                      
                      <AnimatePresence>
                        {genreDropdownOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-[100] w-full mt-2 bg-[#0a0a0a] border border-white/10 rounded-lg shadow-2xl max-h-60 overflow-y-auto pointer-events-auto custom-scrollbar"
                          >
                            <div className="p-2 grid grid-cols-2 gap-1">
                              {AVAILABLE_GENRES.map(genre => {
                                const selectedGenres = uploadGenre ? uploadGenre.split(" • ") : [];
                                const isSelected = selectedGenres.includes(genre);
                                return (
                                  <div 
                                    key={genre}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isSelected) {
                                        setUploadGenre(selectedGenres.filter((g: string) => g !== genre).join(" • "));
                                      } else {
                                        setUploadGenre([...selectedGenres, genre].join(" • "));
                                      }
                                    }}
                                    className={`px-3 py-2 rounded-md cursor-pointer flex items-center justify-between text-[11px] font-bold uppercase tracking-wider transition-colors ${
                                      isSelected ? "bg-[#ff3300]/20 text-[#ff3300]" : "hover:bg-white/5 text-white/60 hover:text-white"
                                    }`}
                                  >
                                    {genre}
                                    {isSelected && <Check className="w-3.5 h-3.5 text-[#ff3300]" />}
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-widest uppercase text-white/40">Publication Year</label>
                      <input
                        type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff3300]/50 transition-colors font-mono"
                        value={uploadYear}
                        onChange={(e) => setUploadYear(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-widest uppercase text-white/40">Synopsis Description</label>
                    <textarea
                      rows={4}
                      placeholder="Write a cinematic overview of the chapter story..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff3300]/50 transition-colors text-sm resize-none"
                      value={uploadDesc}
                      onChange={(e) => setUploadDesc(e.target.value)}
                    />
                  </div>
                </div>

                {/* Media assets uploading */}
                <div className="space-y-6">
                  {/* Thumbnail uploader */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-widest uppercase text-white/40 block">Cover Thumbnail Image</label>
                    <div className="flex gap-4 items-center">
                      <div className="relative w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 border border-dashed border-white/10 flex items-center justify-center">
                        {uploadCover ? (
                          <Image src={uploadCover} alt="Cover Preview" fill className="object-cover" />
                        ) : (
                          <Upload className="w-5 h-5 text-white/20" />
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          placeholder="Thumbnail URL path or select file..."
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white/55 text-xs focus:outline-none focus:border-[#ff3300]/50 transition-colors font-mono"
                          value={uploadCover}
                          onChange={(e) => setUploadCover(e.target.value)}
                        />
                        <label className="px-4 py-2 bg-white/5 border border-white/10 hover:border-white/30 text-white/80 hover:text-white text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-colors inline-block pointer-events-auto">
                          Select Cover File
                          <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Multi pages upload dropzone */}
                  <div className="space-y-2 border-t border-white/5 pt-6">
                    <label className="text-xs font-bold tracking-widest uppercase text-white/40 block">Comic Panels / Pages Batch Upload</label>
                    
                    <div className="glass-panel p-6 rounded-xl border-dashed border-2 border-white/5 hover:border-white/20 transition-all text-center flex flex-col items-center gap-4 bg-white/[0.005]">
                      <Upload className="w-8 h-8 text-white/20" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-white">Select Comic Pages</p>
                        <p className="text-[10px] text-white/40 mt-1">Upload multiple pages in order at once</p>
                      </div>
                      
                      <label className="px-4 py-2 bg-[#ff3300]/10 border border-[#ff3300]/20 hover:bg-[#ff3300]/25 text-white text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-colors inline-block pointer-events-auto">
                        Browse Panel Files
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              setSelectedPageFiles(Array.from(e.target.files));
                            }
                          }}
                        />
                      </label>

                      {selectedPageFiles.length > 0 && (
                        <div className="w-full space-y-3 mt-2 border-t border-white/5 pt-4">
                          <p className="text-[10px] font-mono text-[#ff3300] uppercase font-bold tracking-widest">{selectedPageFiles.length} Panels selected for batch upload</p>
                          
                          {uploadingFiles ? (
                            <div className="space-y-1.5 text-left">
                              <div className="flex justify-between text-[8px] font-mono font-bold uppercase text-white/50 tracking-wider">
                                <span>Uploading Panels sequence...</span>
                                <span>{uploadProgress}%</span>
                              </div>
                              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-[#ff3300] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={handlePagesUpload}
                              className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-lg pointer-events-auto transition-colors"
                            >
                              Confirm Batch Upload
                            </button>
                          )}
                        </div>
                      )}

                      {uploadPages.length > 0 && (
                        <div className="w-full text-left mt-2">
                          <p className="text-[10px] font-bold uppercase text-[#ff3300] tracking-wider mb-2">Uploaded Panel Previews ({uploadPages.length})</p>
                          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                            {uploadPages.map((path, idx) => (
                              <div key={idx} className="relative w-12 h-18 rounded border border-white/10 overflow-hidden flex-shrink-0">
                                <Image src={path} alt={`page-${idx}`} fill className="object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Publish button */}
              <div className="border-t border-white/5 pt-8 flex justify-end">
                <button
                  onClick={handlePublishComic}
                  disabled={uploadingFiles}
                  className="px-8 py-3.5 bg-[#ff3300] text-white hover:bg-red-600 transition-colors rounded-lg flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(255,51,0,0.3)] disabled:opacity-50 pointer-events-auto"
                >
                  <Plus className="w-5 h-5" /> Publish Comic Story
                </button>
              </div>
            </div>
          )}

          {/* Inbox transmissions */}
          {activeTab === "messages" && (
            <div className="space-y-8">
              <h2 className="text-xl font-bold uppercase tracking-wider text-white border-b border-white/5 pb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#ff3300]" /> Secure Contact Transmissions Feed
              </h2>

              {data.messages.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/5 rounded-xl flex flex-col items-center gap-4">
                  <Mail className="w-12 h-12 text-white/10" />
                  <p className="text-white/40 text-sm font-semibold tracking-widest uppercase">No secure transmissions on record.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {data.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="glass-panel p-6 md:p-8 rounded-xl border-white/5 bg-white/[0.01] hover:border-white/10 transition-colors flex flex-col md:flex-row justify-between items-start gap-6"
                    >
                      <div className="space-y-4 flex-1">
                        {/* Meta lines */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-white/40 font-bold uppercase tracking-widest">CALL SIGN:</span>
                            <span className="text-white font-bold tracking-wider">{msg.name}</span>
                          </div>
                          <div className="w-[1px] h-3 bg-white/10 hidden md:block" />
                          <div className="flex items-center gap-2">
                            <span className="text-white/40 font-bold uppercase tracking-widest">FREQUENCY:</span>
                            <span className="text-white/80 font-mono tracking-wide">{msg.email}</span>
                          </div>
                          <div className="w-[1px] h-3 bg-white/10 hidden md:block" />
                          <div className="text-white/30 font-bold tracking-widest uppercase">
                            {new Date(msg.timestamp).toLocaleString()}
                          </div>
                        </div>

                        {/* Message payload */}
                        <div className="border-t border-white/5 pt-4">
                          <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line font-mono bg-black/40 p-4 rounded-lg border border-white/[0.02]">
                            {msg.message}
                          </p>
                        </div>
                      </div>

                      {/* Quick Delete */}
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="p-3 bg-red-950/20 border border-red-500/10 hover:bg-red-500 hover:text-white hover:border-transparent transition-all duration-300 text-red-400 rounded-lg pointer-events-auto flex items-center justify-center flex-shrink-0"
                        title="Mark as Resolved (Delete)"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Comic Popout Overlay Modal */}
      <AnimatePresence>
        {editingComic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 md:p-8 max-h-[85vh] overflow-y-auto shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="text-xl font-black uppercase text-white tracking-wider flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#ff3300]" /> Modify Story Settings
                </h3>
                <button
                  onClick={() => setEditingComic(null)}
                  className="text-white/40 hover:text-white p-1 hover:bg-white/5 rounded-full pointer-events-auto transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form fields inside Modal */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-white/40">Comic Title</label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#ff3300]/50 transition-colors text-sm"
                    value={editingComic.title}
                    onChange={(e) => setEditingComic({ ...editingComic, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-white/40">Chapter Number</label>
                    <input
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#ff3300]/50 transition-colors text-sm font-mono"
                      value={editingComic.chapter}
                      onChange={(e) => setEditingComic({ ...editingComic, chapter: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1 relative">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-white/40">Genre Tags (Multiple)</label>
                    <div 
                      onClick={() => setEditGenreDropdownOpen(!editGenreDropdownOpen)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white cursor-pointer flex justify-between items-center pointer-events-auto hover:bg-white/10 transition-colors"
                    >
                      <span className="truncate text-sm font-semibold text-white/80">
                        {editingComic.genre || "Select Genres..."}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${editGenreDropdownOpen ? "rotate-180" : ""}`} />
                    </div>
                    
                    <AnimatePresence>
                      {editGenreDropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-[100] w-full mt-1 bg-[#0a0a0a] border border-white/10 rounded-lg shadow-2xl max-h-48 overflow-y-auto pointer-events-auto custom-scrollbar"
                        >
                          <div className="p-2 grid grid-cols-2 gap-1">
                            {AVAILABLE_GENRES.map(genre => {
                              const selectedGenres = editingComic.genre ? editingComic.genre.split(" • ") : [];
                              const isSelected = selectedGenres.includes(genre);
                              return (
                                <div 
                                  key={genre}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isSelected) {
                                      setEditingComic({ ...editingComic, genre: selectedGenres.filter((g: string) => g !== genre).join(" • ") });
                                    } else {
                                      setEditingComic({ ...editingComic, genre: [...selectedGenres, genre].join(" • ") });
                                    }
                                  }}
                                  className={`px-2 py-2 rounded-md cursor-pointer flex items-center justify-between text-[10px] font-bold uppercase tracking-wider transition-colors ${
                                    isSelected ? "bg-[#ff3300]/20 text-[#ff3300]" : "hover:bg-white/5 text-white/60 hover:text-white"
                                  }`}
                                >
                                  {genre}
                                  {isSelected && <Check className="w-3 h-3 text-[#ff3300]" />}
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-white/40">Publication Year</label>
                    <input
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#ff3300]/50 transition-colors text-sm font-mono"
                      value={editingComic.year}
                      onChange={(e) => setEditingComic({ ...editingComic, year: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-white/40 block">Cover Thumbnail Source</label>
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white/70 focus:outline-none focus:border-[#ff3300]/50 transition-colors text-sm font-mono"
                        value={editingComic.image}
                        onChange={(e) => setEditingComic({ ...editingComic, image: e.target.value })}
                      />
                      <label className="px-4 py-2 bg-[#ff3300]/10 border border-[#ff3300]/30 hover:bg-[#ff3300] hover:text-white text-[#ff3300] text-[9px] font-black uppercase tracking-wider rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2 pointer-events-auto w-fit">
                        <Upload className="w-3.5 h-3.5" /> Upload File
                        <input type="file" accept="image/*" className="hidden" onChange={handleEditCoverUpload} disabled={uploadingFiles} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-white/40">Synopsis Description</label>
                  <textarea
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#ff3300]/50 transition-colors text-xs resize-none"
                    value={editingComic.desc}
                    onChange={(e) => setEditingComic({ ...editingComic, desc: e.target.value })}
                  />
                </div>

                {/* Edit pages array directly */}
                <div className="space-y-2 border-t border-white/5 pt-4">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-white/40 block">Modify Panels Sequence ({editingComic.pages ? editingComic.pages.length : 0} pages)</label>
                  <textarea
                    rows={4}
                    placeholder="Enter image paths separated by comma..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#ff3300]/50 transition-colors font-mono text-[10px] resize-y"
                    value={editingComic.pages ? editingComic.pages.join(", ") : ""}
                    onChange={(e) => {
                      const pagesList = e.target.value.split(",").map((s) => s.trim()).filter((s) => s !== "");
                      setEditingComic({ ...editingComic, pages: pagesList });
                    }}
                  />
                </div>
              </div>

              {/* Modal controls */}
              <div className="border-t border-white/5 pt-4 flex justify-end gap-3">
                <button
                  onClick={() => setEditingComic(null)}
                  className="px-4 py-2 border border-white/10 hover:bg-white/5 text-white/60 hover:text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors pointer-events-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditComicSave}
                  className="px-5 py-2 bg-[#ff3300] hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors pointer-events-auto"
                >
                  Save Modifications
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#ff3300] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 font-semibold tracking-widest uppercase text-xs">Securing Admin Transmission Channel...</p>
        </div>
      </div>
    }>
      <AdminContent />
    </Suspense>
  );
}
