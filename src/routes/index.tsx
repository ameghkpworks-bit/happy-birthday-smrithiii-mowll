import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Happy Birthday, My Love" },
      { name: "description", content: "A night by the sea, under the moon, with fireworks just for you." },
    ],
  }),
  component: Index,
});

// 💖 Edit these to personalize your gift
const HER_NAME = "Smrithiiiiiiiiiii";
const YOUR_NAME = "Yours, forever";
const HEADLINE = "Happy Birthday, my moon, my sea, my every spark.";



type Firework = {
  particles: {
    x: number; y: number; vx: number; vy: number; life: number; hue: number;
  }[];
};

function Index() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);
  const fireAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlockedRef = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const [message, setMessage] = useState("");
  const [signatureShown, setSignatureShown] = useState(false);
  const fullMessage = HEADLINE;

  // Mobile browsers (iOS Safari especially) only allow audio to start as a
  // *direct, synchronous* result of a user tap/click. This unlocks both the
  // Web Audio context (for the whoosh/boom effects) and the fire.mp3
  // ambience the first time the person interacts with the page.
  const unlockAudio = () => {
    // Web Audio context for the synthesized whoosh/boom
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new Ctx();
      audioCtxRef.current = ctx;
      const bufferSize = ctx.sampleRate * 0.6;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      noiseBufferRef.current = buffer;

      // Play a silent blip immediately — this is the classic iOS "unlock"
      // trick that gets the context out of the suspended state reliably.
      const silence = ctx.createBuffer(1, 1, ctx.sampleRate);
      const src = ctx.createBufferSource();
      src.buffer = silence;
      src.connect(ctx.destination);
      src.start(0);
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }

    // The uploaded fire.mp3 ambience
    const audioEl = fireAudioRef.current;
    if (audioEl && audioUnlockedRef.current === false) {
      audioUnlockedRef.current = true;
      audioEl.volume = 0.4;
      const p = audioEl.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }

    return audioCtxRef.current;
  };

  // Belt-and-suspenders: some mobile browsers deliver the first tap as a
  // touch/pointer event before (or instead of) a synthetic click, so listen
  // once at the document level too, in addition to the explicit handlers
  // on the button and canvas below.
  useEffect(() => {
    const unlockOnce = () => {
      unlockAudio();
    };
    document.addEventListener("pointerdown", unlockOnce, { once: true, capture: true });
    document.addEventListener("touchend", unlockOnce, { once: true, capture: true });
    return () => {
      document.removeEventListener("pointerdown", unlockOnce, { capture: true } as any);
      document.removeEventListener("touchend", unlockOnce, { capture: true } as any);
    };
  }, []);


  useEffect(() => {
    if (!revealed) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setMessage(fullMessage.slice(0, i));
      if (i >= fullMessage.length) {
        clearInterval(id);
        setTimeout(() => setSignatureShown(true), 700);
      }
    }, 55);
    return () => clearInterval(id);
  }, [revealed, fullMessage]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h * 0.6,
      r: Math.random() * 1.4 + 0.2,
      tw: Math.random() * Math.PI * 2,
    }));

    const fireworks: Firework[] = [];
    const rockets: { x: number; y: number; vy: number; tx: number; ty: number; hue: number }[] = [];

    // short rising "whoosh" as a rocket launches
    const playWhoosh = () => {
      const ctx = audioCtxRef.current;
      if (!ctx || !noiseBufferRef.current) return;
      const now = ctx.currentTime;
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBufferRef.current;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.exponentialRampToValueAtTime(3200, now + 0.5);
      filter.Q.value = 0.9;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.06, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      noise.connect(filter).connect(gain).connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.55);
    };

    // deep crackling "boom" as a firework bursts
    const playBoom = () => {
      const ctx = audioCtxRef.current;
      if (!ctx || !noiseBufferRef.current) return;
      const now = ctx.currentTime;

      // crackle
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBufferRef.current;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.value = 1600 + Math.random() * 1000;
      noiseFilter.Q.value = 0.6;
      const noiseGain = ctx.createGain();
      const crackleLevel = 0.18 + Math.random() * 0.08;
      noiseGain.gain.setValueAtTime(crackleLevel, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6 + Math.random() * 0.3);
      noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 1);

      // low thump
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(130 + Math.random() * 20, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.35);
      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.3, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(oscGain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    };

    const launch = (x?: number, y?: number) => {
      const tx = x ?? Math.random() * w;
      const ty = y ?? h * (0.15 + Math.random() * 0.35);
      rockets.push({
        x: w / 2 + (Math.random() - 0.5) * w * 0.4,
        y: h,
        vy: -9 - Math.random() * 3,
        tx,
        ty,
        hue: Math.floor(Math.random() * 360),
      });
      playWhoosh();
    };

    const explode = (x: number, y: number, hue: number) => {
      const particles = [];
      const count = 90 + Math.floor(Math.random() * 40);
      for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 * i) / count;
        const speed = 2 + Math.random() * 4;
        particles.push({
          x, y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          life: 1,
          hue: hue + Math.random() * 30 - 15,
        });
      }
      fireworks.push({ particles });
      playBoom();
    };

    let lastLaunch = 0;
    const onClick = (e: MouseEvent) => {
      unlockAudio();
      launch(e.clientX, e.clientY);
    };
    canvas.addEventListener("click", onClick);
    const onTouch = (e: TouchEvent) => {
      e.preventDefault(); // stop the synthetic click that would double-launch
      unlockAudio();
      const t = e.changedTouches[0];
      if (t) launch(t.clientX, t.clientY);
    };
    canvas.addEventListener("touchend", onTouch, { passive: false });

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const render = (t: number) => {
      // night gradient
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#05060f");
      sky.addColorStop(0.55, "#0a1a3a");
      sky.addColorStop(0.7, "#13315c");
      sky.addColorStop(1, "#020410");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // stars
      stars.forEach((s) => {
        s.tw += 0.02;
        const a = 0.5 + Math.sin(s.tw) * 0.5;
        ctx.globalAlpha = a;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // moon
      const moonX = w * 0.78;
      const moonY = h * 0.22;
      const moonR = Math.min(w, h) * 0.09;
      const glow = ctx.createRadialGradient(moonX, moonY, moonR * 0.5, moonX, moonY, moonR * 4);
      glow.addColorStop(0, "rgba(255,240,200,0.35)");
      glow.addColorStop(1, "rgba(255,240,200,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
      const moonGrad = ctx.createRadialGradient(moonX - moonR * 0.3, moonY - moonR * 0.3, moonR * 0.2, moonX, moonY, moonR);
      moonGrad.addColorStop(0, "#fff8e0");
      moonGrad.addColorStop(1, "#d8c98a");
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fill();
      // moon craters
      ctx.fillStyle = "rgba(120,100,60,0.25)";
      [[0.3,0.1,0.18],[-0.2,0.3,0.12],[0.1,-0.3,0.1],[-0.35,-0.1,0.08]].forEach(([dx,dy,r]) => {
        ctx.beginPath();
        ctx.arc(moonX + dx*moonR, moonY + dy*moonR, r*moonR, 0, Math.PI*2);
        ctx.fill();
      });

      // sea
      const seaY = h * 0.65;
      const seaGrad = ctx.createLinearGradient(0, seaY, 0, h);
      seaGrad.addColorStop(0, "#0a1f3a");
      seaGrad.addColorStop(1, "#01030a");
      ctx.fillStyle = seaGrad;
      ctx.fillRect(0, seaY, w, h - seaY);

      // moon reflection on sea
      for (let i = 0; i < 25; i++) {
        const y = seaY + i * (h - seaY) / 25;
        const width = moonR * (1 + i * 0.15);
        const offset = Math.sin(t * 0.002 + i * 0.5) * 6;
        ctx.fillStyle = `rgba(255,240,200,${0.18 * (1 - i / 25)})`;
        ctx.fillRect(moonX - width / 2 + offset, y, width, 2);
      }

      // sea wave highlights
      ctx.strokeStyle = "rgba(180,200,230,0.15)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        const y = seaY + 10 + i * 18;
        for (let x = 0; x <= w; x += 12) {
          const yy = y + Math.sin((x + t * 0.05) * 0.02 + i) * 2;
          if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
        }
        ctx.stroke();
      }

      // little ship sailing across the horizon, carrying her name
      const shipPeriod = 28000; // ms for one full crossing
      const shipProgress = ((t % shipPeriod) / shipPeriod);
      const shipX = -60 + shipProgress * (w + 120);
      const shipY = seaY + 18 + Math.sin(t * 0.0015) * 2;
      const bob = Math.sin(t * 0.003) * 1.5;
      ctx.save();
      ctx.translate(shipX, shipY + bob);
      // hull
      ctx.fillStyle = "#1a0f08";
      ctx.strokeStyle = "rgba(255,240,200,0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.lineTo(18, 0);
      ctx.lineTo(13, 6);
      ctx.lineTo(-13, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // mast
      ctx.strokeStyle = "#2a1a10";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -22);
      ctx.stroke();
      // sail
      const sailGrad = ctx.createLinearGradient(0, -22, 0, 0);
      sailGrad.addColorStop(0, "rgba(255,248,224,0.95)");
      sailGrad.addColorStop(1, "rgba(220,200,160,0.85)");
      ctx.fillStyle = sailGrad;
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.lineTo(11, -2);
      ctx.lineTo(0, -2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(-9, -2);
      ctx.lineTo(0, -2);
      ctx.closePath();
      ctx.fillStyle = "rgba(255,248,224,0.75)";
      ctx.fill();
      // tiny warm lantern glow
      const lantern = ctx.createRadialGradient(0, 2, 0, 0, 2, 14);
      lantern.addColorStop(0, "rgba(255,180,90,0.7)");
      lantern.addColorStop(1, "rgba(255,180,90,0)");
      ctx.fillStyle = lantern;
      ctx.fillRect(-14, -6, 28, 14);
      // her name floating above the sail
      ctx.font = "italic 600 13px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,240,200,0.95)";
      ctx.shadowColor = "rgba(255,200,120,0.8)";
      ctx.shadowBlur = 10;
      ctx.fillText(HER_NAME, 0, -30);
      ctx.shadowBlur = 0;
      ctx.restore();



      // auto launch
      if (t - lastLaunch > 800) {
        launch();
        if (Math.random() > 0.5) launch();
        lastLaunch = t;
      }

      // rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.x += (r.tx - r.x) * 0.04;
        r.y += r.vy;
        r.vy += 0.12;
        ctx.fillStyle = `hsl(${r.hue},100%,75%)`;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
        ctx.fill();
        // trail
        ctx.strokeStyle = `hsla(${r.hue},100%,75%,0.4)`;
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x, r.y + 12);
        ctx.stroke();
        if (r.y <= r.ty || r.vy >= 0) {
          explode(r.x, r.y, r.hue);
          rockets.splice(i, 1);
        }
      }

      // fireworks
      for (let i = fireworks.length - 1; i >= 0; i--) {
        const fw = fireworks[i];
        fw.particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.05;
          p.vx *= 0.99;
          p.vy *= 0.99;
          p.life -= 0.012;
          ctx.globalAlpha = Math.max(p.life, 0);
          ctx.fillStyle = `hsl(${p.hue},100%,65%)`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
        if (fw.particles[0].life <= 0) fireworks.splice(i, 1);
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("touchend", onTouch);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black font-serif text-white">
      <audio
        ref={fireAudioRef}
        src={`${import.meta.env.BASE_URL}fire.mp3`}
        loop
        playsInline
        preload="auto"
        style={{ display: "none" }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {!revealed && (
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-24">
          <button
            onClick={() => {
              unlockAudio();
              setRevealed(true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              unlockAudio();
              setRevealed(true);
            }}
            className="pointer-events-auto rounded-full border border-white/30 bg-white/5 px-8 py-3 text-sm tracking-[0.3em] backdrop-blur-md transition hover:bg-white/15"
          >
            Open the Gift
          </button>
        </div>
      )}

      {revealed && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <p className="mb-3 text-xs tracking-[0.5em] text-white/60">
            FOR {HER_NAME.toUpperCase()}
          </p>
          <h1 className="max-w-2xl text-3xl font-light leading-tight md:text-5xl">
            {message}
            {message.length < fullMessage.length && (
              <span className="ml-1 inline-block h-[1em] w-[2px] animate-pulse bg-white align-middle" />
            )}
          </h1>

          {signatureShown && (
            <div className="mt-8 animate-fade-in">
              <p className="mt-6 text-xs italic tracking-wider text-white/60">— {YOUR_NAME}</p>
            </div>
          )}

          <p className="mt-10 text-[10px] tracking-[0.4em] text-white/40">
            CLICK ANYWHERE TO LIGHT THE SKY
          </p>
        </div>
      )}

    </main>
  );
}
