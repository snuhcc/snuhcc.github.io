"use client";

import dynamic from "next/dynamic";

const ShaderGradientCanvas = dynamic(
  () => import("@shadergradient/react").then((m) => m.ShaderGradientCanvas),
  { ssr: false }
);
const ShaderGradient = dynamic(
  () => import("@shadergradient/react").then((m) => m.ShaderGradient),
  { ssr: false }
);

export default function ShaderHero() {
  return (
    <ShaderGradientCanvas
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: "scale(1.5)", transformOrigin: "center center" }}
      pixelDensity={1}
      fov={45}
    >
      <ShaderGradient
        type="waterPlane"
        animate="on"
        color1="#8bbde8"
        color2="#3a6bc4"
        color3="#0B3D91"
        uSpeed={0.15}
        uStrength={1.3}
        uDensity={1.5}
        uFrequency={0}
        uAmplitude={0}
        cAzimuthAngle={180}
        cDistance={2.8}
        cPolarAngle={80}
        cameraZoom={9.1}
        grain="on"
        lightType="3d"
        envPreset="city"
        brightness={1}
        reflection={0.1}
        rotationX={50}
        rotationY={0}
        rotationZ={-60}
      />
    </ShaderGradientCanvas>
  );
}
