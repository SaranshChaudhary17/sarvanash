"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle, AlertCircle } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setError("All frequency coordinates must be fully supplied.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (res.ok) {
        setSuccess(true);
        setName("");
        setEmail("");
        setMessage("");
      } else {
        const errJson = await res.json();
        setError(errJson.error || "Failed to establish uplink with server.");
      }
    } catch (err) {
      setError("Network offline. Transmission failed to initialize.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-24 relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ff3300]/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-6">Transmit</h1>
            <p className="text-white/50 text-lg">Send a secure transmission to our servers. We usually respond within 24 standard cycles.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-panel p-8 md:p-12 rounded-2xl border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 space-y-6 flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 bg-green-950/20 border border-green-500/30 rounded-full flex items-center justify-center text-green-400">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black uppercase text-white tracking-wider">Transmission Successful</h3>
                <p className="text-white/50 text-sm max-w-sm leading-relaxed">
                  Your transmission data has been successfully securely written to our primary database core.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-6 py-2.5 border border-white/10 hover:border-white/20 text-xs font-bold uppercase tracking-wider rounded-lg pointer-events-auto transition-colors"
                >
                  Send another transmission
                </button>
              </motion.div>
            ) : (
              <form className="space-y-8" onSubmit={handleSubmit}>
                {error && (
                  <div className="p-4 bg-red-950/20 border border-red-500/10 text-red-400 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-widest uppercase text-white/50">Call Sign (Name)</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff3300]/50 focus:bg-white/10 transition-colors"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-widest uppercase text-white/50">Frequency (Email)</label>
                    <input 
                      type="email" 
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff3300]/50 focus:bg-white/10 transition-colors"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-widest uppercase text-white/50">Transmission Data (Message)</label>
                  <textarea 
                    rows={6}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff3300]/50 focus:bg-white/10 transition-colors resize-none"
                    placeholder="What is your message?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={submitting}
                  className="w-full group relative py-4 bg-white text-black font-bold uppercase tracking-widest rounded-lg overflow-hidden flex items-center justify-center gap-2 disabled:opacity-50 pointer-events-auto"
                >
                  <div className="absolute inset-0 bg-[#ff3300] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors duration-300">
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-black group-hover:border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    {submitting ? "Initializing Transfer..." : "Initialize Transfer"}
                  </span>
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
