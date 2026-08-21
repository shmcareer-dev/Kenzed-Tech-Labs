"use client";

import { useEffect, useImperativeHandle, useRef } from "react";
import { usePathname } from "next/navigation";
import * as THREE from "three";

import { useKz3D, type KzPage } from "./Kz3DProvider";
import { useKzTheme } from "./KzThemeProvider";

function pathnameToPage(pathname: string): KzPage {
  if (pathname.startsWith("/services")) return "services";
  if (pathname.startsWith("/technology")) return "technology";
  if (pathname.startsWith("/infrastructure")) return "infrastructure";
  if (pathname.startsWith("/process")) return "process";
  if (pathname.startsWith("/about")) return "about";
  if (pathname.startsWith("/contact")) return "contact";
  return "home";
}

export function Kz3DBackground() {
  const { ref } = useKz3D();
  const { theme } = useKzTheme();
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const camRef = useRef<THREE.PerspectiveCamera | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const pgeoRef = useRef<THREE.BufferGeometry | null>(null);
  const pmatRef = useRef<THREE.PointsMaterial | null>(null);
  const lmatRef = useRef<THREE.LineBasicMaterial | null>(null);
  const lgeoRef = useRef<THREE.BufferGeometry | null>(null);
  const linesRef = useRef<THREE.LineSegments | null>(null);
  const mmatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const hmatRef = useRef<THREE.PointsMaterial | null>(null);
  const hazeRef = useRef<THREE.Points | null>(null);
  const smatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const rmatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const satsRef = useRef<THREE.Mesh[]>([]);
  const ring1Ref = useRef<THREE.Mesh | null>(null);
  const ring2Ref = useRef<THREE.Mesh | null>(null);

  const posRef = useRef<Float32Array | null>(null);
  const speedRef = useRef<Float32Array | null>(null);
  const targetRef = useRef<Float32Array | null>(null);
  const targetsRef = useRef<Record<string, Float32Array>>({});
  const NRef = useRef(0);
  const lineFullRef = useRef(0);
  const lineTargetRef = useRef(0);
  const meshSwapRef = useRef<THREE.BufferGeometry | null>(null);
  const meshTargetScaleRef = useRef(1);
  const theme3dRef = useRef<string | null>(null);
  const reducedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const tRef = useRef(0);
  const mxRef = useRef(0);
  const myRef = useRef(0);
  const txRef = useRef(0);
  const tyRef = useRef(0);
  const scrollYRef = useRef(0);
  const ltRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onPmRef = useRef<(e: PointerEvent) => void | undefined>(undefined);

  const isMobile = typeof window !== "undefined" ? window.innerWidth < 940 : false;
  const motion = 1;

  const formation = (page: KzPage) => {
    if (targetsRef.current[page]) return targetsRef.current[page];
    const N = NRef.current;
    const a = new Float32Array(N * 3);
    const R = () => Math.random();
    const G = () => (R() + R() + R() - 1.5) * 2;

    if (page === "services") {
      for (let i = 0; i < N; i++) {
        const c = i % 9;
        let cx = 0,
          cy = 0,
          cz = 0,
          s = 5.6;
        if (c < 8) {
          const an = (c * Math.PI) / 4;
          cx = Math.cos(an) * 22;
          cz = Math.sin(an) * 22;
          cy = Math.sin(an * 2) * 5;
          s = 3.4;
        }
        a[i * 3] = cx + G() * s;
        a[i * 3 + 1] = cy + G() * s;
        a[i * 3 + 2] = cz + G() * s;
      }
    } else if (page === "technology") {
      for (let i = 0; i < N; i++) {
        const L = i % 4;
        const y = -16 + L * 10.7;
        const gx = Math.round((R() - 0.5) * 10) * 4.5;
        const gz = Math.round((R() - 0.5) * 10) * 4.5;
        a[i * 3] = gx + (R() - 0.5) * 1.2;
        a[i * 3 + 1] = y + (R() - 0.5) * 1.2;
        a[i * 3 + 2] = gz + (R() - 0.5) * 1.2;
      }
    } else if (page === "infrastructure") {
      const xs = [-18, -6, 6, 18];
      const zs = [-11, 0, 11];
      for (let i = 0; i < N; i++) {
        const tx = xs[i % 4];
        const tz = zs[(i >> 2) % 3];
        const y = Math.round((R() * 2 - 1) * 5) * 2.9;
        a[i * 3] = tx + (R() - 0.5) * 3.4;
        a[i * 3 + 1] = y + (R() - 0.5) * 0.9;
        a[i * 3 + 2] = tz + (R() - 0.5) * 3.4;
      }
    } else if (page === "process") {
      for (let i = 0; i < N; i++) {
        if (i % 5 < 2) {
          const k = i % 6;
          const tt = k / 5;
          const an = tt * Math.PI * 4;
          a[i * 3] = Math.cos(an) * 17 + G() * 2.2;
          a[i * 3 + 1] = -19 + 38 * tt + G() * 2.2;
          a[i * 3 + 2] = Math.sin(an) * 17 + G() * 2.2;
        } else {
          const tt = R();
          const an = tt * Math.PI * 4;
          a[i * 3] = Math.cos(an) * 17 + (R() - 0.5) * 1.6;
          a[i * 3 + 1] = -19 + 38 * tt;
          a[i * 3 + 2] = Math.sin(an) * 17 + (R() - 0.5) * 1.6;
        }
      }
    } else if (page === "about") {
      for (let i = 0; i < N; i++) {
        const u = R() * Math.PI * 2;
        const v = R() * Math.PI * 2;
        const r = 5 + (R() - 0.5) * 1.4;
        if (i % 2) {
          const cx = (17 + r * Math.cos(v)) * Math.cos(u);
          const cy = (17 + r * Math.cos(v)) * Math.sin(u);
          a[i * 3] = cx - 8.5;
          a[i * 3 + 1] = cy;
          a[i * 3 + 2] = r * Math.sin(v);
        } else {
          const cx = (17 + r * Math.cos(v)) * Math.cos(u);
          const cz = (17 + r * Math.cos(v)) * Math.sin(u);
          a[i * 3] = cx + 8.5;
          a[i * 3 + 1] = r * Math.sin(v);
          a[i * 3 + 2] = cz;
        }
      }
    } else if (page === "contact") {
      const lats = [-75, -50, -25, 0, 25, 50, 75];
      for (let i = 0; i < N; i++) {
        if (i % 3 < 2) {
          const lat = (lats[i % 7] * Math.PI) / 180;
          const lon = R() * Math.PI * 2;
          a[i * 3] = 23 * Math.cos(lat) * Math.cos(lon);
          a[i * 3 + 1] = 23 * Math.sin(lat);
          a[i * 3 + 2] = 23 * Math.cos(lat) * Math.sin(lon);
        } else {
          const lon = (i % 6) * Math.PI / 3;
          const lat = (R() * 2 - 1) * Math.PI / 2;
          a[i * 3] = 23 * Math.cos(lat) * Math.cos(lon);
          a[i * 3 + 1] = 23 * Math.sin(lat);
          a[i * 3 + 2] = 23 * Math.cos(lat) * Math.sin(lon);
        }
      }
    } else {
      for (let i = 0; i < N; i++) {
        if (i % 10 < 7) {
          const y = 1 - (i / (N - 1)) * 2;
          const r = Math.sqrt(Math.max(1 - y * y, 0));
          const th = i * 2.399963;
          a[i * 3] = Math.cos(th) * r * 26;
          a[i * 3 + 1] = y * 26;
          a[i * 3 + 2] = Math.sin(th) * r * 26;
        } else {
          const rr = 6 + R() * 12;
          const t = R() * 6.283;
          const ph = Math.acos(2 * R() - 1);
          a[i * 3] = rr * Math.sin(ph) * Math.cos(t);
          a[i * 3 + 1] = rr * Math.sin(ph) * Math.sin(t);
          a[i * 3 + 2] = rr * Math.cos(ph);
        }
      }
    }

    targetsRef.current[page] = a;
    return a;
  };

  const meshGeo = (page: KzPage) => {
    switch (page) {
      case "services":
        return new THREE.TorusKnotGeometry(14, 4, 88, 14);
      case "technology":
        return new THREE.IcosahedronGeometry(19, 1);
      case "infrastructure":
        return new THREE.CylinderGeometry(12, 12, 32, 16, 6, true);
      case "process":
        return new THREE.TorusGeometry(18.5, 4.3, 14, 56);
      case "about":
        return new THREE.DodecahedronGeometry(17, 1);
      case "contact":
        return new THREE.SphereGeometry(17, 22, 14);
      default:
        return new THREE.IcosahedronGeometry(18, 1);
    }
  };

  const rebuildLines = (page: KzPage) => {
    if (!lgeoRef.current || !targetRef.current || !lmatRef.current) return;
    const tar = targetRef.current;
    const thr =
      {
        home: 12,
        services: 9,
        technology: 9.5,
        infrastructure: 8.5,
        process: 9.5,
        about: 8.5,
        contact: 10.5,
      }[page] || 10;
    const M = Math.min(NRef.current, 140);
    const segs: number[] = [];
    const t2 = thr * thr;
    for (let i = 0; i < M && segs.length < 500; i++) {
      for (let j = i + 1; j < M; j++) {
        const a = i * 3;
        const b = j * 3;
        const dx = tar[a] - tar[b];
        const dy = tar[a + 1] - tar[b + 1];
        const dz = tar[a + 2] - tar[b + 2];
        if (dx * dx + dy * dy + dz * dz < t2) {
          segs.push(
            tar[a],
            tar[a + 1],
            tar[a + 2],
            tar[b],
            tar[b + 1],
            tar[b + 2]
          );
        }
      }
    }
    lgeoRef.current.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(segs, 3)
    );
    lgeoRef.current.attributes.position.needsUpdate = true;
    lineTargetRef.current = lineFullRef.current || 0.15;
  };

  const apply3DTheme = (currentTheme: string) => {
    if (!pmatRef.current) return;
    theme3dRef.current = currentTheme;
    const dark = currentTheme === "dark";
    const narrow = typeof window !== "undefined" ? window.innerWidth <= 1080 : false;

    const pmat = pmatRef.current;
    const lmat = lmatRef.current;
    const mmat = mmatRef.current;
    const hmat = hmatRef.current;
    const smat = smatRef.current;
    const rmat = rmatRef.current;

    if (dark) {
      pmat.color.set(0xa8d0ff);
      pmat.opacity = narrow ? 0.32 : 0.42;
      pmat.size = 1.85;
      pmat.blending = THREE.AdditiveBlending;
      if (lmat) {
        lmat.color.set(0x66b0ff);
        lineFullRef.current = 0.08;
        lmat.blending = THREE.AdditiveBlending;
      }
      if (mmat) {
        mmat.color.set(0xa38bff);
        mmat.opacity = 0.62;
        mmat.blending = THREE.AdditiveBlending;
      }
      if (hmat) {
        hmat.color.set(0xbdd1ff);
        hmat.opacity = 0.18;
        hmat.blending = THREE.AdditiveBlending;
      }
      if (smat) {
        smat.color.set(0x4ce8dd);
        smat.opacity = 0.42;
      }
      if (rmat) {
        rmat.color.set(0xa38bff);
        rmat.opacity = 0.18;
      }
    } else {
      pmat.color.set(0x2450c8);
      pmat.opacity = narrow ? 0.14 : 0.22;
      pmat.size = 1.95;
      pmat.blending = THREE.NormalBlending;
      if (lmat) {
        lmat.color.set(0x2450c8);
        lineFullRef.current = 0.04;
        lmat.blending = THREE.NormalBlending;
      }
      if (mmat) {
        mmat.color.set(0x5a35e6);
        mmat.opacity = 0.46;
        mmat.blending = THREE.NormalBlending;
      }
      if (hmat) {
        hmat.color.set(0x5a78c8);
        hmat.opacity = 0.18;
        hmat.blending = THREE.NormalBlending;
      }
      if (smat) {
        smat.color.set(0x008f86);
        smat.opacity = 0.32;
      }
      if (rmat) {
        rmat.color.set(0x5a35e6);
        rmat.opacity = 0.08;
      }
    }

    [pmat, lmat, mmat, hmat, smat, rmat].forEach((m) => {
      if (m) m.needsUpdate = true;
    });
    if (lineTargetRef.current > 0) lineTargetRef.current = lineFullRef.current;
  };

  const resize3D = () => {
    if (!rendererRef.current || !camRef.current || !sceneRef.current) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    rendererRef.current.setSize(w, h, false);
    camRef.current.aspect = w / h;
    camRef.current.updateProjectionMatrix();
    sceneRef.current.position.x = w > 1080 ? 15 : 0;
    sceneRef.current.position.y = w > 1080 ? 0 : 10;
    apply3DTheme(theme3dRef.current || theme);
  };

  const morphTo = (page: KzPage) => {
    if (!rendererRef.current) return;
    targetRef.current = formation(page);
    lineTargetRef.current = 0;
    if (ltRef.current) clearTimeout(ltRef.current);
    ltRef.current = setTimeout(() => rebuildLines(page), 1000);
    meshSwapRef.current = meshGeo(page);
    meshTargetScaleRef.current = 0.001;
  };

  useImperativeHandle(ref, () => ({ morphTo }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      canvas.style.display = "none";
      return;
    }
    rendererRef.current = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.75 : 2));

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const cam = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    camRef.current = cam;
    cam.position.z = 62;

    const group = new THREE.Group();
    groupRef.current = group;
    scene.add(group);

    const N = Math.round(isMobile ? 450 : 900);
    NRef.current = N;
    const pos = new Float32Array(N * 3);
    posRef.current = pos;
    const speed = new Float32Array(N);
    speedRef.current = speed;
    for (let i = 0; i < N; i++) speed[i] = 0.032 + Math.random() * 0.034;

    const t0 = formation("home");
    targetRef.current = t0;
    pos.set(t0);

    const geo = new THREE.BufferGeometry();
    pgeoRef.current = geo;
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const pmat = new THREE.PointsMaterial({
      size: 1.6,
      transparent: true,
      depthWrite: false,
      sizeAttenuation: true,
    });
    pmatRef.current = pmat;
    group.add(new THREE.Points(geo, pmat));

    const lmat = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    lmatRef.current = lmat;
    const lgeo = new THREE.BufferGeometry();
    lgeoRef.current = lgeo;
    const lines = new THREE.LineSegments(lgeo, lmat);
    linesRef.current = lines;
    group.add(lines);
    lineTargetRef.current = 0;

    const mmat = new THREE.MeshBasicMaterial({
      wireframe: true,
      transparent: true,
      depthWrite: false,
    });
    mmatRef.current = mmat;
    const mesh = new THREE.Mesh(meshGeo("home"), mmat);
    meshRef.current = mesh;
    mesh.scale.setScalar(0.001);
    meshTargetScaleRef.current = 1;
    group.add(mesh);

    // ambient haze
    const P = isMobile ? 70 : 140;
    const hp = new Float32Array(P * 3);
    for (let i = 0; i < P; i++) {
      const r = 46 + Math.random() * 66;
      const t = Math.random() * 6.283;
      const ph = Math.acos(2 * Math.random() - 1);
      hp[i * 3] = r * Math.sin(ph) * Math.cos(t);
      hp[i * 3 + 1] = r * Math.sin(ph) * Math.sin(t);
      hp[i * 3 + 2] = r * Math.cos(ph);
    }
    const hg = new THREE.BufferGeometry();
    hg.setAttribute("position", new THREE.BufferAttribute(hp, 3));
    const hmat = new THREE.PointsMaterial({
      size: 0.7,
      transparent: true,
      depthWrite: false,
    });
    hmatRef.current = hmat;
    const haze = new THREE.Points(hg, hmat);
    hazeRef.current = haze;
    scene.add(haze);

    // satellites + rings
    const satGroup = new THREE.Group();
    scene.add(satGroup);
    const smat = new THREE.MeshBasicMaterial({
      wireframe: true,
      transparent: true,
      depthWrite: false,
    });
    smatRef.current = smat;
    const sgeos = [
      new THREE.OctahedronGeometry(3.2, 0),
      new THREE.TetrahedronGeometry(3.5, 0),
      new THREE.IcosahedronGeometry(2.8, 0),
    ];
    const sats: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const m = new THREE.Mesh(sgeos[i % 3], smat);
      m.userData = {
        r: 46 + (i % 3) * 8 + Math.random() * 5,
        sp: 0.05 + Math.random() * 0.08,
        ph: Math.random() * 6.283,
        tilt: 0.5 + Math.random() * 0.9,
        rs: 0.4 + Math.random() * 0.6,
      };
      satGroup.add(m);
      sats.push(m);
    }
    satsRef.current = sats;

    const rmat = new THREE.MeshBasicMaterial({
      wireframe: true,
      transparent: true,
      depthWrite: false,
    });
    rmatRef.current = rmat;
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(33, 0.09, 5, 96), rmat);
    ring1.rotation.x = 1.05;
    ring1Ref.current = ring1;
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(39, 0.07, 5, 110), rmat);
    ring2.rotation.x = 2.1;
    ring2Ref.current = ring2;
    scene.add(ring1);
    scene.add(ring2);

    scrollYRef.current = window.scrollY;
    onPmRef.current = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        txRef.current = e.clientX / window.innerWidth - 0.5;
        tyRef.current = e.clientY / window.innerHeight - 0.5;
      }
    };
    window.addEventListener("pointermove", onPmRef.current, { passive: true });

    const onScroll = () => {
      scrollYRef.current = window.scrollY;
    };
    const onResize = () => {
      resize3D();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    apply3DTheme(theme);
    resize3D();

    let last = performance.now();
    const loop = (now: number) => {
      rafRef.current = requestAnimationFrame(loop);
      if (document.hidden) {
        last = now;
        return;
      }
      const dt = Math.min((now - last) / 16.7, 3);
      last = now;
      tRef.current += 0.0016 * dt * (reducedRef.current ? 0.3 : motion);
      const t = tRef.current;

      const posArr = posRef.current;
      const tar = targetRef.current;
      const sp = speedRef.current;
      if (posArr && tar && sp) {
        for (let i = 0; i < NRef.current; i++) {
          const k = sp[i] * dt;
          const j = i * 3;
          posArr[j] += (tar[j] - posArr[j]) * k;
          posArr[j + 1] += (tar[j + 1] - posArr[j + 1]) * k;
          posArr[j + 2] += (tar[j + 2] - posArr[j + 2]) * k;
        }
        pgeoRef.current!.attributes.position.needsUpdate = true;
      }

      if (groupRef.current) {
        groupRef.current.rotation.y = t * 1.35;
        groupRef.current.rotation.x =
          Math.sin(t * 1.1) * 0.16 + scrollYRef.current * 0.00022;
      }
      if (meshRef.current) {
        meshRef.current.rotation.y = -t * 2.1;
        meshRef.current.rotation.x = t * 1.5;
        const ms =
          meshRef.current.scale.x +
          (meshTargetScaleRef.current - meshRef.current.scale.x) * 0.06 * dt;
        meshRef.current.scale.setScalar(Math.max(ms, 0.001));
        if (meshSwapRef.current && ms < 0.06) {
          meshRef.current.geometry.dispose();
          meshRef.current.geometry = meshSwapRef.current;
          meshSwapRef.current = null;
          meshTargetScaleRef.current = 1;
        }
      }
      if (lmatRef.current) {
        lmatRef.current.opacity +=
          (lineTargetRef.current - lmatRef.current.opacity) * 0.05 * dt;
      }
      if (hazeRef.current) {
        hazeRef.current.rotation.y = -t * 0.35;
      }
      if (satsRef.current) {
        for (let i = 0; i < satsRef.current.length; i++) {
          const m = satsRef.current[i];
          const u = m.userData;
          const an = u.ph + t * u.sp * 14;
          m.position.set(
            Math.cos(an) * u.r,
            Math.sin(an * 0.9 + u.ph) * u.r * 0.28 * u.tilt,
            Math.sin(an) * u.r
          );
          m.rotation.x = t * 16 * u.rs;
          m.rotation.y = t * 12 * u.rs;
        }
        if (ring1Ref.current) ring1Ref.current.rotation.y = t * 1.6;
        if (ring2Ref.current) ring2Ref.current.rotation.y = -t * 1.2;
      }

      if (!reducedRef.current) {
        mxRef.current += (txRef.current - mxRef.current) * 0.04 * dt;
        myRef.current += (tyRef.current - myRef.current) * 0.04 * dt;
      }
      if (camRef.current) {
        camRef.current.position.x = mxRef.current * 14;
        camRef.current.position.y =
          -myRef.current * 10 - scrollYRef.current * 0.012;
        camRef.current.lookAt(0, 0, 0);
      }

      renderer.render(scene, cam);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (ltRef.current) clearTimeout(ltRef.current);
      if (onPmRef.current) window.removeEventListener("pointermove", onPmRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);

      renderer.dispose();
      pgeoRef.current?.dispose();
      pmatRef.current?.dispose();
      lgeoRef.current?.dispose();
      lmatRef.current?.dispose();
      mmatRef.current?.dispose();
      meshRef.current?.geometry.dispose();
      hmatRef.current?.dispose();
      hg.dispose();
      smatRef.current?.dispose();
      rmatRef.current?.dispose();
      satsRef.current.forEach((m) => m.geometry.dispose());
      ring1Ref.current?.geometry.dispose();
      ring2Ref.current?.geometry.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to theme changes
  useEffect(() => {
    if (rendererRef.current) {
      apply3DTheme(theme);
    }
  }, [theme]);

  // Keep the 3D formation in sync with the current route.
  useEffect(() => {
    if (rendererRef.current) {
      morphTo(pathnameToPage(pathname));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        width: "100%",
        height: "100%",
      }}
    />
  );
}
