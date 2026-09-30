import { useEffect, useState } from "react";
import { Link } from "react-router";

const Maintenance = () => {
  const [storeStatus, setStoreStatus] = useState(null);

  const API_URL =
    import.meta.env.VITE_API_URL || "/api";

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/store/status`);

        if (!response.ok) return;

        const data = await response.json();

        setStoreStatus(data);
      } catch (error) {
        console.error("Maintenance status error:", error);
      }
    };

    checkStatus();

    /*
     * Check every 30 seconds.
     *
     * This means when admin turns maintenance OFF,
     * customers don't have to manually refresh forever.
     */
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, [API_URL]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />

      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-2xl text-center">
        {/* Logo */}
        <div className="mb-10 flex justify-center">
          <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
            <span className="text-4xl">🛠️</span>
          </div>
        </div>

        {/* Status */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-300 text-sm font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />

          Temporarily unavailable
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6">
          {storeStatus?.maintenanceTitle || "We'll be back soon!"}
        </h1>

        {/* Message */}
        <p className="text-lg md:text-xl text-slate-300 max-w-xl mx-auto leading-relaxed">
          {storeStatus?.maintenanceMessage ||
            "We're currently performing some maintenance to make Printzenz even better."}
        </p>

        {/* Animated loader */}
        <div className="mt-10 flex justify-center">
          <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-3 h-3 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-3 h-3 rounded-full bg-purple-400 animate-bounce" />
          </div>
        </div>

        {/* Footer */}
        <p className="mt-12 text-sm text-slate-500">
          Thank you for your patience.
        </p>

        {/* Optional admin link */}
        <div className="mt-8">
          <Link
            to="/admin"
            className="text-xs text-slate-600 hover:text-slate-400 transition"
          >
            Admin access
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;