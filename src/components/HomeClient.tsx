"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Play } from "lucide-react";

type Particle = {
  id: number;
  x: number;
  y: number;
  scale: number;
  driftX: number;
  driftY: number;
  duration: number;
};

export default function HomeClient({ initialData }: { initialData: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [adminData, setAdminData] = useState(initialData);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    // Generate particles
    setParticles(
      Array.from({ length: 20 }, (_, id) => ({
        id,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        scale: Math.random() * 2,
        driftX: Math.random() * 200 - 100,
        driftY: Math.random() * -500,
        duration: Math.random() * 10 + 10,
      }))
    );
  }, []);

  return (
    <div className="relative bg-[#050505]">
      {/* Hero Section */}
      <section ref={containerRef} className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Parallax Background - Server-rendered image immediately */}
        <motion.div style={{ y, opacity }} className="absolute inset-0 w-full h-full">
          <Image
            src={adminData.hero.image}
            alt="Hero Background"
            fill
            className="object-cover object-center opacity-40 scale-105"
            priority
            unoptimized
          />
          {/* Gradients to blend into black */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent opacity-80" />
        </motion.div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              initial={{
                x: particle.x,
                y: particle.y,
                scale: particle.scale,
              }}
              animate={{
                y: particle.driftY,
                x: particle.x + particle.driftX,
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 md:px-12 flex flex-col items-start justify-center h-full pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-[#ff3300] font-semibold tracking-[0.2em] uppercase text-sm mb-4">
              {adminData.hero.subHeader}
            </h2>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase mb-6 leading-none"
          >
            {(() => {
              const words = adminData.hero.header.split(" ");
              if (words.length > 1) {
                const lastWord = words.pop();
                const firstPart = words.join(" ");
                return (
                  <>
                    {firstPart}{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30">
                      {lastWord}
                    </span>
                  </>
                );
              }
              return adminData.hero.header;
            })()}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-white/60 text-base md:text-lg max-w-2xl mb-10 leading-relaxed space-y-4"
          >
            {adminData.hero.paragraphs.map((p: string, idx: number) => (
              <p key={idx}>{p}</p>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-6"
          >
            <Link
              href="/comics"
              className="group relative px-8 py-4 bg-white text-black font-semibold uppercase tracking-wider overflow-hidden rounded-sm"
            >
              <div className="absolute inset-0 bg-[#ff3300] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
              <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors duration-300">
                <Play className="w-5 h-5 fill-current" /> Read Now
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Showcase */}
      <section className="relative py-32 px-6 md:px-12 z-20">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4">Trending Stories</h2>
            <div className="h-1 w-20 bg-[#ff3300]" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {adminData.trending.map((comic: any, idx: number) => {
              const href = comic.comicId ? `/comics/${comic.comicId}` : "/comics";
              return (
                <Link href={href} key={idx} className="block group perspective-[1000px]">
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: idx * 0.2 }}
                    className="relative aspect-[2/3] w-full rounded-lg overflow-hidden glass-panel transition-all duration-700 ease-out transform group-hover:rotate-y-[-5deg] group-hover:rotate-x-[5deg] group-hover:-translate-y-4 group-hover:shadow-[0_20px_50px_rgba(255,51,0,0.15)]"
                  >
                    <Image
                      src={comic.image}
                      alt={comic.title}
                      fill
                      className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 font-sans"
                      unoptimized
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 p-8 w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <span className="text-[#ff3300] font-bold tracking-widest text-sm mb-2 block opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 uppercase">
                        CHAPTER {comic.chapter}
                      </span>
                      <h3 className="text-3xl font-black uppercase text-white mb-2">{comic.title}</h3>
                      <p className="text-white/60 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                        Read Time: {comic.pagesCount ? Math.max(1, Math.ceil(comic.pagesCount * 0.5)) : 5} min • {comic.genre || "Action / Drama"}
                      </p>
                    </div>

                    {/* Cinematic Glow border */}
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/10 rounded-lg transition-colors duration-500" />
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
