import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Decal, Environment, Center } from '@react-three/drei';
import * as THREE from 'three';

interface ThreeDProductViewerProps {
  color: string;
  productType?: "TSHIRT" | "HOODIE";
  frontTextureUrl?: string;
  backTextureUrl?: string;
  viewSide?: "front" | "back";
  autoRotate?: boolean;
}

const Shirt = ({ color, productType, frontTextureUrl, backTextureUrl }: ThreeDProductViewerProps) => {
  const { nodes } = useGLTF('/shirt_baked.glb') as any;

  // Use a texture loader to load the URLs as textures
  const frontTexture = useMemo(() => {
    if (!frontTextureUrl) return null;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    return loader.load(frontTextureUrl);
  }, [frontTextureUrl]);

  const backTexture = useMemo(() => {
    if (!backTextureUrl) return null;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    return loader.load(backTextureUrl);
  }, [backTextureUrl]);

  if (frontTexture) frontTexture.anisotropy = 16;
  if (backTexture) backTexture.anisotropy = 16;

  // Create a base material with the selected color
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: color || '#ffffff',
      roughness: 1,
    });
  }, [color]);

  // Find the first mesh node in the loaded GLTF model
  const mesh = useMemo(() => {
    return Object.values(nodes).find((node: any) => node.isMesh) as THREE.Mesh;
  }, [nodes]);

  if (!mesh) return null;

  return (
    <group>
      <mesh
        castShadow
        geometry={mesh.geometry}
        material={material}
        dispose={null}
      >
        {frontTexture && (
          <Decal
            position={[0, 0.04, 0.15]}
            rotation={[0, 0, 0]}
            scale={0.15}
            map={frontTexture}
          />
        )}
        {backTexture && (
          <Decal
            position={[0, 0.04, -0.15]}
            rotation={[0, Math.PI, 0]}
            scale={0.15}
            map={backTexture}
          />
        )}
      </mesh>

      {/* If productType is HOODIE, add a hood and a pocket */}
      {productType === "HOODIE" && (
        <group>
          {/* Hood */}
          <mesh position={[0, 0.35, -0.08]} material={material}>
            <sphereGeometry args={[0.15, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
          </mesh>
          {/* Front Pocket */}
          <mesh position={[0, -0.2, 0.13]} rotation={[0.1, 0, 0]} material={material}>
            <boxGeometry args={[0.2, 0.15, 0.02]} />
          </mesh>
          {/* Long Sleeves (Left) */}
          <mesh position={[-0.32, -0.05, 0]} rotation={[0, 0, -Math.PI / 4]} material={material}>
            <cylinderGeometry args={[0.07, 0.05, 0.35, 32]} />
          </mesh>
          {/* Long Sleeves (Right) */}
          <mesh position={[0.32, -0.05, 0]} rotation={[0, 0, Math.PI / 4]} material={material}>
            <cylinderGeometry args={[0.07, 0.05, 0.35, 32]} />
          </mesh>
        </group>
      )}
    </group>
  );
};

// Preload the model
useGLTF.preload('/shirt_baked.glb');

import { useFrame } from '@react-three/fiber';

const ModelGroup = ({ viewSide, children }: { viewSide: "front" | "back", children: React.ReactNode }) => {
  const group = React.useRef<THREE.Group>(null);
  useFrame(() => {
    if (group.current) {
      const targetRotation = viewSide === "back" ? Math.PI : 0;
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotation, 0.1);
    }
  });
  return <group ref={group}>{children}</group>;
};

const ThreeDProductViewer: React.FC<ThreeDProductViewerProps> = (props) => {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        shadows
        camera={{ position: [0, 0, 2.5], fov: 25 }}
        gl={{ preserveDrawingBuffer: true }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.5} />
        <Environment preset="city" />
        <directionalLight intensity={0.5} position={[10, 10, 10]} />
        <Suspense fallback={null}>
          <Center>
            <ModelGroup viewSide={props.viewSide || "front"}>
              <Shirt {...props} />
            </ModelGroup>
          </Center>
        </Suspense>
        <OrbitControls 
          enablePan={false}
          minDistance={1.5}
          maxDistance={4}
          autoRotate={props.autoRotate}
          autoRotateSpeed={4}
        />
      </Canvas>
    </div>
  );
};

export default ThreeDProductViewer;
