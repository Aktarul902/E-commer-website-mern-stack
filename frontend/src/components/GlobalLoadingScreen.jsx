import { useEffect, useState } from "react";

const GlobalLoadingScreen = ({
  loading = true,
  minimumDuration = 900,
}) => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(loading);

  useEffect(() => {
    if (!loading) {
      setProgress(100);

      const timer = setTimeout(() => {
        setVisible(false);
      }, 500);

      return () => clearTimeout(timer);
    }

    setVisible(true);
    setProgress(0);

    let current = 0;

    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 8) + 3;

      if (current >= 92) {
        current = 92;
        clearInterval(interval);
      }

      setProgress(current);
    }, 90);

    const minimumTimer = setTimeout(() => {
      setProgress((prev) =>
        Math.max(prev, 96)
      );
    }, minimumDuration);

    return () => {
      clearInterval(interval);
      clearTimeout(minimumTimer);
    };
  }, [loading, minimumDuration]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-[#07070b] transition-all duration-500 ${
        loading
          ? "opacity-100"
          : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Background glow */}
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[120px] animate-pulse" />

        <div className="absolute left-[15%] top-[20%] h-40 w-40 rounded-full bg-pink-500/10 blur-[80px] animate-[floatOne_7s_ease-in-out_infinite]" />

        <div className="absolute right-[15%] bottom-[20%] h-48 w-48 rounded-full bg-orange-500/10 blur-[90px] animate-[floatTwo_8s_ease-in-out_infinite]" />
      </div>


      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.035]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
            `,
            backgroundSize: "45px 45px",
          }}
        />
      </div>


      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          ["8%", "20%", "0s"],
          ["18%", "70%", "1.5s"],
          ["28%", "35%", "3s"],
          ["76%", "25%", "2s"],
          ["88%", "65%", "4s"],
          ["70%", "82%", "1s"],
          ["45%", "12%", "2.5s"],
          ["55%", "90%", "3.5s"],
        ].map(
          ([left, top, delay], index) => (
            <span
              key={index}
              className="absolute h-1 w-1 rounded-full bg-white/50 animate-[particleFloat_5s_ease-in-out_infinite]"
              style={{
                left,
                top,
                animationDelay: delay,
              }}
            />
          )
        )}
      </div>


      {/* Main content */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center px-8">

        {/* Animated logo */}
        <div className="relative mb-9 flex h-32 w-32 items-center justify-center">

          {/* Outer rotating ring */}
          <div className="absolute inset-0 rounded-full border border-white/10" />

          <div className="absolute inset-[-7px] rounded-full border border-transparent border-t-violet-400 border-r-pink-400 animate-[spin_2.5s_linear_infinite]" />

          {/* Second ring */}
          <div className="absolute inset-[8px] rounded-full border border-transparent border-b-orange-400 border-l-pink-400 animate-[spinReverse_2s_linear_infinite]" />

          {/* Glow */}
          <div className="absolute inset-[22px] rounded-full bg-gradient-to-br from-violet-500 via-pink-500 to-orange-400 opacity-30 blur-xl animate-pulse" />

          {/* Logo container */}
          <div className="relative flex h-[68px] w-[68px] items-center justify-center rounded-[22px] bg-gradient-to-br from-violet-600 via-pink-500 to-orange-400 shadow-[0_0_45px_rgba(168,85,247,0.35)] animate-[logoPulse_2s_ease-in-out_infinite]">

            {/* Printzenz P */}
            <div className="relative h-9 w-9">
              <div className="absolute left-0 top-0 h-9 w-[7px] rounded-full bg-white" />

              <div className="absolute left-[4px] top-0 h-[7px] w-[25px] rounded-full bg-white" />

              <div className="absolute left-[4px] top-[15px] h-[7px] w-[22px] rounded-full bg-white" />

              <div className="absolute right-0 top-0 h-[22px] w-[7px] rounded-full bg-white" />

              <div className="absolute left-[11px] top-[7px] h-[8px] w-[8px] rounded-full bg-gradient-to-br from-violet-600 to-pink-500" />
            </div>
          </div>
        </div>


        {/* Brand */}
        <div className="text-center">

          <h1 className="text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
            Print
            <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              zenz
            </span>
          </h1>

          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-white/20" />

            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/40">
              Wear Your Story
            </p>

            <span className="h-px w-8 bg-gradient-to-l from-transparent to-white/20" />
          </div>
        </div>


        {/* Loading area */}
        <div className="mt-12 w-full">

          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-white/40">
              {progress < 30
                ? "Preparing your experience..."
                : progress < 65
                ? "Loading Printzenz..."
                : progress < 95
                ? "Almost ready..."
                : "Welcome to Printzenz"}
            </span>

            <span className="font-mono text-xs font-semibold text-white/60">
              {progress}%
            </span>
          </div>


          {/* Progress track */}
          <div className="relative h-[5px] overflow-hidden rounded-full bg-white/[0.08]">

            {/* Glow */}
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 via-pink-500 to-orange-400 blur-[6px] opacity-70 transition-all duration-300"
              style={{
                width: `${progress}%`,
              }}
            />

            {/* Main bar */}
            <div
              className="relative h-full rounded-full bg-gradient-to-r from-violet-500 via-pink-500 to-orange-400 transition-all duration-300"
              style={{
                width: `${progress}%`,
              }}
            />

            {/* Moving shine */}
            <div className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[loadingShine_1.5s_linear_infinite]" />
          </div>
        </div>


        {/* Bottom message */}
        <div className="mt-8 flex items-center gap-2 text-[11px] text-white/25">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-50" />

            <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" />
          </span>

          Crafted with creativity
        </div>
      </div>


      {/* Corner decorations */}
      <div className="absolute left-6 top-6 h-12 w-12 border-l border-t border-white/10" />

      <div className="absolute right-6 top-6 h-12 w-12 border-r border-t border-white/10" />

      <div className="absolute bottom-6 left-6 h-12 w-12 border-b border-l border-white/10" />

      <div className="absolute bottom-6 right-6 h-12 w-12 border-b border-r border-white/10" />
    </div>
  );
};

export default GlobalLoadingScreen;