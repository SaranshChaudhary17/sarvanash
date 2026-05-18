"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutPage() {
  const [aboutData, setAboutData] = useState({
    title: "About Sarvanash",
    subtitle: "Sarvanash Studios was founded on a singular vision: to elevate the digital comic reading experience from a simple scroll to a cinematic journey.",
    image: "/about.png",
    philosophyHeader: "Storytelling through Technology",
    philosophyDesc: "We believe that stories deserve to be told with the full power of modern web technologies. By combining traditional comic art with subtle motion, atmospheric lighting, and buttery smooth interactions, we create an emotional resonance that static pages simply cannot match.",
    statReaders: "1M+",
    statStories: "24"
  });

  useEffect(() => {
    fetch("/api/admin")
      .then((res) => {
        if (res.ok) return res.json();
      })
      .then((json) => {
        if (json && json.about) {
          setAboutData(json.about);
        }
      })
      .catch((err) => console.error("Failed to load dynamic about data", err));
  }, []);
  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-24">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20 max-w-4xl"
        >
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-6">{aboutData.title}</h1>
          <div className="w-24 h-1 bg-[#ff3300] mb-8" />
          <p className="text-white/70 text-xl leading-relaxed">
            {aboutData.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden glass-panel">
              <Image
                src={aboutData.image}
                alt="Studio creation process"
                fill
                className="object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-transparent opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-[#ff3300] font-bold tracking-widest text-sm uppercase mb-2">Our Philosophy</h3>
              <h2 className="text-4xl font-black uppercase text-white mb-4">{aboutData.philosophyHeader}</h2>
              <p className="text-white/50 leading-relaxed">
                {aboutData.philosophyDesc}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
              <div>
                <h4 className="text-3xl font-black text-white mb-2">{aboutData.statReaders}</h4>
                <p className="text-white/40 text-sm uppercase tracking-widest">Readers Worldwide</p>
              </div>
              <div>
                <h4 className="text-3xl font-black text-white mb-2">{aboutData.statStories}</h4>
                <p className="text-white/40 text-sm uppercase tracking-widest">Original Stories</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
