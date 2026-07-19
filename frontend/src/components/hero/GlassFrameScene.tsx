"use client";

/**
 * Original working glass frame — first decent port of the demo script.
 * Thick RoundedBox + USDC logo + reflections. No later experiments.
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const BG = 0x020617;
const USDC_LOGO = "/usdc-logo.png";
const HDR_URL =
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/royal_esplanade_1k.hdr";

type Props = {
  onReady?: () => void;
  className?: string;
};

export function GlassFrameScene({ onReady, className }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let frameId = 0;
    let readyFired = false;

    const fireReady = () => {
      if (readyFired || disposed) return;
      readyFired = true;
      onReady?.();
    };

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BG);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 6.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setClearColor(BG, 1);
    mount.appendChild(renderer.domElement);

    const setSize = () => {
      if (disposed) return;
      const w = Math.max(1, mount.clientWidth || window.innerWidth);
      const h = Math.max(1, mount.clientHeight || window.innerHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, true);
    };
    setSize();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.autoRotate = false;

    // Lights — original setup + soft accent for more depth around the frame
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    scene.add(new THREE.HemisphereLight(0x7dd3fc, 0x020617, 0.35));

    const backLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    backLight.position.set(-5, 2, -10);
    scene.add(backLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 1.8);
    topLight.position.set(0, 10, 0);
    scene.add(topLight);

    const frontLight = new THREE.DirectionalLight(0xffffff, 1.25);
    frontLight.position.set(0, 2, 10);
    scene.add(frontLight);

    const accent = new THREE.PointLight(0x22d3ee, 1.15, 14, 2);
    accent.position.set(1.8, 0.6, 3.2);
    scene.add(accent);

    const accentB = new THREE.PointLight(0x6366f1, 0.7, 12, 2);
    accentB.position.set(-2.2, -0.4, 2.4);
    scene.add(accentB);

    // Environment
    const pmrem = new THREE.PMREMGenerator(renderer);

    const applyLocalEnv = () => {
      if (disposed) return;
      try {
        const EnvCtor = RoomEnvironment as unknown as new () => object;
        const envScene = new EnvCtor() as THREE.Scene;
        const { texture } = pmrem.fromScene(envScene, 0.04);
        scene.environment = texture;
        if ("environmentIntensity" in scene) {
          (scene as THREE.Scene & { environmentIntensity: number }).environmentIntensity =
            1.1;
        }
      } catch {
        /* optional */
      }
    };

    let hdrTexture: THREE.Texture | null = null;
    const hdrTimeout = window.setTimeout(applyLocalEnv, 2500);

    new RGBELoader().load(
      HDR_URL,
      (texture) => {
        window.clearTimeout(hdrTimeout);
        if (disposed) {
          texture.dispose();
          return;
        }
        texture.mapping = THREE.EquirectangularReflectionMapping;
        hdrTexture = texture;
        scene.environment = texture;
        if ("environmentIntensity" in scene) {
          (scene as THREE.Scene & { environmentIntensity: number }).environmentIntensity =
            1.1;
        }
      },
      undefined,
      () => {
        window.clearTimeout(hdrTimeout);
        applyLocalEnv();
      },
    );

    // Group
    const group = new THREE.Group();
    scene.add(group);

    // --- USDC Logo ---
    const photoGeo = new THREE.PlaneGeometry(1.4, 1.4);
    const photoMat = new THREE.MeshStandardMaterial({
      side: THREE.DoubleSide,
      color: 0xffffff,
      roughness: 0.15,
      metalness: 0.1,
      transparent: true,
    });
    const photoMesh = new THREE.Mesh(photoGeo, photoMat);
    photoMesh.position.set(0, 0, 0.05);
    photoMesh.renderOrder = 0;
    group.add(photoMesh);

    new THREE.TextureLoader().load(
      USDC_LOGO,
      (tex) => {
        if (disposed) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        photoMat.map = tex;
        photoMat.needsUpdate = true;
        fireReady();
      },
      undefined,
      () => fireReady(),
    );

    // --- Glass Frame ---
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 1.0,
      opacity: 1.0,
      metalness: 0.0,
      roughness: 0.0,
      ior: 1.5,
      thickness: 1.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.0,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const glassMesh = new THREE.Mesh(
      new RoundedBoxGeometry(2.3, 2.3, 0.9, 32, 0.28),
      glassMat,
    );
    glassMesh.renderOrder = 1;
    group.add(glassMesh);

    const readyTimeout = window.setTimeout(fireReady, 4000);

    // --- Animation ---
    const clock = new THREE.Clock();
    let time = 0;

    const animate = () => {
      if (disposed) return;
      frameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      time += delta;

      group.rotation.y += delta * 0.35;
      group.rotation.x = Math.sin(time * 0.4) * 0.12;
      group.rotation.z = Math.sin(time * 0.3) * 0.08;
      group.position.y = Math.sin(time * 0.6) * 0.08;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => setSize();
    window.addEventListener("resize", onResize);
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => setSize())
        : null;
    ro?.observe(mount);

    return () => {
      disposed = true;
      window.clearTimeout(hdrTimeout);
      window.clearTimeout(readyTimeout);
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
      controls.dispose();
      photoGeo.dispose();
      photoMat.map?.dispose();
      photoMat.dispose();
      glassMesh.geometry.dispose();
      glassMat.dispose();
      hdrTexture?.dispose();
      if (scene.environment && scene.environment !== hdrTexture) {
        scene.environment.dispose();
      }
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [onReady]);

  return (
    <div
      ref={mountRef}
      className={className}
      id="hero-3d"
      style={{ width: "100%", height: "100%" }}
      aria-hidden
    />
  );
}
