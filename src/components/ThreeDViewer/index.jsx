import React, { Suspense } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import ThreeDViewerStyle from "./style";

import RGBImage from "assets/images/jpg/rgb1.png";
import DepthImage from "assets/images/jpg/depth1.png";

export function ThreeDViewer({}) {
  const [colorMap, displacementMap] = useLoader(TextureLoader, [RGBImage, DepthImage]);
  return (
    <ThreeDViewerStyle>
      <Canvas camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 0, 2] }}>
        <Suspense fallback={null}>
          <ambientLight intensity={-1} />
          <pointLight position={[0, 4, 4]} />
          <mesh scale={0.5}>
            <planeBufferGeometry args={[3, 3, 100, 100]} />
            <meshStandardMaterial map={colorMap} displacementMap={displacementMap} />
          </mesh>
          <OrbitControls
          // autoRotate
          // enableZoom={false}
          // enablePan={false}
          // minPolarAngle={Math.PI / 2.8}
          // maxPolarAngle={Math.PI / 2.8}
          />
        </Suspense>
      </Canvas>
    </ThreeDViewerStyle>
  );
}

export default ThreeDViewer;
