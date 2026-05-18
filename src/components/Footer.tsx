"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Twitter, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const isReaderPage = pathname.startsWith("/comics/") && pathname.split("/").length > 2;
  const isAdminPage = pathname.startsWith("/admin");

  if (isReaderPage || isAdminPage) return null;

  return (
    <footer className="relative bg-[#050505] border-t border-white/5 pt-20 pb-10 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-white/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 group mb-6 inline-flex">
              <Image
                src="/logo.png"
                alt="Sarvanash Logo"
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="text-2xl font-bold tracking-widest uppercase text-white group-hover:text-glow transition-all duration-300">
                Sarvanash
              </span>
            </Link>
            <div className="text-white/50 text-sm leading-relaxed max-w-sm mb-8 space-y-3">
              <p>Enter a world of cinematic storytelling and immersive comic adventures.</p>
              <p>Discover original heroes, dark mysteries, and unforgettable universes — all in one place.</p>
            </div>
            <div className="flex gap-4">
              {[Twitter, Instagram, Youtube].map((Icon, idx) => (
                <motion.a
                  key={idx}
                  href="#"
                  whileHover={{ y: -5, scale: 1.1 }}
                  className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white/70 hover:text-white hover:border-white/40 hover:bg-white/10 transition-colors duration-300"
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>
          <div className="col-span-1 md:col-span-2 md:flex md:justify-end">
            <div className="min-w-[180px]">
              <h4 className="text-white font-semibold tracking-wider uppercase text-sm mb-6">Explore</h4>
              <ul className="space-y-4">
                {[
                  { name: "Home", href: "/" },
                  { name: "Comics", href: "/comics" },
                  { name: "About", href: "/about" },
                  { name: "Contact", href: "/contact" },
                  { name: "Terms of Service", href: "/terms-of-service" },
                ].map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-white/50 hover:text-white transition-colors duration-300 text-sm">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} Sarvanash Studios. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-white/30 hover:text-white transition-colors duration-300 text-xs">Privacy Policy</Link>
            <Link href="/cookies" className="text-white/30 hover:text-white transition-colors duration-300 text-xs">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
