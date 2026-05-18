"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import clsx from "clsx";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Comics", href: "/comics" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [inboxCount, setInboxCount] = useState(0);
  const [activeTab, setActiveTab] = useState("hero");

  const pathname = usePathname();
  const isReaderPage = pathname.startsWith("/comics/") && pathname.split("/").length > 2;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (pathname === "/admin") {
      fetch("/api/admin")
        .then((res) => {
          if (res.ok) return res.json();
        })
        .then((json) => {
          if (json && json.messages) {
            setInboxCount(json.messages.length);
          }
        })
        .catch((err) => console.error("Failed to load message count", err));
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      setActiveTab(params.get("tab") || "hero");
    };

    handleUrlChange();

    const interval = setInterval(handleUrlChange, 100);
    window.addEventListener("popstate", handleUrlChange);

    return () => {
      window.removeEventListener("popstate", handleUrlChange);
      clearInterval(interval);
    };
  }, [pathname]);

  if (isReaderPage) return null;

  const adminLinks = [
    { name: "Hero Screen", tab: "hero" },
    { name: "Trending", tab: "trending" },
    { name: "About Page", tab: "about" },
    { name: "Manage Comics", tab: "manage" },
    { name: "Upload Comic", tab: "upload" },
    { name: `Inbox (${inboxCount})`, tab: "messages" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 w-full flex justify-center pointer-events-none">
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={clsx(
            "w-[92%] max-w-5xl transition-all duration-500 ease-out pointer-events-auto",
            isScrolled ? "mt-3" : "mt-5"
          )}
        >
          <div
            className={clsx(
              "w-full flex items-center justify-between px-6 py-3.5 rounded-full border transition-all duration-500 bg-black/40 backdrop-blur-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.8)]",
              isScrolled ? "border-white/10" : "border-white/5"
            )}
          >
            {/* Brand Logo & Name */}
            <Link href="/" className="flex items-center gap-3 group relative z-10">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="relative w-7 h-7 flex-shrink-0"
              >
                <Image
                  src="/logo.png"
                  alt="Sarvanash Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>
              <span className="text-lg font-black tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70 group-hover:text-glow transition-all duration-300">
                Sarvanash
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-2 relative z-10">
              {pathname === "/admin" ? (
                adminLinks.map((link) => {
                  const active = activeTab === link.tab;
                  return (
                    <Link
                      key={link.tab}
                      href={`/admin?tab=${link.tab}`}
                      scroll={false}
                      className="relative px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase text-white/60 hover:text-white transition-colors duration-300 flex items-center justify-center pointer-events-auto"
                    >
                      <span className="relative z-10">{link.name}</span>
                      
                      {/* Smooth Pill Hover Effect */}
                      {active && (
                        <motion.div
                          layoutId="nav-hover-pill"
                          className="absolute inset-0 bg-white/5 border border-white/10 rounded-full -z-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
                          transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        />
                      )}
                      
                      {/* Active Indicator (Apple-Style Tiny Glowing Under-Dot) */}
                      {active && (
                        <motion.div
                          layoutId="active-dot"
                          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-[0_0_10px_#fff,0_0_4px_#fff]"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>
                  );
                })
              ) : (
                NAV_LINKS.map((link, idx) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className="relative px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase text-white/60 hover:text-white transition-colors duration-300 flex items-center justify-center pointer-events-auto"
                  >
                    <span className="relative z-10">{link.name}</span>
                    
                    {hoveredIdx === idx && (
                      <motion.div
                        layoutId="nav-hover-pill"
                        className="absolute inset-0 bg-white/5 border border-white/10 rounded-full -z-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      />
                    )}
                    
                    {pathname === link.href && (
                      <motion.div
                        layoutId="active-dot"
                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-[0_0_10px_#fff,0_0_4px_#fff]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                ))
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-white/70 hover:text-white transition-colors relative z-10 p-1 rounded-full hover:bg-white/5 pointer-events-auto"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5.5 h-5.5" />
            </button>
          </div>
        </motion.div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-[32px] flex flex-col justify-between p-8"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="Sarvanash Logo"
                  width={24}
                  height={24}
                  className="object-contain"
                />
                <span className="text-xl font-black tracking-widest uppercase">Sarvanash</span>
              </div>
              <button
                className="text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-7 h-7" />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center gap-6 my-12">
              {pathname === "/admin" ? (
                adminLinks.map((link, i) => {
                  const active = activeTab === link.tab;
                  return (
                    <motion.div
                      key={link.tab}
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.08, type: "spring", stiffness: 200, damping: 20 }}
                    >
                      <Link
                        href={`/admin?tab=${link.tab}`}
                        scroll={false}
                        onClick={() => setMobileMenuOpen(false)}
                        className={clsx(
                          "text-xl font-bold tracking-widest uppercase transition-colors duration-300",
                          active ? "text-white text-glow" : "text-white/40 hover:text-white"
                        )}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  );
                })
              ) : (
                NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.08, type: "spring", stiffness: 200, damping: 20 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={clsx(
                        "text-2xl font-bold tracking-widest uppercase transition-colors duration-300",
                        pathname === link.href ? "text-white text-glow" : "text-white/40 hover:text-white"
                      )}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))
              )}
            </div>

            <div className="text-center text-white/20 text-xs tracking-widest uppercase font-semibold">
              © Sarvanash Comics // All rights reserved
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
