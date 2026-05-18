"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const CHARACTERS = [
  {
    name: "Aria Thorne",
    role: "The Navigator",
    bio: "Born in the remnants of Sector 4, Aria possesses the rare ability to interface directly with the abyss architecture.",
    color: "from-blue-500/20 to-purple-500/20",
    glow: "rgba(59, 130, 246, 0.5)",
    image: "/comics/ch-1 thumbnail.jpeg" // Placeholder
  },
  {
    name: "Kaelen",
    role: "Vanguard",
    bio: "A rogue sentinel who turned against the upper echelons to protect the inhabitants of Floor 13.",
    color: "from-red-500/20 to-orange-500/20",
    glow: "rgba(239, 68, 68, 0.5)",
    image: "/comics/Ch-2 thumbnail.jpeg" // Placeholder
  },
  {
    name: "The Architect",
    role: "Unknown",
    bio: "An enigmatic entity that seemingly controls the shifting layout of the underground megacity.",
    color: "from-emerald-500/20 to-teal-500/20",
    glow: "rgba(16, 185, 129, 0.5)",
    image: "/comics/ch-1 thumbnail.jpeg" // Placeholder
  }
];

export default function CharactersPage() {
  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-24 overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20 text-center max-w-3xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-6">Dramatis Personae</h1>
          <p className="text-white/50 text-lg">The souls intertwined in the fate of the abyss. Discover the heroes, villains, and those in between.</p>
        </motion.div>

        <div className="flex flex-col gap-32">
          {CHARACTERS.map((char, idx) => (
            <motion.div
              key={char.name}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`flex flex-col ${idx % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-24`}
            >
              {/* Image Card */}
              <div className="w-full md:w-1/2 relative perspective-[1000px]">
                {/* Background Ambient Glow */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${char.color} blur-[100px] opacity-50 -z-10`}
                />
                
                <motion.div 
                  whileHover={{ rotateY: idx % 2 === 1 ? -5 : 5, scale: 1.02 }}
                  transition={{ duration: 0.5 }}
                  className="relative aspect-[3/4] w-full max-w-md mx-auto rounded-xl overflow-hidden glass-panel border-white/10"
                  style={{ boxShadow: `0 0 40px ${char.glow}` }}
                >
                  <Image
                    src={char.image}
                    alt={char.name}
                    fill
                    className="object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                </motion.div>
              </div>

              {/* Text Content */}
              <div className="w-full md:w-1/2 space-y-6">
                <div className="inline-block px-4 py-1 glass-panel text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: char.glow.replace('0.5', '1') }}>
                  {char.role}
                </div>
                <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter">{char.name}</h2>
                <p className="text-xl text-white/60 leading-relaxed max-w-lg">
                  {char.bio}
                </p>
                <div className="pt-8">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="glass-button px-8 py-3 rounded-full uppercase tracking-wider text-sm font-bold flex items-center gap-2"
                  >
                    View Full Intel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
