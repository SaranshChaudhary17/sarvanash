"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import clsx from "clsx";

const TIMELINE = [
  {
    year: "2024",
    title: "The Fracture",
    desc: "A catastrophic event shatters the surface, forcing humanity to seek refuge underground.",
  },
  {
    year: "2025",
    title: "Establishment of Floor 1",
    desc: "The first level of the underground megacity is built. The social hierarchy begins to form.",
  },
  {
    year: "2026",
    title: "Discovery of Floor 13",
    desc: "An expedition delves deeper than ever before, discovering an ancient, seemingly alien structure.",
  },
  {
    year: "2027",
    title: "The Awakening",
    desc: "Entities within Floor 13 begin to stir. The events of our story commence.",
  }
];

export default function UniversePage() {
  const [activeEvent, setActiveEvent] = useState(0);

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-24 relative overflow-hidden">
      {/* Sci-fi Map Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20 text-center max-w-3xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-6">The Universe</h1>
          <p className="text-white/50 text-lg">Delve into the lore of the abyss. Explore the history, the factions, and the secrets of the underground megacity.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          {/* Timeline Nav */}
          <div className="lg:col-span-4 relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10" />
            
            <div className="space-y-12">
              {TIMELINE.map((event, idx) => (
                <div 
                  key={event.year}
                  className="relative pl-12 cursor-pointer group"
                  onClick={() => setActiveEvent(idx)}
                >
                  <motion.div 
                    layoutId={activeEvent === idx ? "timeline-indicator" : undefined}
                    className={clsx(
                      "absolute left-[-5px] top-1 w-3 h-3 rounded-full transition-colors duration-300 z-10",
                      activeEvent === idx ? "bg-[#ff3300] shadow-[0_0_15px_#ff3300]" : "bg-white/20 group-hover:bg-white/50"
                    )}
                  />
                  <h3 className={clsx(
                    "text-3xl font-black transition-colors duration-300",
                    activeEvent === idx ? "text-white" : "text-white/30 group-hover:text-white/60"
                  )}>
                    {event.year}
                  </h3>
                </div>
              ))}
            </div>
          </div>

          {/* Map/Details Dashboard */}
          <div className="lg:col-span-8">
            <motion.div
              key={activeEvent}
              initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
              transition={{ duration: 0.5 }}
              className="glass-panel p-8 md:p-12 rounded-xl relative overflow-hidden min-h-[400px] flex flex-col justify-end border-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#ff3300]/5 to-transparent pointer-events-none" />
              
              {/* Sci-fi UI Elements */}
              <div className="absolute top-6 right-6 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-[#ff3300] animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-white/20" />
                <div className="w-2 h-2 rounded-full bg-white/20" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ff3300]/50 to-transparent" />

              <div className="relative z-10">
                <div className="text-[#ff3300] font-bold tracking-widest text-sm mb-4 uppercase">
                  Log Entry // {TIMELINE[activeEvent].year}
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white uppercase mb-6">
                  {TIMELINE[activeEvent].title}
                </h2>
                <p className="text-xl text-white/60 leading-relaxed">
                  {TIMELINE[activeEvent].desc}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
