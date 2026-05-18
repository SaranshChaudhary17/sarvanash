"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ComicsClient({
  initialHeroImage,
  initialComics,
}: {
  initialHeroImage: string;
  initialComics: any[];
}) {
  return (
    <div className="min-h-screen bg-[#050505] relative pb-24">
      {/* Hero Backdrop - synced with admin hero image, no flash */}
      <div className="absolute top-0 left-0 right-0 z-0 h-[60vh] overflow-hidden">
        <Image
          src={initialHeroImage}
          alt="Comics Backdrop"
          fill
          className="object-cover object-center"
          unoptimized
          priority
        />
        {/* Cinematic gradient — fades to page background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-[#050505]" />
        {/* Side vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
      </div>

      <div className="relative z-10 container mx-auto px-6 md:px-12 pt-40 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-6 drop-shadow-2xl">
            Featured Comics
          </h1>
          <p className="text-white/60 max-w-2xl text-lg">
            Explore the complete collection of Sarvanash originals. Immerse yourself in the story.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          {initialComics.map((comic, idx) => (
            <motion.div
              key={comic.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className="group perspective-[1200px]"
            >
              <Link href={`/comics/${comic.id}`}>
                <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden glass-panel transition-all duration-700 ease-out transform group-hover:rotate-y-[-5deg] group-hover:rotate-x-[5deg] group-hover:-translate-y-4 group-hover:shadow-[0_30px_60px_rgba(255,51,0,0.2)] font-sans">
                  <Image
                    src={comic.image}
                    alt={comic.title}
                    fill
                    className="object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                    unoptimized
                  />
                  {/* Cinematic overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-500" />

                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center gap-3 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      <span className="px-2 py-1 bg-[#ff3300]/20 text-[#ff3300] border border-[#ff3300]/30 text-xs font-bold tracking-widest rounded-sm uppercase">
                        CH {comic.chapter}
                      </span>
                      <span className="text-white/50 text-xs tracking-wider">{comic.year}</span>
                    </div>
                    <h3 className="text-2xl font-black uppercase text-white mb-2">{comic.title}</h3>
                    <p className="text-white/60 text-sm mb-4 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                      {comic.desc}
                    </p>

                    {/* Read progress indicator */}
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-auto">
                      <div className="h-full bg-[#ff3300] w-0 group-hover:w-[15%] transition-all duration-1000 ease-out" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
