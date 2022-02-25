import React, { Suspense, useEffect, useState, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import { DoubleSide } from "three";
import { Input } from "reactstrap";
import ThreeDViewerStyle from "./style";

function Camera(props) {
  const ref = useRef();
  const set = useThree(state => state.set);
  useEffect(() => void set({ camera: ref.current }), []);
  useFrame(() => ref.current.updateMatrixWorld());
  return <perspectiveCamera ref={ref} {...props} />;
}

export function ThreeDViewer({ rgbImageCanvas, depthImageCanvas }) {
  const [imageDimension, setImageDimension] = useState(1.0);
  const [colorMap, setColorMap] = useState(false);
  const [displacementMap, setDisplacementMap] = useState(false);
  const [focalLength, setFocalLength] = useState(75);
  const [angle, setAngle] = useState({
    hAngle: 0,
    vAngle: 0
  });
  const onHandleChange = e => {
    let { name, value } = e.target;
    if (name === "focalLength") {
      setFocalLength(+value);
    } else {
      setAngle({ ...angle, [name]: (value / 180) * Math.PI });
    }
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
  return (
    <ThreeDViewerStyle>
      <div className="v-slider">
        <Input onChange={onHandleChange} id="vAngle" name="vAngle" orient="vertical" min="-45" max="45" type="range" />
      </div>
      <div className="x-div">
        <div className="x-slider">
          <Input onChange={onHandleChange} id="focalLength" name="focalLength" min="12" max="300" type="range" />
        </div>
        <Canvas>
          <Camera fov={75} near={0.1} far={100} position={[0, 0, 2]} />
          <Suspense fallback={null}>
            <ambientLight intensity={-1} />
            <group rotation={[angle.vAngle, angle.hAngle, 0]}>
              <pointLight position={[0, 4, 4]} />
              <mesh scale={[1.0, imageDimension, 1.0]}>
                <planeBufferGeometry args={[2, 2, 2000, 2000]} />
                <meshStandardMaterial
                  side={DoubleSide}
                  map={colorMap}
                  displacementMap={displacementMap}
                  displacementScale={0.7}
                />
              </mesh>
              <OrbitControls
                maxAzimuthAngle={Math.PI / 4}
                maxPolarAngle={Math.PI}
                minAzimuthAngle={-Math.PI / 4}
                minPolarAngle={0}
              />
            </group>
          </Suspense>
        </Canvas>
        <div className="x-slider">
          <Input onChange={onHandleChange} id="hAngle" name="hAngle" min="-45" max="45" type="range" />
        </div>
      </div>
    </ThreeDViewerStyle>
  );
}

export default ThreeDViewer;
