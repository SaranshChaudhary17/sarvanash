"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowLeft, Maximize, Minimize, ZoomIn, ZoomOut } from "lucide-react";

type ComicData = {
  id: string;
  title: string;
  chapter: string;
  image: string;
  genre?: string;
  year?: string;
  desc?: string;
  pages?: string[];
};

export default function ClientComicReader({
  initialComic,
  fallbackPages,
  nextChapterId,
}: {
  initialComic: ComicData | null;
  fallbackPages: string[];
  nextChapterId: string | null;
}) {
  const [comicData, setComicData] = useState<ComicData | null>(initialComic);
  const [images, setImages] = useState<string[]>(initialComic?.pages && initialComic.pages.length > 0 ? initialComic.pages : fallbackPages);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [zoomedIdx, setZoomedIdx] = useState<number | null>(null);
  const [lastTap, setLastTap] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setControlsVisible(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (window.scrollY > 100) setControlsVisible(false);
      }, 3000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => console.error("Error enabling fullscreen:", err));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch((err) => console.error("Error exiting fullscreen:", err));
      }
    }
  };

  const handleTap = (idx: number) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (zoomedIdx === idx) {
        setZoomedIdx(null);
      } else {
        setZoomedIdx(idx);
      }
    }
    setLastTap(now);
  };

  return (
    <div className="bg-black min-h-screen relative selection:bg-transparent overflow-x-hidden" ref={containerRef}>
      {/* Top Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-[#ff3300] origin-left z-[100]"
        style={{ scaleX }}
      />

      {/* Floating Back Button (Left) */}
      <motion.div
        initial={{ opacity: 1, x: 0 }}
        animate={{ opacity: controlsVisible ? 1 : 0, x: controlsVisible ? 0 : -100 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="fixed top-6 left-6 z-50 pointer-events-none"
      >
        <Link
          href="/comics"
          className="w-12 h-12 glass-panel rounded-full flex items-center justify-center text-white/80 hover:text-white pointer-events-auto hover:bg-white/10 transition-colors shadow-lg border border-white/10"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
      </motion.div>

      {/* Floating Controls (Right) */}
      <motion.div
        initial={{ opacity: 1, x: 0 }}
        animate={{ opacity: controlsVisible ? 1 : 0, x: controlsVisible ? 0 : 100 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="fixed top-6 right-6 z-50 pointer-events-none flex flex-col gap-3"
      >
        <button
          onClick={toggleFullscreen}
          className="w-12 h-12 glass-panel rounded-full flex items-center justify-center text-white/80 hover:text-white pointer-events-auto hover:bg-white/10 transition-colors shadow-lg border border-white/10"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
        </button>

        {zoomedIdx !== null && (
          <button
            onClick={() => setZoomedIdx(null)}
            className="w-12 h-12 glass-panel rounded-full flex items-center justify-center text-[#ff3300] pointer-events-auto hover:bg-[#ff3300]/10 transition-colors shadow-lg border border-[#ff3300]/30 animate-pulse"
            title="Reset Zoom"
          >
            <ZoomOut className="w-6 h-6" />
          </button>
        )}
      </motion.div>

      {/* Instructions Overlay */}
      {controlsVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-black/80 border border-white/10 px-4 py-2 rounded-full text-[10px] uppercase font-bold tracking-widest text-white/60 pointer-events-none backdrop-blur-md shadow-2xl flex items-center gap-2"
        >
          <ZoomIn className="w-3.5 h-3.5 text-[#ff3300]" />
          <span>Double-Tap to Zoom & Drag to Pan Panels</span>
        </motion.div>
      )}

      {/* Comic Panels */}
      <div className="max-w-4xl mx-auto flex flex-col items-center pb-32 pt-20 px-4 md:px-0">
        {images.length > 0 ? (
          images.map((src, idx) => {
            const isZoomed = zoomedIdx === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`w-full relative flex justify-center mb-6 transition-all duration-300 ${
                  isZoomed ? "z-40" : "z-10"
                }`}
                onClick={() => handleTap(idx)}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#ff3300]/5 to-transparent blur-3xl -z-10 opacity-30" />
                
                <motion.div
                  animate={{
                    scale: isZoomed ? 1.6 : 1,
                    y: isZoomed ? 0 : 0,
                  }}
                  drag={isZoomed}
                  dragConstraints={{ left: -250, right: 250, top: -300, bottom: 300 }}
                  dragElastic={0.1}
                  transition={{ type: "spring", stiffness: 260, damping: 25 }}
                  className={`relative w-full cursor-pointer overflow-hidden rounded-lg border border-white/5 bg-black/40 ${
                    isZoomed ? "shadow-[0_0_50px_rgba(255,51,0,0.25)] border-[#ff3300]/30" : "hover:border-white/10"
                  }`}
                >
                  <Image
                    src={src}
                    alt={`Page ${idx + 1}`}
                    width={1200}
                    height={1800}
                    className="w-full h-auto object-contain select-none pointer-events-none"
                    priority={idx < 3}
                    unoptimized
                  />
                  
                  {/* Zoom Indicator on Hover */}
                  {!isZoomed && (
                    <div className="absolute inset-0 bg-[#ff3300]/5 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                      <div className="bg-black/80 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-2xl">
                        <ZoomIn className="w-3.5 h-3.5 text-[#ff3300]" />
                        <span className="text-[9px] uppercase font-bold tracking-widest text-white/80">Double Tap</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            );
          })
        ) : (
          <div className="h-screen flex items-center justify-center text-white/50">
            <p>Chapter images not available yet.</p>
          </div>
        )}

        {/* End of Chapter Section */}
        {nextChapterId && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="w-full max-w-md text-center mt-12 p-8 border border-white/10 rounded-2xl glass-panel flex flex-col items-center gap-4 bg-white/[0.01]"
          >
            <h3 className="text-xl font-black uppercase text-white tracking-wider">Chapter Finished</h3>
            <p className="text-xs text-white/50">Ready to continue your cinematic journey?</p>
            <Link
              href={`/comics/${nextChapterId}`}
              className="px-8 py-3 bg-[#ff3300] text-white hover:bg-red-600 transition-colors rounded-xl font-bold uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(255,51,0,0.3)] pointer-events-auto"
            >
              Read Next Chapter
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
