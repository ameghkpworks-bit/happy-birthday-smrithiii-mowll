import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import fireAudioUrl from "../assets/fire.mp3";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Happy Birthday, My Love" },
      {
        name: "description",
        content:
          "A night by the sea, under the moon, with fireworks just for you.",
      },
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
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    hue: number;
  }[];
};

function Index() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Page is visible immediately — no button required
  const [revealed] = useState(true);
  const [message, setMessage] = useState("");

  const fullMessage = HEADLINE;

  // --------------------------------------------------
  // Birthday message typing animation
  // --------------------------------------------------
  useEffect(() => {
    let i = 0;

    const id = setInterval(() => {
      i++;

      setMessage(fullMessage.slice(0, i));

      if (i >= fullMessage.length) {
        clearInterval(id);
      }
    }, 55);

    return () => clearInterval(id);
  }, [fullMessage]);

  // --------------------------------------------------
  // MUSIC
  //
  // Try autoplay immediately.
  //
  // Safari/iPhone may block autoplay until the user
  // interacts with the page. In that case, the first
  // tap/click anywhere starts the music.
  // --------------------------------------------------
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.loop = true;

    const startAudio = async () => {
      try {
        await audio.play();

        // Music successfully started.
        // Remove the fallback listeners.
        window.removeEventListener("pointerdown", startAudio);
        window.removeEventListener("touchstart", startAudio);
        window.removeEventListener("click", startAudio);
      } catch {
        // Browser blocked autoplay.
        // The listeners above will try again after
        // the user's first interaction.
      }
    };

    // Try to start automatically.
    startAudio();

    // Safari / iPhone fallback.
    window.addEventListener("pointerdown", startAudio);
    window.addEventListener("touchstart", startAudio);
    window.addEventListener("click", startAudio);

    return () => {
      window.removeEventListener("pointerdown", startAudio);
      window.removeEventListener("touchstart", startAudio);
      window.removeEventListener("click", startAudio);
    };
  }, []);

  // --------------------------------------------------
  // Stars, moon, sea and fireworks animation
  // --------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    let raf = 0;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    // --------------------------------------------------
    // Stars
    // --------------------------------------------------
    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h * 0.6,
      r: Math.random() * 1.4 + 0.2,
      tw: Math.random() * Math.PI * 2,
    }));

    // --------------------------------------------------
    // Fireworks
    // --------------------------------------------------
    const fireworks: Firework[] = [];

    const rockets: {
      x: number;
      y: number;
      vy: number;
      tx: number;
      ty: number;
      hue: number;
    }[] = [];

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
    };

    const explode = (x: number, y: number, hue: number) => {
      const particles = [];

      const count = 90 + Math.floor(Math.random() * 40);

      for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 * i) / count;
        const speed = 2 + Math.random() * 4;

        particles.push({
          x,
          y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          life: 1,
          hue: hue + Math.random() * 30 - 15,
        });
      }

      fireworks.push({ particles });
    };

    let lastLaunch = 0;

    // --------------------------------------------------
    // Click / tap anywhere = launch a firework
    // --------------------------------------------------
    const onClick = (e: MouseEvent) => {
      launch(e.clientX, e.clientY);
    };

    canvas.addEventListener("click", onClick);

    // --------------------------------------------------
    // Resize
    // --------------------------------------------------
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", onResize);

    // --------------------------------------------------
    // Main animation
    // --------------------------------------------------
    const render = (t: number) => {
      // --------------------------------------------------
      // Night gradient
      // --------------------------------------------------
      const sky = ctx.createLinearGradient(0, 0, 0, h);

      sky.addColorStop(0, "#05060f");
      sky.addColorStop(0.55, "#0a1a3a");
      sky.addColorStop(0.7, "#13315c");
      sky.addColorStop(1, "#020410");

      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // --------------------------------------------------
      // Stars
      // --------------------------------------------------
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

      // --------------------------------------------------
      // Moon
      // --------------------------------------------------
      const moonX = w * 0.78;
      const moonY = h * 0.22;
      const moonR = Math.min(w, h) * 0.09;

      const glow = ctx.createRadialGradient(
        moonX,
        moonY,
        moonR * 0.5,
        moonX,
        moonY,
        moonR * 4,
      );

      glow.addColorStop(0, "rgba(255,240,200,0.35)");
      glow.addColorStop(1, "rgba(255,240,200,0)");

      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      const moonGrad = ctx.createRadialGradient(
        moonX - moonR * 0.3,
        moonY - moonR * 0.3,
        moonR * 0.2,
        moonX,
        moonY,
        moonR,
      );

      moonGrad.addColorStop(0, "#fff8e0");
      moonGrad.addColorStop(1, "#d8c98a");

      ctx.fillStyle = moonGrad;

      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fill();

      // --------------------------------------------------
      // Moon craters
      // --------------------------------------------------
      ctx.fillStyle = "rgba(120,100,60,0.25)";

      [
        [0.3, 0.1, 0.18],
        [-0.2, 0.3, 0.12],
        [0.1, -0.3, 0.1],
        [-0.35, -0.1, 0.08],
      ].forEach(([dx, dy, r]) => {
        ctx.beginPath();

        ctx.arc(
          moonX + dx * moonR,
          moonY + dy * moonR,
          r * moonR,
          0,
          Math.PI * 2,
        );

        ctx.fill();
      });

      // --------------------------------------------------
      // Sea
      // --------------------------------------------------
      const seaY = h * 0.65;

      const seaGrad = ctx.createLinearGradient(0, seaY, 0, h);

      seaGrad.addColorStop(0, "#0a1f3a");
      seaGrad.addColorStop(1, "#01030a");

      ctx.fillStyle = seaGrad;
      ctx.fillRect(0, seaY, w, h - seaY);

      // --------------------------------------------------
      // Moon reflection on sea
      // --------------------------------------------------
      for (let i = 0; i < 25; i++) {
        const y = seaY + (i * (h - seaY)) / 25;

        const width = moonR * (1 + i * 0.15);

        const offset = Math.sin(t * 0.002 + i * 0.5) * 6;

        ctx.fillStyle = `rgba(255,240,200,${0.18 * (1 - i / 25)})`;

        ctx.fillRect(
          moonX - width / 2 + offset,
          y,
          width,
          2,
        );
      }

      // --------------------------------------------------
      // Sea wave highlights
      // --------------------------------------------------
      ctx.strokeStyle = "rgba(180,200,230,0.15)";
      ctx.lineWidth = 1;

      for (let i = 0; i < 6; i++) {
        ctx.beginPath();

        const y = seaY + 10 + i * 18;

        for (let x = 0; x <= w; x += 12) {
          const yy =
            y + Math.sin((x + t * 0.05) * 0.02 + i) * 2;

          if (x === 0) {
            ctx.moveTo(x, yy);
          } else {
            ctx.lineTo(x, yy);
          }
        }

        ctx.stroke();
      }

      // --------------------------------------------------
      // Little ship sailing across the horizon
      // --------------------------------------------------
      const shipPeriod = 28000;

      const shipProgress = (t % shipPeriod) / shipPeriod;

      const shipX = -60 + shipProgress * (w + 120);

      const shipY =
        seaY + 18 + Math.sin(t * 0.0015) * 2;

      const bob = Math.sin(t * 0.003) * 1.5;

      ctx.save();

      ctx.translate(shipX, shipY + bob);

      // Hull
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

      // Mast
      ctx.strokeStyle = "#2a1a10";
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -22);
      ctx.stroke();

      // Sail
      const sailGrad = ctx.createLinearGradient(
        0,
        -22,
        0,
        0,
      );

      sailGrad.addColorStop(
        0,
        "rgba(255,248,224,0.95)",
      );

      sailGrad.addColorStop(
        1,
        "rgba(220,200,160,0.85)",
      );

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

      // Tiny warm lantern glow
      const lantern = ctx.createRadialGradient(
        0,
        2,
        0,
        0,
        2,
        14,
      );

      lantern.addColorStop(
        0,
        "rgba(255,180,90,0.7)",
      );

      lantern.addColorStop(
        1,
        "rgba(255,180,90,0)",
      );

      ctx.fillStyle = lantern;
      ctx.fillRect(-14, -6, 28, 14);

      // Her name above the sail
      ctx.font = "italic 600 13px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,240,200,0.95)";
      ctx.shadowColor = "rgba(255,200,120,0.8)";
      ctx.shadowBlur = 10;

      ctx.fillText(HER_NAME, 0, -30);

      ctx.shadowBlur = 0;

      ctx.restore();

      // --------------------------------------------------
      // Automatic fireworks
      // --------------------------------------------------
      if (t - lastLaunch > 800) {
        launch();

        if (Math.random() > 0.5) {
          launch();
        }

        lastLaunch = t;
      }

      // --------------------------------------------------
      // Rockets
      // --------------------------------------------------
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];

        r.x += (r.tx - r.x) * 0.04;
        r.y += r.vy;
        r.vy += 0.12;

        ctx.fillStyle = `hsl(${r.hue},100%,75%)`;

        ctx.beginPath();
        ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
        ctx.fill();

        // Trail
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

      // --------------------------------------------------
      // Fireworks particles
      // --------------------------------------------------
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

        if (fw.particles[0].life <= 0) {
          fireworks.splice(i, 1);
        }
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);

      canvas.removeEventListener("click", onClick);

      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black font-serif text-white">
      {/* --------------------------------------------------
          Birthday music
          -------------------------------------------------- */}
      <audio
        ref={audioRef}
        src={fireAudioUrl}
        loop
        preload="auto"
        playsInline
      />

      {/* --------------------------------------------------
          Background animation
          -------------------------------------------------- */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
      />

      {/* --------------------------------------------------
          Birthday content
          Shows automatically — no button
          -------------------------------------------------- */}
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

          {/* Signature */}
          <p className="mt-8 text-xs italic tracking-wider text-white/60">
            — {YOUR_NAME}
          </p>

          {/* Instruction */}
          <p className="mt-10 text-[10px] tracking-[0.4em] text-white/40">
            TAP ANYWHERE TO LIGHT THE SKY
          </p>
        </div>
      )}
    </main>
  );
}
