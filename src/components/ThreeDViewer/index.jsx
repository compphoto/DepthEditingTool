import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Points } from "@react-three/drei";
import { ToneMapping, EffectComposer } from "@react-three/postprocessing";
import { useControls } from "leva";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import { DoubleSide } from "three";
import { Input } from "reactstrap";
import ThreeDViewerStyle from "./style";
import { getImageUrl } from "utils/getImageFromFile";
import TestPCD from "assets/test.pcd";
import PCDLoader from "utils/PCDLoader";

export function ThreeDViewer({ rgbImageCanvas, depthImageCanvas }) {
  const [imageDimension, setImageDimension] = useState(1.0);
  const [pcdPoints, setPcdPoints] = useState(false);
  const [colorMap, setColorMap] = useState(false);
  const [displacementMap, setDisplacementMap] = useState(false);
  const [angle, setAngle] = useState({
    xAngle: 0,
    vAngle: 0
  });
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
  const onHandleChange = e => {
    let { name, value } = e.target;
    setAngle({ ...angle, [name]: (value / 180) * Math.PI });
  };
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

  useEffect(() => {
    const loader = new PCDLoader();
    loader.load(TestPCD, function (points) {
      points.geometry.center();
      points.geometry.rotateX(Math.PI);
      // scene.add(points);
      setPcdPoints(points);
    });
  }, []);

  return (
    <ThreeDViewerStyle>
      <div className="v-slider">
        <Input onChange={onHandleChange} id="vAngle" name="vAngle" orient="vertical" min="-45" max="45" type="range" />
      </div>
      <div className="x-div">
        <Canvas camera={{ fov: 75, near: 0.1, far: 100, position: [0, 0, 2] }}>
          <Suspense fallback={null}>
            <ambientLight intensity={-1} />
            <pointLight position={[0, 4, 4]} />
            {/* <spotLight color={0xffa95c} intensity={4} position={[-50, 50, 50]} />
          <hemisphereLight color={0xffeeb1} groundColor={0x080820} intensity={4} /> */}
            <mesh scale={[1.0, imageDimension, 1.0]} rotation={[angle.vAngle, angle.xAngle, 0]}>
              <planeBufferGeometry args={[2, 2, 2000, 2000]} />
              <meshStandardMaterial
                side={DoubleSide}
                map={colorMap}
                displacementMap={displacementMap}
                displacementScale={0.7}
              />
            </mesh>
            <OrbitControls
              // autoRotate
              // enableZoom={false}
              // enablePan={false}
              maxAzimuthAngle={Math.PI / 4}
              maxPolarAngle={Math.PI}
              minAzimuthAngle={-Math.PI / 4}
              minPolarAngle={0}
            />
            {/* <EffectComposer>
            <ToneMapping middleGrey={middleGrey} maxLuminance={maxLuminance} />
          </EffectComposer> */}
          </Suspense>
        </Canvas>
        <div className="x-slider">
          <Input onChange={onHandleChange} id="xAngle" name="xAngle" min="-45" max="45" type="range" />
        </div>
      </div>
    </ThreeDViewerStyle>
  );
}

export default ThreeDViewer;
