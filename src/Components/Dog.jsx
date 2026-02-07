import React, { useEffect, useRef } from "react";
import * as THREE from 'three';
import { OrbitControls, useGLTF, useTexture, useAnimations } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { normalMap } from "three/tsl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

export default function Dog() {

  gsap.registerPlugin(useGSAP, ScrollTrigger);
gsap.registerPlugin(ScrollTrigger, useGSAP);

  const model = useGLTF("/models/dog.drc.glb");

  const { actions } = useAnimations(model.animations, model.scene);

  const navRef = useRef();
const leftRef = useRef();
const rightRef = useRef();



  useEffect(() => { 
    if (actions && actions["Take 001"]) {
      actions["Take 001"].play();
    }
  }, [actions]);

  // useThree(({ camera, scene, gl }) => {
  //   camera.position.z = .8;
  //   gl.toneMapping = THREE.ReinhardToneMapping
  //   gl.outputColorSpace = THREE.SRGBColorSpace
  // });

useThree(({ camera, gl, size }) => {
  const w = size.width;

  // 🔥 Restore proper color + brightness
   gl.toneMapping = THREE.ReinhardToneMapping
    gl.outputColorSpace = THREE.SRGBColorSpace
  gl.toneMappingExposure = 1.5;
  // gl.outputColorSpace = THREE.SRGBColorSpace;

  if (w < 480) {
    camera.position.set(0, 0.05, 1.5);
    camera.fov = 60;
  } else if (w < 768) {
    camera.position.set(0, 0.03, 1.25);
    camera.fov = 52;
  } else {
    camera.position.set(0, 0.02, 1.3);
    camera.fov = 45;
  }

  camera.updateProjectionMatrix();
});



  // const textures = useTexture({
  //     normalMap: "/models/dog_normals.jpg",
  //     sampleMatCap: "/matcap/mat-2.png"
  // })

  const [normalMap, sampleMatCap] = useTexture([
    "/models/dog_normals.jpg",
    "/matcap/mat-2.png",
  ]).map((texture) => {
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  });

  const [branchNormalMap, branchMap] = useTexture([
    
    "/models/branches_normals.jpeg",
    "/models/branches_diffuse.jpeg",
  ]).map((texture) => {
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  });

  // const dogMaterial = new THREE.MeshMatcapMaterial({
  //   normalMap: normalMap,
  //   matcap: sampleMatCap
  // })

  // const branchMaterial = new THREE.MeshStandardMaterial({
  // map: branchMap,
  // normalMap: branchNormalMap,
  // roughness: .6,
  // metalness: 0.1
  // });


  const matcaps = useTexture([
  "/matcap/mat-2.png",  // default
  "/matcap/mat1.png",
  "/matcap/mat3.png",
  "/matcap/mat10.png",
  
  "/matcap/mat6.png",
  "/matcap/mat8.png",
  "/matcap/mat7.png",
  "/matcap/mat5.png",
  
]).map((t) => {
  t.flipY = false;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
});


const sharedMatcapMaterial = useRef();

if (!sharedMatcapMaterial.current) {
  sharedMatcapMaterial.current = new THREE.MeshMatcapMaterial({
    matcap: matcaps[0], // default mat-2.png
    normalMap: normalMap
  });
}





  // textures.normalMap.flipY = false;
  // textures.sampleMatCap.colorSpace = THREE.SRGBColorSpace;

  // model.scene.traverse((child) => {

  //   if (child.name.includes("DOG")) {
  //     // child.material = new THREE.MeshMatcapMaterial({
  //     // normalMap: normalMap,
  //     // matcap: sampleMatCap
  //     child.material = dogMaterial
  //     // })
  //   }
  //   else{
  //     child.material = branchMaterial
  //   }
  // })


  model.scene.traverse((child) => {
  if (child.isMesh) {
    if (
      child.name.includes("DOG") ||
      child.name.includes("BRANCH")
    ) {
      child.material = sharedMatcapMaterial.current;
      child.material.needsUpdate = true;
    }
  }
});

  const dogModel = useRef(model);

  useGSAP(() => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#section-1",
      endTrigger: "#section-3",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
    }
  });

  tl.to(dogModel.current.scene.position, {
    z: "-=0.5",
    y: "+=0.01"
  })
  .to(dogModel.current.scene.rotation, {
    x: `+=${Math.PI / 50}`
  })
  .to(dogModel.current.scene.rotation, {
    x: `+=${Math.PI / 900}`,
    // y:"-0.1",
    y: `-=${Math.PI}`
  })
  tl.to(dogModel.current.scene.position, {
    z: "+=0.5",
    x:"-.2",
    // y: "+=0.01"
  })
  });   

useEffect(() => {
  const titles = document.querySelectorAll(".title");

  titles.forEach((title, index) => {
    title.addEventListener("mouseenter", () => {
      gsap.to(sharedMatcapMaterial.current, {
        duration: 0.6,
        onUpdate: () => {
          sharedMatcapMaterial.current.matcap = matcaps[index + 1];
        }
      });
    });

    title.addEventListener("mouseleave", () => {
      gsap.to(sharedMatcapMaterial.current, {
        duration: 0.6,
        onUpdate: () => {
          sharedMatcapMaterial.current.matcap = matcaps[0];
        }
      });
    });
  });

  return () => titles.forEach(t => t.replaceWith(t.cloneNode(true)));
}, []);


  

  return (
    <>
      <primitive
        object={model.scene}
        position={[0.2, -0.6, 0.2]}
        rotation={[0, Math.PI / 3.9, 0]}
      />

      <ambientLight intensity={0.6} />
      <directionalLight position={[0, 5, 5]} color={0xFFFFFF} intensity={10} />

      <OrbitControls enableZoom={true} />
    </>
  );
}
