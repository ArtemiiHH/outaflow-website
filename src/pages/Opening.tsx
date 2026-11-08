import { useEffect, useRef } from "react";
import Signup from "../components/Signup";
import ChromaticWaves from "../components/ChromaticWaves";

export default function Opening() {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    document.title = "outaflow | Opening soon";
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      if (!video.current) return;
      if (preference.matches) video.current.pause();
      else void video.current.play().catch(() => {});
    };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  return (
    <div className="opening opening-minimal">
      <ChromaticWaves />
      <main id="main" className="opening-main">
        <video
          ref={video}
          className="opening-video"
          src="/videos/outaflow-logo-animation.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label="Animated outaflow logo"
        />
        <h1>OPENING SOON</h1>
        <Signup minimal />
      </main>
    </div>
  );
}
