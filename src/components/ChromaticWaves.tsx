"use client";

// Chromatic Waves — Originkit. Adapted from the supplied two-pass OGL effect.
import { useEffect, useRef, type CSSProperties } from "react";
import { Renderer, Mesh, Plane, Program, RenderTarget } from "ogl";

const vertex = `#version 300 es
in vec2 uv;
in vec2 position;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0., 1.);
}`;

const perlinFragment = `#version 300 es
precision mediump float;
uniform float uFrequency;
uniform float uTime;
uniform float uSpeed;
uniform vec2 uResolution;
in vec2 vUv;
out vec4 fragColor;
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 uv = (vUv - 0.5) * vec2(aspect, 1.0) + 0.5;
  float hue = abs(snoise(vec3(uv * uFrequency, uTime * uSpeed)));
  fragColor = vec4(hsv2rgb(vec3(hue, 1.0, 1.0)), 1.0);
}`;

const dotFragment = `#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform sampler2D uTexture;
uniform int uPaletteCount;
uniform vec3 uPalette[10];
uniform float uPaletteAlpha[10];
uniform float uCellSize;
uniform float uGamma;
uniform float uPaletteBias;
out vec4 fragColor;
void main() {
  vec2 pix = gl_FragCoord.xy;
  float cell = max(uCellSize, 1.0);
  vec2 cellIdx = floor(pix / cell);
  vec2 cellCenter = (cellIdx + 0.5) * cell;
  vec3 col = texture(uTexture, cellCenter / uResolution.xy).rgb;
  float gray = 0.3 * col.r + 0.59 * col.g + 0.11 * col.b;
  gray = pow(clamp(gray, 0.0001, 1.0), uGamma);
  vec2 cellUV = fract(pix / cell) - 0.5;
  float dist = length(cellUV);
  float radius = clamp(gray + uPaletteBias, 0.0, 1.0) * 0.5;
  float aa = fwidth(dist) + 1e-4;
  float mark = 1.0 - smoothstep(radius - aa, radius + aa, dist);
  float g2 = clamp(gray + uPaletteBias, 0.0, 1.0);
  int cnt = max(uPaletteCount, 1);
  vec3 dotCol;
  float dotOpacity;
  if (cnt <= 1) {
    dotCol = uPalette[0]; dotOpacity = uPaletteAlpha[0];
  } else {
    float scaled = g2 * float(cnt - 1);
    int seg = clamp(int(floor(scaled)), 0, cnt - 2);
    float f = clamp(scaled - float(seg), 0.0, 1.0);
    dotCol = mix(uPalette[seg], uPalette[seg+1], f);
    dotOpacity = mix(uPaletteAlpha[seg], uPaletteAlpha[seg+1], f);
  }
  fragColor = vec4(dotCol, mark * dotOpacity);
}`;

interface ChromaticWavesProps {
  frequency?: number;
  speed?: number;
  cellSize?: number;
  gamma?: number;
  paletteBias?: number;
  style?: CSSProperties;
}

export default function ChromaticWaves({
  frequency = 1,
  speed = 1,
  cellSize = 10,
  gamma = 8,
  paletteBias = -2,
  style,
}: ChromaticWavesProps) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = container.current;
    if (!host) return;
    let renderer: Renderer;
    try {
      renderer = new Renderer({
        webgl: 2,
        dpr: Math.min(devicePixelRatio || 1, 2),
        alpha: true,
        premultipliedAlpha: false,
      });
      if (!renderer.isWebgl2) return;
    } catch {
      return; // The black CSS surface remains usable without WebGL.
    }
    const gl = renderer.gl;
    const canvas = gl.canvas as HTMLCanvasElement;
    host.appendChild(canvas);
    const geometry = new Plane(gl, { width: 2, height: 2 });
    const target = new RenderTarget(gl, { depth: false });
    const noise = new Program(gl, {
      vertex,
      fragment: perlinFragment,
      uniforms: {
        uTime: { value: 0 },
        uFrequency: { value: 0.3 + ((frequency - 1) / 9) * 5.7 },
        uSpeed: { value: speed * 0.05 },
        uResolution: { value: [1, 1] },
      },
    });
    const dots = new Program(gl, {
      vertex,
      fragment: dotFragment,
      transparent: true,
      uniforms: {
        uResolution: { value: [1, 1] },
        uTexture: { value: target.texture },
        uPaletteCount: { value: 1 },
        uPalette: { value: Array.from({ length: 10 }, () => [1, 1, 1]) },
        uPaletteAlpha: { value: Array(10).fill(1) },
        uCellSize: { value: 6 + ((cellSize - 1) / 99) * 54 },
        uGamma: { value: 0.5 + ((gamma - 1) / 19) * 7.5 },
        uPaletteBias: { value: paletteBias * 0.05 },
      },
    });
    const noiseMesh = new Mesh(gl, { geometry, program: noise });
    const dotMesh = new Mesh(gl, { geometry, program: dots });
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let previous = 0;
    let elapsed = 0;
    let contextLost = false;
    const draw = () => {
      if (contextLost) return;
      renderer.render({ scene: noiseMesh, target });
      renderer.render({ scene: dotMesh });
    };
    const animate = (time: number) => {
      frame = 0;
      if (preference.matches || document.hidden || contextLost) return;
      if (time - previous >= 1000 / 30) {
        elapsed += previous ? Math.min(time - previous, 100) / 1000 : 0;
        previous = time;
        noise.uniforms.uTime.value = elapsed;
        draw();
      }
      frame = requestAnimationFrame(animate);
    };
    const syncPlayback = () => {
      cancelAnimationFrame(frame);
      previous = 0;
      frame = 0;
      if (!preference.matches && !document.hidden && !contextLost)
        frame = requestAnimationFrame(animate);
      else if (!document.hidden) draw();
    };
    const resize = () => {
      if (contextLost) return;
      renderer.setSize(
        Math.max(1, host.clientWidth),
        Math.max(1, host.clientHeight),
      );
      target.setSize(canvas.width, canvas.height);
      noise.uniforms.uResolution.value = [canvas.width, canvas.height];
      dots.uniforms.uResolution.value = [canvas.width, canvas.height];
      draw();
    };
    const loseContext = () => {
      contextLost = true;
      cancelAnimationFrame(frame);
      canvas.style.visibility = "hidden";
    };
    canvas.addEventListener("webglcontextlost", loseContext);
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    preference.addEventListener("change", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);
    resize();
    syncPlayback();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      preference.removeEventListener("change", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
      canvas.removeEventListener("webglcontextlost", loseContext);
      geometry.remove();
      noise.remove();
      dots.remove();
      gl.deleteFramebuffer(target.buffer);
      gl.deleteTexture(target.texture.texture);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [frequency, speed, cellSize, gamma, paletteBias]);
  return (
    <div
      ref={container}
      className="chromatic-waves"
      style={style}
      aria-hidden="true"
    />
  );
}
