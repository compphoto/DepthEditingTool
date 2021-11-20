import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { ToneMapping, EffectComposer } from "@react-three/postprocessing";
import { useControls } from "leva";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import { DoubleSide } from "three";
import ThreeDViewerStyle from "./style";
import { getImageUrl } from "utils/getImageFromFile";

export function ThreeDViewer({ rgbImageCanvas, depthImageCanvas }) {
  const [imageDimension, setImageDimension] = useState(1.0);
  const [colorMap, setColorMap] = useState(false);
  const [displacementMap, setDisplacementMap] = useState(false);
  // const { middleGrey, maxLuminance } = useControls({
  //   middleGrey: {
  //     min: 0,
  //     max: 1,
  //     value: 0.6,
  //     step: 0.1
  //   },
  //   maxLuminance: {
  //     min: 0,
  //     max: 64,
  //     value: 16,
  //     step: 1
  //   }
  // });

  useEffect(() => {
    let colorMap = new TextureLoader().setCrossOrigin("").load(rgbImageCanvas, colorMap => {
      colorMap.needsUpdate = true;
      setImageDimension(colorMap.image.height / colorMap.image.width);
    });
    setColorMap(colorMap);
  }, [rgbImageCanvas]);

  useEffect(() => {
    let displacementMap = new TextureLoader().setCrossOrigin("").load(depthImageCanvas);
    setDisplacementMap(displacementMap);
  }, [depthImageCanvas]);

  return (
    <ThreeDViewerStyle>
      <Canvas camera={{ fov: 75, near: 0.1, far: 100, position: [0, 0, 2] }}>
        <Suspense fallback={null}>
          <ambientLight intensity={-1} />
          <pointLight position={[0, 4, 4]} />
          {/* <spotLight color={0xffa95c} intensity={4} position={[-50, 50, 50]} />
          <hemisphereLight color={0xffeeb1} groundColor={0x080820} intensity={4} /> */}
          <mesh scale={[1.0, imageDimension, 1.0]}>
            <planeBufferGeometry args={[2, 2, 2000, 2000]} />
            <meshStandardMaterial
              side={DoubleSide}
              map={colorMap}
              displacementMap={displacementMap}
              displacementScale={1}
            />
          </mesh>
          <OrbitControls
          // autoRotate
          // enableZoom={false}
          // enablePan={false}
          // minPolarAngle={Math.PI / 2.8}
          // maxPolarAngle={Math.PI / 2.8}
          />
          {/* <EffectComposer>
            <ToneMapping middleGrey={middleGrey} maxLuminance={maxLuminance} />
          </EffectComposer> */}
        </Suspense>
      </Canvas>
    </ThreeDViewerStyle>
  );
}

export default ThreeDViewer;
