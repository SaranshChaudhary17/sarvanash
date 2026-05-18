"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Mail, Lock, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

type Particle = {
  id: number;
  x: number;
  y: number;
  scale: number;
  speedY: number;
  speedX: number;
  opacity: number;
};

export default function LoginPage() {
  const router = useRouter();
  
  // Fields & UI state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState<string | null>(null);
  
  // Login Process stages: "idle" | "verifying" | "success" | "denied"
  const [loginStatus, setLoginStatus] = useState<"idle" | "verifying" | "success" | "denied">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  
  // Dynamic spotlight tracker
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spotlightX = useSpring(mouseX, { stiffness: 40, damping: 25 });
  const spotlightY = useSpring(mouseY, { stiffness: 40, damping: 25 });

  // 3D Parallax Tilt variables
  const tiltX = useSpring(useTransform(mouseY, [0, 1000], [4, -4]), { stiffness: 60, damping: 20 });
  const tiltY = useSpring(useTransform(mouseX, [0, 1920], [-4, 4]), { stiffness: 60, damping: 20 });

  // Particle list
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate cinematic ember particles
    const list = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100 + 100,
      scale: Math.random() * 2 + 1,
      speedY: -(Math.random() * 0.4 + 0.2),
      speedX: Math.random() * 0.3 - 0.15,
      opacity: Math.random() * 0.5 + 0.3,
    }));
    setParticles(list);

    // Dynamic mouse move handler for parallax and spotlight
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Particle updates
  useEffect(() => {
    if (particles.length === 0) return;
    
    let frameId: number;
    const update = () => {
      setParticles((prev) =>
        prev.map((p) => {
          let nextY = p.y + p.speedY;
          let nextX = p.x + p.speedX;
          let nextOpacity = p.opacity;

          if (nextY < -10) {
            nextY = 110;
            nextX = Math.random() * 100;
            nextOpacity = Math.random() * 0.5 + 0.3;
          }
          return { ...p, y: nextY, x: nextX, opacity: nextOpacity };
        })
      );
      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [particles.length]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLoginStatus("denied");
      setErrorMessage("FILL OUT ALL AUTHORIZATION KEYS.");
      setTimeout(() => {
        setLoginStatus("idle");
        setErrorMessage("");
      }, 3000);
      return;
    }

    setLoginStatus("verifying");
    
    try {
      // 1. Authenticate with Firebase Client SDK
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 2. Retrieve secure cryptographic ID Token
      const idToken = await user.getIdToken();

      // 3. Post to Next.js server API to verify and set secure HttpOnly Session Cookie
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (res.ok) {
        // Success Sequence
        setTimeout(() => {
          setLoginStatus("success");
          setTimeout(() => {
            router.push("/admin");
          }, 1500);
        }, 1000);
      } else {
        const err = await res.json();
        setLoginStatus("denied");
        setErrorMessage(err.error || "DECRYPT ERROR: ACCESS KEY FAILED.");
        setTimeout(() => {
          setLoginStatus("idle");
          setErrorMessage("");
        }, 3000);
      }
    } catch (error: any) {
      setLoginStatus("denied");
      // Map common Firebase Auth error codes to cinematic operator alerts
      if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
        setErrorMessage("CIPHER ERROR: ACCESS CODES REJECTED.");
      } else if (error.code === "auth/invalid-email") {
        setErrorMessage("OPERATOR FORMAT NOT MATCHED.");
      } else {
        setErrorMessage("CONNECTION ERROR: SECURITY ACCESS OFFLINE.");
      }
      setTimeout(() => {
        setLoginStatus("idle");
        setErrorMessage("");
      }, 3000);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden flex items-center justify-start md:px-12 lg:px-24 select-none font-sans">
      
      {/* 1. Global Fade In Mask */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="fixed inset-0 bg-black z-50 pointer-events-none"
      />

      {/* 2. Fullscreen Background Image with slight dynamic zoom */}
      <motion.div 
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.8 }}
        transition={{ duration: 2.5, ease: "easeOut" }}
        className="absolute inset-0 z-0 w-full h-full"
      >
        <Image
          src="/login.jpeg"
          alt="Sarvansh Universe Archives"
          fill
          className="object-cover object-right"
          priority
          unoptimized
        />
        {/* Dynamic vignette and cinematic dark styling overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/70" />
      </motion.div>

      {/* 3. Floating Amber Particles System */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-gradient-to-t from-[#ff5a1f] to-[#ff3b30]"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.scale}px`,
              height: `${p.scale}px`,
              opacity: p.opacity,
              filter: "blur(0.5px) drop-shadow(0 0 4px #ff5a1f)",
              transition: "transform 0.1s linear",
            }}
          />
        ))}
      </div>

      {/* 4. Mouse-tracking Dynamic Spotlight Glow */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full bg-[#ff5a1f]/[0.03] blur-[150px] pointer-events-none z-10 hidden md:block"
        style={{
          x: useTransform(spotlightX, (x) => x - 300),
          y: useTransform(spotlightY, (y) => y - 300),
        }}
      />

      {/* 5. Dystopian Scanline Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none bg-scanlines opacity-[0.03]" />

      {/* 6. Immersive Floating Glassmorphism Login Panel */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }}
        className="relative z-30 w-full max-w-[430px] rounded-3xl border border-[#ff5a1f]/20 bg-black/65 backdrop-blur-xl p-8 md:p-10 shadow-[0_0_50px_rgba(255,90,31,0.08)] flex flex-col gap-6 overflow-hidden select-text"
      >
        {/* Soft Breathing Pulsing Border Highlight */}
        <div className="absolute inset-0 rounded-3xl border border-[#ff5a1f]/40 opacity-40 animate-[pulse_4s_infinite_ease-in-out]" />

        {/* Faint Noise Texture Background */}
        <div className="absolute inset-0 bg-[#111] opacity-[0.02] pointer-events-none mix-blend-overlay" />

        {/* Dynamic Loading verification progress line */}
        {loginStatus === "verifying" && (
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff5a1f] to-[#ff3b30] origin-left"
          />
        )}

        {/* Logo Section */}
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: loginStatus === "verifying" ? 360 : 0
            }}
            transition={{ 
              scale: { repeat: Infinity, duration: 4, ease: "easeInOut" },
              rotate: { duration: 2, ease: "linear", repeat: loginStatus === "verifying" ? Infinity : 0 }
            }}
            className="relative w-16 h-16 flex items-center justify-center pointer-events-none"
          >
            {/* Hexagon shape outer border */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-[#ff5a1f] drop-shadow-[0_0_8px_#ff5a1f]">
              <polygon 
                points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="4"
              />
            </svg>
            <span className="text-2xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">S</span>
          </motion.div>

          <h3 className="text-[10px] tracking-[0.3em] font-extrabold text-[#ff5a1f] uppercase mt-2">Sarvansh System</h3>
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        {/* Title Section */}
        <div className="text-center space-y-2">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-3xl font-black tracking-tight text-white uppercase font-sans border-b border-white/5 pb-2"
          >
            Admin Access
          </motion.h1>
          <p className="text-[11px] text-white/40 tracking-wider">
            Enter the archive control system keys.
          </p>
        </div>

        {/* Glitch error notification screen */}
        <AnimatePresence>
          {loginStatus === "denied" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-3 bg-red-950/30 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold font-mono tracking-wide uppercase select-none"
            >
              <ShieldAlert className="w-4 h-4 flex-shrink-0 animate-bounce" />
              <span className="animate-[pulse_1.5s_infinite]">{errorMessage}</span>
            </motion.div>
          )}

          {loginStatus === "success" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-3 bg-green-950/30 border border-green-500/20 rounded-xl text-green-400 text-xs font-bold font-mono tracking-wide uppercase select-none"
            >
              <Sparkles className="w-4 h-4 flex-shrink-0 animate-pulse text-green-400" />
              <span>Authorization Keys Verified. Access Granted.</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inputs and CTA Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-5">
          {/* Email Input Container */}
          <div className="space-y-1 relative">
            <label className="text-[9px] font-bold tracking-widest uppercase text-white/30 ml-1">Operator Email</label>
            <div className="relative flex items-center">
              <Mail className={`absolute left-4 w-4 h-4 transition-colors duration-300 ${
                isFocused === "email" ? "text-[#ff5a1f]" : "text-white/30"
              }`} />
              <input
                type="email"
                disabled={loginStatus === "verifying" || loginStatus === "success"}
                placeholder="operator@sarvanash.com"
                value={email}
                onFocus={() => setIsFocused("email")}
                onBlur={() => setIsFocused(null)}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#ff5a1f]/50 transition-all font-mono tracking-wide"
              />
              {/* Focus bottom line animation expanding left -> right */}
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isFocused === "email" ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                className="absolute bottom-0 left-4 right-4 h-[1.5px] bg-[#ff5a1f] origin-left"
              />
            </div>
          </div>

          {/* Password Input Container */}
          <div className="space-y-1 relative">
            <label className="text-[9px] font-bold tracking-widest uppercase text-white/30 ml-1">Decryption Cipher</label>
            <div className="relative flex items-center">
              <Lock className={`absolute left-4 w-4 h-4 transition-colors duration-300 ${
                isFocused === "password" ? "text-[#ff5a1f]" : "text-white/30"
              }`} />
              <input
                type="password"
                disabled={loginStatus === "verifying" || loginStatus === "success"}
                placeholder="••••••••••••"
                value={password}
                onFocus={() => setIsFocused("password")}
                onBlur={() => setIsFocused(null)}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#ff5a1f]/50 transition-all font-mono tracking-widest"
              />
              {/* Focus bottom line animation expanding left -> right */}
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isFocused === "password" ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                className="absolute bottom-0 left-4 right-4 h-[1.5px] bg-[#ff5a1f] origin-left"
              />
            </div>
          </div>

          {/* Submit Action Button */}
          <motion.button
            type="submit"
            disabled={loginStatus === "verifying" || loginStatus === "success"}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileTap={{ scale: 0.98 }}
            className={`w-full relative py-4 mt-2 bg-gradient-to-r from-[#ff5a1f] to-[#ff3b30] hover:from-[#ff6b35] hover:to-[#ff4c42] rounded-xl text-xs font-black uppercase tracking-[0.2em] text-white flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(255,90,31,0.3)] transition-all duration-300 overflow-hidden pointer-events-auto cursor-pointer ${
              loginStatus === "verifying" ? "opacity-70 pointer-events-none" : ""
            }`}
          >
            {/* Sliding Gloss Sweep overlay effect */}
            <motion.div
              animate={isHovered ? { x: ["-100%", "200%"] } : {}}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
            />
            
            {loginStatus === "idle" && (
              <>
                <span>Enter System</span>
                <motion.div
                  animate={{ x: isHovered ? 4 : 0 }}
                  transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.5 }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </>
            )}

            {loginStatus === "verifying" && (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <span>Verifying credentials...</span>
              </>
            )}

            {loginStatus === "success" && (
              <span>Decrypt Success...</span>
            )}

            {loginStatus === "denied" && (
              <span>Access Denied</span>
            )}
          </motion.button>
        </form>

        {/* Subtle decorative futuristic sub-labels */}
        <div className="flex items-center justify-between text-[8px] font-mono text-white/20 uppercase tracking-widest pt-2 border-t border-white/5">
          <span>Sys.v13.06</span>
          <span>Secured Terminal</span>
        </div>
      </motion.div>
    </div>
  );
}
